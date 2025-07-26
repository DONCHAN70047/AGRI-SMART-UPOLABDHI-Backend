import numpy as np
import pickle
import gdown
import io
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os
import google.generativeai as genai

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

file_id = "1JrIvT1aTT0cOo52ARHZskDI15WIXVrxn"
url = f"https://drive.google.com/uc?id={file_id}"

model_bytes = io.BytesIO()
gdown.download(url, output=model_bytes, quiet=False, fuzzy=True)

model_bytes.seek(0)

with open("temp_model.h5", "wb") as f:
    f.write(model_bytes.read())

model = load_model('temp_model.h5')
os.remove("temp_model.h5")


class_map_path = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")
with open(class_map_path, 'rb') as f:
    class_indices = pickle.load(f)
index_to_class = {v: k for k, v in class_indices.items()}


def Sugesstion(DisesName):
    genai.configure(api_key=os.getenv("DisesSugesstionAPIKey"))
    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")
    response = model.generate_content(f"Our disease name is: {DisesName}. Please give me point-wise suggestions on how the disease happens and how to survive from it.")
    return response.text


def predict_disease(image_file):
    img = image_file.resize((128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    predicted_class = index_to_class[predicted_index]

    suggestion_text = Sugesstion(predicted_class)

    return {
        "disease": predicted_class,
        "suggestion": [suggestion_text]
    }
