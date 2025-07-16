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

secure = os.environ.get('SECURE')

# UPLOAD THE MAP DATA
@api_view(['POST'])
def get_your_map(request):
    data = request.data
    try:
        remake = {
            "user_id": data["user_id"],
            "latitude": data["coords"]["latitude"],
            "longitude": data["coords"]["longitude"],
            "poly_arr": data["poly_arr"]
        }
    except KeyError as e:
        return Response({"error": f"Missing key: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = PolygonSerializer(data=remake)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# GET WEATHER DATA AND FETCH 
@api_view(['POST'])
def weather(request):
    user_id = request.data.get("user_id")
    apiKey = os.environ.get('OPENWEATHER_API_KEY')

    if not user_id:
        return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    Weather.objects.filter(user_id=user_id).delete() # DELETE WEATHER DATA OF USER IF ALREADY EXISTS, THEN ADD NEW DATA OF THAT USER.

    target_user = Polygon.objects.get(user_id=user_id)
    lat = target_user.latitude
    lon = target_user.longitude

    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apiKey}'

    response = requests.get(url)
    if response.status_code == 200:
        result = response.json()

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
        return Response({"error": "Failed to fetch weather data"}, status=response.status_code)
    

@api_view(['POST'])
def sign_in(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)

    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    # Create user
    user = User.objects.create_user(username=username, password=password, email=email)

    # Authenticate & create tokens
    user = authenticate(username=username, password=password)
    refresh = RefreshToken.for_user(user)

    # Set tokens in cookies
    response = Response({"message": "User registered and logged in successfully"})
    response.set_cookie(
        key='access',
        value=str(refresh.access_token),
        httponly=True,
        secure=True,  # False for local dev
        samesite='Lax'
    )
    response.set_cookie(
        key='refresh',
        value=str(refresh),
        httponly=True,
        secure=True,
        samesite='Lax'
    )

    return response

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
        # Validate the refresh token
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)

        # Send new access token in cookie
        response = Response({"message": "Token refreshed successfully"})
        response.set_cookie(
            key='access',
            value=access_token,
            httponly=True,
            secure=secure,  # False for local dev
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
        token.blacklist()  # blacklist the refresh token

        response = Response({"message": "Logged out successfully"})
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response

    except TokenError:
        return Response({"error": "Invalid or expired refresh token"}, status=400)