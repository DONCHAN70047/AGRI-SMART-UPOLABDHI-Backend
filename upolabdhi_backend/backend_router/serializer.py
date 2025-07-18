from rest_framework import serializers
from backend_router.models import Polygon, Weather

class PolygonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Polygon
        fields = ['user_id', 'id', 'latitude', 'longitude', 'poly_arr', 'created']
        read_only_fields = ['id', 'created']

    def validate_poly_arr(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("poly_arr must be a list.")

        for point in value:
            if (not isinstance(point, list) or len(point) != 2):
                raise serializers.ValidationError("Each point in poly_arr must be a list of two numbers: [latitude, longitude].")

            lat, lon = point
            if not (isinstance(lat, (int, float)) and isinstance(lon, (int, float))):
                raise serializers.ValidationError("Latitude and longitude must be numeric.")

            if not (-90 <= lat <= 90):
                raise serializers.ValidationError("Latitude must be between -90 and 90.")

            if not (-180 <= lon <= 180):
                raise serializers.ValidationError("Longitude must be between -180 and 180.")

        return value

class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Weather
        fields = ['user_id', 'status', 'location', 'temp', 'feels_like', 'min_temp', 'max_temp', 'wind_speed', 'wind_gust', 'wind_degree', 'pressure', 'humidity', 'sea_level', 'ground_level', 'rain', 'clouds']
        read_only_fields = []


