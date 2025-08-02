import os
import pickle
import numpy as np
import gdown
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import google.generativeai as genai
from dotenv import load_dotenv

# === Load environment variables ===
load_dotenv()
API_KEY = os.getenv("DisesSugesstionAPIKey")
if not API_KEY:
    raise EnvironmentError("❌ API Key not found. Please set 'DisesSugesstionAPIKey' in your .env file.")

# === Paths and constants ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_URL = "https://drive.google.com/uc?id=1FiSttTj-3mD_4AOGFMgoztoZ6wCaidaR"
MODEL_PATH = os.path.join(BASE_DIR, "temp_model.h5")
CLASS_MAP_PATH = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")

# === Download model from Google Drive ===
def download_model():
    print("⬇️ Downloading model...")
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    gdown.download(MODEL_URL, output=MODEL_PATH, quiet=False, fuzzy=True)
    print("✅ Model downloaded successfully.")

# === Load model and class index map ===
try:
    download_model()
    model = load_model(MODEL_PATH, compile=False)
    print("✅ Model loaded successfully.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load Keras model: {e}")
finally:
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)

# === Load class mapping ===
try:
    with open(CLASS_MAP_PATH, "rb") as f:
        class_indices = pickle.load(f)
        index_to_class = {v: k for k, v in class_indices.items()}
except Exception as e:
    raise FileNotFoundError(f"❌ Failed to load class map: {e}")

# === Generate suggestion using Gemini ===
def Sugesstion(disease_name: str) -> str:
    genai.configure(api_key=API_KEY)
    gemini = genai.GenerativeModel(model_name="gemini-1.5-flash")
    try:
        response = gemini.generate_content(
            f"""
            Disease name: {disease_name}
            Please provide:
            1. How this disease occurs.
            2. How to prevent or cure it.
            Keep the response short and in bullet points.
            """
        )
        return response.text.strip()
    except Exception as e:
        return f"⚠️ Gemini API error: {e}"

# === Predict disease from image ===
def predict_disease(image_file: Image.Image) -> dict:
    try:
        img = image_file.resize((128, 128)).convert("RGB")
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        predicted_index = np.argmax(predictions[0])
        predicted_class = index_to_class.get(predicted_index, "Unknown")

        suggestion_text = Sugesstion(predicted_class)

        return {
            "disease": predicted_class,
            "suggestion": [suggestion_text]
        }
    except Exception as e:
        return {
            "disease": "Prediction Failed",
            "suggestion": [f"Error during prediction: {e}"]
        }
