import os
import pickle
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image
import google.generativeai as genai
from dotenv import load_dotenv
import gdown

# === Load environment variables ===
load_dotenv()
API_KEY = os.getenv("DisesSugesstionAPIKey")
if not API_KEY:
    raise ValueError("❌ Missing 'DisesSugesstionAPIKey' in your .env file.")

# === Paths and constants ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_URL = "https://drive.google.com/uc?id=1FiSttTj-3mD_4AOGFMgoztoZ6wCaidaR"
MODEL_PATH = os.path.join(BASE_DIR, "temp_model.h5")
CLASS_MAP_PATH = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")

# === Download model from Google Drive if not exists ===
def download_model():
    if not os.path.exists(MODEL_PATH):
        print("📥 Downloading model from Google Drive...")
        gdown.download(MODEL_URL, output=MODEL_PATH, quiet=False, fuzzy=True)

# === Load model and class mapping ===
download_model()
try:
    model = load_model(MODEL_PATH)
    print("✅ Model loaded successfully.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load Keras model: {e}")

try:
    with open(CLASS_MAP_PATH, "rb") as f:
        class_indices = pickle.load(f)
    print("✅ Class map loaded.")
except FileNotFoundError:
    raise FileNotFoundError(f"❌ Class mapping file not found: {CLASS_MAP_PATH}")

# Reverse the class index mapping
index_to_class = {v: k for k, v in class_indices.items()}

# === Get Gemini AI suggestions ===
def get_suggestion(disease_name: str) -> str:
    genai.configure(api_key=API_KEY)
    model_gemini = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
    Disease: {disease_name}
    Please provide:
    • Causes
    • Prevention
    • Cure or treatment
    • Environmental factors
    • Suggested actions
    Format the response as 4-5 bullet points.
    """
    try:
        response = model_gemini.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"⚠️ Gemini API Error: {e}")
        return "Gemini API failed to provide suggestions."

# === Predict disease from image ===
def predict_disease(image_file: Image.Image) -> dict:
    try:
        img = image_file.resize((128, 128)).convert("RGB")
        img_array = keras_image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)
        predicted_index = int(np.argmax(predictions[0]))
        predicted_class = index_to_class.get(predicted_index, "Unknown")

        suggestion_text = get_suggestion(predicted_class)

        return {
            "disease": predicted_class,
            "suggestion": suggestion_text.split("\n")
        }

    except Exception as e:
        return {
            "error": f"Prediction failed: {str(e)}"
        }
