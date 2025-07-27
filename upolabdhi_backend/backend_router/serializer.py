from rest_framework import serializers
from backend_router.models import Polygon, Weather, CropDisease, Symptom, RiskFactor, SpreadMethod, TreatmentCure, PreventionMeasure

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
        read_only_fields = ['user_id']


class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = ['description']

class RiskFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskFactor
        fields = ['description']

class SpreadMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpreadMethod
        fields = ['description']

class TreatmentCureSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentCure
        fields = ['description']

class PreventionMeasureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreventionMeasure
        fields = ['description']

class CropDiseaseSerializer(serializers.ModelSerializer):
    common_symptoms = SymptomSerializer(many=True)
    risk_causes = RiskFactorSerializer(many=True)
    prevention = PreventionMeasureSerializer(many=True)
    spread = SpreadMethodSerializer(many=True)
    treatment = TreatmentCureSerializer(many=True)

    class Meta:
        model = CropDisease
        fields = '__all__'

    def create(self, validated_data):
        symptoms = validated_data.pop('common_symptoms')
        risks = validated_data.pop('risk_causes')
        preventions = validated_data.pop('prevention')
        spreads = validated_data.pop('spread')
        treatments = validated_data.pop('treatment')

        crop_disease = CropDisease.objects.create(**validated_data)

        for symptom in symptoms:
            s_obj, _ = Symptom.objects.get_or_create(**symptom)
            crop_disease.common_symptoms.add(s_obj)

        for risk in risks:
            r_obj, _ = RiskFactor.objects.get_or_create(**risk)
            crop_disease.risk_causes.add(r_obj)

        for prev in preventions:
            p_obj, _ = PreventionMeasure.objects.get_or_create(**prev)
            crop_disease.prevention.add(p_obj)

        for sp in spreads:
            sp_obj, _ = SpreadMethod.objects.get_or_create(**sp)
            crop_disease.spread.add(sp_obj)

        for tr in treatments:
            t_obj, _ = TreatmentCure.objects.get_or_create(**tr)
            crop_disease.treatment.add(t_obj)

        return crop_disease