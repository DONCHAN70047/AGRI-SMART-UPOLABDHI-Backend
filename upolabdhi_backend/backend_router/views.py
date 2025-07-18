import os
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from backend_router.models import Polygon, Weather
from backend_router.serializer import PolygonSerializer, WeatherSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import parser_classes
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_201_CREATED, HTTP_500_INTERNAL_SERVER_ERROR
from .MLModel.MLapp import predict_disease



import requests
from PIL import Image
from io import BytesIO
import torch  
import torchvision.transforms as transforms



secure = os.environ.get('SECURE')

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

        secure = False  
        response.set_cookie('access', access_token, httponly=True, secure=secure, samesite='Lax')
        response.set_cookie('refresh', refresh_token, httponly=True, secure=secure, samesite='Lax')

        return response

    except Exception as e:
        return Response({"error": str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR)
# ....................................................................... sign_in ............................................ 


    
# ....................................................................... login, refresh & blocklist ...............................................
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({"message": "Login successful"})

        response.set_cookie(
            key='access',
            value=access_token,
            httponly=True,
            secure=secure,
            samesite='Lax'
        )
        response.set_cookie(
            key='refresh',
            value=refresh_token,
            httponly=True,
            secure=secure,
            samesite='Lax'
        )

        return response
    else:
        return Response({"error": "Invalid credentials"}, status=401)


@api_view(['PUT'])
def refresh(request):
    refresh_token = request.COOKIES.get('refresh')

    if not refresh_token:
        return Response({"error": "Refresh token not found"}, status=400)

    try:
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)

        response = Response({"message": "Token refreshed successfully"})
        response.set_cookie(
            key='access',
            value=access_token,
            httponly=True,
            secure=secure,
            samesite='Lax'
        )
        return response

    except TokenError:
        return Response({"error": "Invalid or expired refresh token"}, status=401)


@api_view(['DELETE'])
def blacklist(request):
    refresh_token = request.COOKIES.get('refresh')

    if not refresh_token:
        return Response({"error": "Refresh token not found"}, status=400)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()  # Blacklist the refresh token

        response = Response({"message": "Logged out successfully"})
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response

    except TokenError:
        return Response({"error": "Invalid or expired refresh token"}, status=400)
# ....................................................................... login, refresh & blocklist ...............................................


# .......................................... DisesDetection ...................................................
@api_view(['POST'])
@parser_classes([MultiPartParser])
@permission_classes([AllowAny])
def predict_disease_from_image(request):
    try:
        image_file = request.FILES.get('image')  
        #print(image_file)
    except KeyError:
        return Response({"error": "Missing 'file'"}, status=status.HTTP_400_BAD_REQUEST)
    if not image_file:
        return Response({"error": "Image not provided"}, status=200)

    try:
        img = Image.open(image_file).convert("RGB")  
    except Exception as e:
        return Response({"error": f"Failed to load image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = predict_disease(img)  

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": f"Prediction error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# .......................................... DisesDetection ...................................................

