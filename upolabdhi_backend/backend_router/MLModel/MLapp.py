import numpy as np
import pickle
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


model_path = os.path.join(BASE_DIR, "DisesDetectModel.keras")
model = load_model(model_path)


class_map_path = os.path.join(BASE_DIR, "ClassMapDisesDetectModel.pkl")
with open(class_map_path, 'rb') as f:
    class_indices = pickle.load(f)

index_to_class = {v: k for k, v in class_indices.items()}


def predict_disease(image_file):
    img = image_file.resize((128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    predicted_class = index_to_class[predicted_index]

  
    

    return {
        "disease": predicted_class,
        "suggestion": ["No suggestions available....."]
    }
