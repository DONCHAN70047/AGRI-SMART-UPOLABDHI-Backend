import numpy as np
import pickle
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os
import google.generativeai as genai    # RT-Import : google-generativeai


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


model_path = os.path.join(BASE_DIR, "DisesDetectModel16.keras")
model = load_model(model_path)


class_map_path = os.path.join(BASE_DIR, "ClassMapDisesDetectModel16.pkl")
with open(class_map_path, 'rb') as f:
    class_indices = pickle.load(f)

index_to_class = {v: k for k, v in class_indices.items()}

def Sugesstion(DisesName) :
    genai.configure(api_key=os.getenv("DisesSugesstionAPIKey")
)
    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")
    response = model.generate_content(f"Our dises name is : {DisesName}  so, you give me point wise sugesstion of  how to came dises & how to servive from this diises..")
    return response.text


def predict_disease(image_file):
    img = image_file.resize((128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    predicted_class = index_to_class[predicted_index]

    PredictDisesSugesstion = Sugesstion(predicted_class)



    return {
        "disease": predicted_class,
        "suggestion": [PredictDisesSugesstion]
    }
