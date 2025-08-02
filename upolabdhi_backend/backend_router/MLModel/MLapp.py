import os
import pickle
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import google.generativeai as genai
from dotenv import load_dotenv

# === Load environment variables ===
load_dotenv()
API_KEY = os.getenv("DisesSugesstionAPIKey")
if not API_KEY:
    raise EnvironmentError("❌ API Key not found. Please set 'DisesSugesstionAPIKey' in your .env file.")

# === Paths ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "compressed_model.tflite")  # TFLite model
CLASS_MAP_PATH = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")

# === Load class mapping ===
try:
    with open(CLASS_MAP_PATH, "rb") as f:
        class_indices = pickle.load(f)
        index_to_class = {v: k for k, v in class_indices.items()}
    print("✅ Class map loaded.")
except Exception as e:
    raise FileNotFoundError(f"❌ Failed to load class map: {e}")

# === Load TFLite model ===
try:
    interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("✅ TFLite model loaded.")
except Exception as e:
    raise RuntimeError(f"❌ Failed to load TFLite model: {e}")

# === Gemini suggestion ===
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

# === Predict from image ===
def predict_disease(image_file: Image.Image) -> dict:
    try:
        img = image_file.resize((128, 128)).convert("RGB")
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0).astype(np.float32)

        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])

        predicted_index = int(np.argmax(output_data[0]))
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
