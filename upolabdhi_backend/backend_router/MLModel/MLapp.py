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

# === Paths and constants ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_URL = "https://drive.google.com/uc?id=1JrIvT1aTT0cOo52ARHZskDI15WIXVrxn"
MODEL_PATH = os.path.join(BASE_DIR, "temp_model.h5")
CLASS_MAP_PATH = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")

# === Download model from Google Drive ===
def download_model():
    model_bytes = io.BytesIO()
    gdown.download(MODEL_URL, output=model_bytes, quiet=False, fuzzy=True)
    model_bytes.seek(0)
    with open(MODEL_PATH, "wb") as f:
        f.write(model_bytes.read())

# === Load model and class index map ===
download_model()
try:
    model = load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError("Failed to load Keras model.") from e
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
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    response = model.generate_content(
        f"""
        Our disease name is: {disease_name}.
        Please give me point-wise suggestions:
        1. How this disease happens
        2. How to prevent or cure it.
        Respond concisely in bullet points.
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
