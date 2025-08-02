import os
import io
import pickle
import numpy as np
import gdown
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.layers import InputLayer
import google.generativeai as genai
from dotenv import load_dotenv

# === Load environment variables ===
load_dotenv()
API_KEY = os.getenv("DisesSugesstionAPIKey")

# === Paths and constants ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_URL = "https://drive.google.com/uc?id=1FiSttTj-3mD_4AOGFMgoztoZ6wCaidaR"
MODEL_PATH = os.path.join(BASE_DIR, "temp_model.h5")
CLASS_MAP_PATH = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")

# === Download model from Google Drive ===
def download_model():
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    gdown.download(MODEL_URL, output=MODEL_PATH, quiet=False, fuzzy=True)

# === Load model and class index map ===
download_model()
try:
    model = load_model(MODEL_PATH, compile=False, custom_objects={"InputLayer": InputLayer})
except Exception as e:
    raise RuntimeError("❌ Failed to load Keras model: " + str(e))
finally:
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)

# === Load class mapping ===
with open(CLASS_MAP_PATH, "rb") as f:
    class_indices = pickle.load(f)
index_to_class = {v: k for k, v in class_indices.items()}

# === Generate suggestion using Gemini ===
def Sugesstion(disease_name: str) -> str:
    genai.configure(api_key=API_KEY)
    gemini = genai.GenerativeModel(model_name="gemini-1.5-flash")
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

# === Predict disease from image ===
def predict_disease(image_file: Image.Image) -> dict:
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
