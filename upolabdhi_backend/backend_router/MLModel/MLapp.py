import os
import pickle
import numpy as np
from PIL import Image
import onnxruntime as ort
import google.generativeai as genai
from dotenv import load_dotenv
import requests

# === Load .env variables ===
load_dotenv()
API_KEY = os.getenv("DisesSugesstionAPIKey")
if not API_KEY:
    raise EnvironmentError("❌ API Key not found in .env")

# === Convert Google Drive link to direct download ===
def download_from_gdrive(file_id: str, dest_path: str):
    URL = f"https://drive.google.com/uc?export=download&id={file_id}"
    response = requests.get(URL, stream=True)
    if response.status_code == 200:
        with open(dest_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print("✅ Model downloaded from Google Drive.")
    else:
        raise RuntimeError("❌ Failed to download ONNX model from Google Drive.")

# === Paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.onnx")
CLASS_MAP_PATH = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")

# === Google Drive file ID (from your link) ===
GDRIVE_FILE_ID = "1JxMYcDvzB1izadXdJN2IL0Q-LmR2wXXO"

# === Download model if not already present ===
if not os.path.exists(MODEL_PATH):
    download_from_gdrive(GDRIVE_FILE_ID, MODEL_PATH)

# === Load class map ===
with open(CLASS_MAP_PATH, "rb") as f:
    class_indices = pickle.load(f)
index_to_class = {v: k for k, v in class_indices.items()}

# === Load ONNX model ===
try:
    ort_session = ort.InferenceSession(MODEL_PATH)
    print("✅ ONNX model loaded.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load ONNX model: {e}")

# === Gemini-based suggestion ===
def Sugesstion(disease_name: str) -> str:
    genai.configure(api_key=API_KEY)
    gemini = genai.GenerativeModel(model_name="gemini-1.5-flash")
    try:
        response = gemini.generate_content(
            f"""Disease name: {disease_name}
            1. How it occurs
            2. How to cure or prevent it
            Keep it short and in bullet points."""
        )
        return response.text.strip()
    except Exception as e:
        return f"⚠️ Gemini API error: {e}"

# === Predict disease ===
def predict_disease(image_file: Image.Image) -> dict:
    try:
        img = image_file.resize((128, 128)).convert("RGB")
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)  # NHWC

        input_name = ort_session.get_inputs()[0].name
        output_name = ort_session.get_outputs()[0].name
        result = ort_session.run([output_name], {input_name: img_array})[0]

        predicted_index = int(np.argmax(result[0]))
        predicted_class = index_to_class.get(predicted_index, "Unknown")
        suggestion = Sugesstion(predicted_class)

        return {
            "disease": predicted_class,
            "suggestion": [suggestion]
        }

    except Exception as e:
        return {
            "disease": "Prediction Failed",
            "suggestion": [f"Error during prediction: {e}"]
        }
