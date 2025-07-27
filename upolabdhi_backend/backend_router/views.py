import os
import json
import requests
import requests # type: ignore
from pprint import pprint
from backend_router.models import Polygon, Weather, CropDisease
from backend_router.serializer import PolygonSerializer, WeatherSerializer, CropDiseaseSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import parser_classes
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_500_INTERNAL_SERVER_ERROR

# from .MLModel.MLapp import predict_disease
import google.generativeai as genai
from PIL import Image





secure = os.getenv('SECURE')

# ............................................................... Mail Function ......................................
def MailFunction(userMail, userName, password):
    subject = 'Testing mail'
    from_email = settings.EMAIL_HOST_USER
    to_email = userMail
    text_content = 'This is a fallback plain text message.'
    html_content = f'<p><pre>Hi {userName}, thank you for signing up on UPOLABDHI!......... 🎉</pre> <pre>Your username: {userName}Y \our password: {password}....🔑</pre>  <pre>Please keep your credentials safe and do not share them with others........</pre>   <pre>Your registration was successful.....😊😊 — Welcome to UPOLABDHI!..... 😀😀</pre></p>'

    msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()





#........................................................................................... get_your_map .................................................
@api_view(['POST'])
def get_your_map(request):
    try :
        c = request.data.get('coords')
        p = request.data.get('polygon_arr')

        lat = c.get('lat')
        lon = c.get('lon')

        print("Get your map data came views sucessfully....")
        print("Latitude:", lat)
        print("Longitude:", lon)
        print("Polygon:", p)

        try:
            remake = {
                "latitude": lat,
                "longitude": lon,
                "poly_arr": p
            }
        except KeyError as e:
            return Response({"error": f"Missing key: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PolygonSerializer(data=remake)
        if serializer.is_valid():
            serializer.save()
            print('Database save sucessfully... ')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e :
        #print("Error get_your_map:", str(e))
        return Response({"message": "Server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
    
#........................................................................................... get_your_map .................................................

#........................................................................... weather .....................................................................
@api_view(['POST'])
def weather(request):
    user_id = request.data.get("user_id")
    apiKey = os.environ.get('OPENWEATHER_API_KEY')

    if not user_id:
        return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_user = Polygon.objects.get(user_id=user_id)
    except Polygon.DoesNotExist:
        return Response({"error": "Polygon for user not found"}, status=status.HTTP_404_NOT_FOUND)

    lat = target_user.latitude
    lon = target_user.longitude

    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apiKey}'
    response = requests.get(url)

    if response.status_code != 200:
        return Response({"error": "Failed to fetch weather data"}, status=response.status_code)

    result = response.json()

    Weather.objects.filter(user_id=user_id).delete()

    weather_data = {
        'user_id': user_id,
        'status': result.get('weather', [{}])[0].get('main', ''),
        'location': result.get('base', ''),
        'temp': result.get('main', {}).get('temp', 0.0),
        'feels_like': result.get('main', {}).get('feels_like', 0.0),
        'min_temp': result.get('main', {}).get('temp_min', 0.0),
        'max_temp': result.get('main', {}).get('temp_max', 0.0),
        'humidity': result.get('main', {}).get('humidity', 0),
        'pressure': result.get('main', {}).get('pressure', 0),
        'sea_level': result.get('main', {}).get('sea_level', 0),
        'ground_level': result.get('main', {}).get('grnd_level', 0),
        'clouds': result.get('clouds', {}).get('all', 0),
        'rain': result.get('rain', {}).get('1h', 0.0),
        'wind_speed': result.get('wind', {}).get('speed', 0.0),
        'wind_gust': result.get('wind', {}).get('gust', 0.0),
        'wind_degree': result.get('wind', {}).get('deg', 0),
    }

    serializer = WeatherSerializer(data=weather_data)
    if serializer.is_valid():
        serializer.save()
        return Response(weather_data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#........................................................................... weather .....................................................................

# ....................................................................... sign_in ............................................ 
@api_view(['POST'])
def sign_in(request):
    # permission_classes = [IsAuthenticated]  # ✅ Correct
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        

        if not username or not password or not email:
            return Response({"error": "Username, password, and email are required"}, status=HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password)
        )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        

        response = Response({
            "message": "User registered successfully",
            "access": access_token,
            "refresh": refresh_token,
        }, status=HTTP_201_CREATED)
        MailFunction(email, username, password)

        secure = False  
        response.set_cookie('access', access_token, httponly=True, secure=secure, samesite='Lax')
        response.set_cookie('refresh', refresh_token, httponly=True, secure=secure, samesite='Lax')

        return response

    except Exception as e:
        return Response({"error": str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
# ....................................................................... sign_in ............................................ 


    
# ....................................................................... current user ...............................................
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "id" : user.id,
        "username": user.username
    })
# ....................................................................... current user ...............................................


# .......................................... DisesDetection ...................................................
# @api_view(['POST'])
# @parser_classes([MultiPartParser])
# @permission_classes([AllowAny])
# def predict_disease_from_image(request):
#     try:
#         image_file = request.FILES.get('image')  
#         #print(image_file)
#     except KeyError:
#         return Response({"error": "Missing 'file'"}, status=status.HTTP_400_BAD_REQUEST)
#     if not image_file:
#         return Response({"error": "Image not provided"}, status=200)

#     try:
#         img = Image.open(image_file).convert("RGB")  
#     except Exception as e:
#         return Response({"error": f"Failed to load image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

#     try:
#         result = predict_disease(img)  

#         return Response(result, status=status.HTTP_200_OK)

#     except Exception as e:
#         return Response({"error": f"Prediction error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# .......................................... DisesDetection ...................................................


@api_view(['POST'])
def get_disease_details(request):

    user_id = request.data.get('user_id')
    crop_name = request.data.get('crop_name')
    crop_disease = request.data.get('crop_disease')

    print(user_id)
    print(crop_name)
    print(crop_disease)

    examples = [
        {
            "Example 1:"
            "Disease Name": "Late Blight",
            "Crop Affected": "Potato",
            "Scientific Name": "",
            "Possible Causal Agent": "",
            "3 Common Symptoms": [
            "Water-soaked lesions on leaves that turn brown or black",
            "White fungal growth under leaf surface in humid conditions",
            "Dark brown or black patches on stems and tubers"
            ],
            "Causes and Risk Factors": [
            "Cool and moist weather conditions",
            "Overcrowded planting and poor air circulation",
            "Infected seed tubers or plant debris left in the soil"
            ],
            "Spread": [
            "Wind-borne spores and rain splash",
            "Contaminated tools, hands, and storage areas",
            "Survives in infected tubers and plant residue"
            ],
            "Treatment and Cure": [
            "Apply protectant fungicides like Mancozeb or systemic fungicides such as Metalaxyl",
            "Remove and destroy infected plants immediately",
            "Practice crop rotation and use certified disease-free seed"
            ],
            "Prevention": [
            "Preventive Sprays",
            "Spacing",
            "Irrigation Suggestions"
            ]
        },
        {
            "Example 2:"
            "Disease Name": "Bacterial Leaf Blight",
            "Crop Affected": "Rice",
            "Scientific Name": "Xanthomonas oryzae pv. oryzae",
            "Possible Causal Agent": "Bacteria",
            "3 Common Symptoms": [
            "Yellowing of leaf tips that spreads downward",
            "Water-soaked lesions that become brown and dry",
            "Seedling wilting in early stages (Kresek phase)"
            ],
            "Causes and Risk Factors": [
            "High nitrogen fertilization",
            "Warm, wet climates and poor drainage",
            "Dense planting and contaminated irrigation"
            ],
            "Spread": [
            "Through rain splash and irrigation water",
            "Insects, especially leaf hoppers",
            "Contaminated seeds or crop debris"
            ],
            "Treatment and Cure": [
            "Use resistant rice varieties",
            "Apply copper-based bactericides or antibiotics under expert supervision",
            "Improve drainage and avoid over-fertilization",
            "Ensure field sanitation and remove infected material"
            ],
            "Prevention": [
            "Preventive Sprays",
            "Spacing",
            "Irrigation Suggestions"
            ]
        }
    ]


    prompt = (
        "You are an agricultural expert who excels in disease detection and care. "
        "You are given a crop name and its corresponding disease name. "
        "Based on that data, you have to give the following information:"
        "3 common symptoms for the disease, causes and risk factors, spread, treatment and cure, Prevention "
        f"Data: Crop name = {crop_name}, Crop Disease = {crop_disease}. "
        f"Examples: {examples}"
        "You must give the responce in JSON"
    )


    client = genai.Client()

    response = client.models.generate_content(
        
        model="gemini-2.5-flash", 
        contents=prompt
    )
    result = response.text 
    print(result)

    return Response(response.text)


@api_view(['POST'])
def upload_disease_details(request):

    body = json.loads(request.body.decode('utf-8'))

    user_id = body.get('user_id')
    disease_data = body.get('data', {})

    def to_description_list(lst):
        return [{'description': item} for item in lst]

    data = {
        'user_id': user_id,
        'crop_affected': disease_data.get('Crop Affected'),
        'disease_name': disease_data.get('Disease Name'),
        'possible_causal_agent': disease_data.get('Possible Causal Agent'),
        'scientific_name': disease_data.get('Scientific Name'),
        'common_symptoms': to_description_list(disease_data.get('3 Common Symptoms', [])),
        'risk_causes': to_description_list(disease_data.get('Causes and Risk Factors', [])),
        'prevention': to_description_list(disease_data.get('Prevention', [])),
        'spread': to_description_list(disease_data.get('Spread', [])),
        'treatment': to_description_list(disease_data.get('Treatment and Cure', [])),
    }

    serializer = CropDiseaseSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Data saved successfully", "data": serializer.data}, status=201)
    return Response({"message": "Invalid CropDisease Serializer", "errors": serializer.errors}, status=400)

@api_view(['POST'])
def fetch_disease_details(request):
    user_id = request.body.get('user_id')

    if not user_id:
        return Response({"message": "Missing 'user_id' in query parameters"}, status=400)

    diseases = CropDisease.objects.filter(user_id=user_id)
    serializer = CropDiseaseSerializer(diseases, many=True)
    return Response({"data": serializer.data}, status=200)
