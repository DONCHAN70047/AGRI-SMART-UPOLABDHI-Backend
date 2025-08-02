import os
import io
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
    raise ValueError("Missing DisesSugesstionAPIKey in your .env file.")

# === Paths and constants ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_URL = "https://drive.google.com/uc?id=1FiSttTj-3mD_4AOGFMgoztoZ6wCaidaR"
MODEL_PATH = os.path.join(BASE_DIR, "temp_model.h5")
CLASS_MAP_PATH = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")

# === Download model from Google Drive ===
def download_model():
    if not os.path.exists(MODEL_PATH):  # Avoid redownloading every time
        gdown.download(MODEL_URL, output=MODEL_PATH, quiet=False, fuzzy=True)

# === Load model and class index map ===
download_model()

try:
    model = load_model(MODEL_PATH, compile=False)
except Exception as e:
    raise RuntimeError("❌ Failed to load Keras model.") from e

# === Load class mapping ===
try:
    with open(CLASS_MAP_PATH, "rb") as f:
        class_indices = pickle.load(f)
except FileNotFoundError:
    raise FileNotFoundError(f"❌ Class mapping file not found: {CLASS_MAP_PATH}")

index_to_class = {v: k for k, v in class_indices.items()}

# === Generate suggestion using Gemini ===
def Sugesstion(disease_name: str) -> str:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    response = model.generate_content(
        f"""
        Disease Name: {disease_name}
        Please provide:
        • How this disease occurs
        • How to prevent or treat it
        Respond in 4-5 short bullet points only.
        """
    )
    return response.text.strip()

# === Predict disease from image ===
def predict_disease(image_file: Image.Image) -> dict:
    img = image_file.resize((128, 128)).convert("RGB")
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    predicted_class = index_to_class.get(predicted_index, "Unknown")

    suggestion_text = Sugesstion(predicted_class)

    return {
        "disease": predicted_class,
        "suggestion": suggestion_text.split("\n")
    }
