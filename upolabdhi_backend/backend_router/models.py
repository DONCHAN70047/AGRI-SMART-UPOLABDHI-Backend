from django.db import models


# Create your models here.
class Polygon(models.Model):
    user_id = models.CharField(max_length=50)
    latitude = models.DecimalField(max_digits=20, decimal_places=15)
    longitude = models.DecimalField(max_digits=20, decimal_places=15)
    poly_arr = models.JSONField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created']

class Weather(models.Model):
    user_id = models.IntegerField()
    status = models.CharField(max_length=20)
    location = models.CharField(max_length=20)
    temp = models.DecimalField(max_digits=20, decimal_places=2)
    feels_like = models.DecimalField(max_digits=20, decimal_places=2)
    min_temp = models.DecimalField(max_digits=20, decimal_places=2)
    max_temp = models.DecimalField(max_digits=20, decimal_places=2)
    wind_speed = models.DecimalField(max_digits=20, decimal_places=2)
    wind_gust = models.DecimalField(max_digits=20, decimal_places=2)
    wind_degree = models.IntegerField()
    pressure = models.IntegerField()
    humidity = models.IntegerField()
    sea_level = models.IntegerField()
    ground_level = models.IntegerField()
    rain = models.IntegerField()
    clouds = models.IntegerField()

    class Meta:
        ordering = ['user_id']


class Symptom(models.Model):
    description = models.CharField(max_length=200)

class RiskFactor(models.Model):
    description = models.CharField(max_length=200)

class PreventionMeasure(models.Model):
    description = models.CharField(max_length=200)

class SpreadMethod(models.Model):
    description = models.CharField(max_length=200)

class TreatmentCure(models.Model):
    description = models.CharField(max_length=200)

class CropDisease(models.Model):
    user_id = models.IntegerField()
    crop_affected = models.CharField(max_length=20)
    disease_name = models.CharField(max_length=50)
    possible_causal_agent = models.CharField(max_length=50)
    scientific_name = models.CharField(max_length=50)

    common_symptoms = models.ForeignKey(Symptom, related_name='disease_symptoms', on_delete=models.CASCADE)
    risk_causes = models.ForeignKey(RiskFactor, related_name='disease_risks', on_delete=models.CASCADE)
    prevention = models.ForeignKey(PreventionMeasure, related_name='disease_preventions', on_delete=models.CASCADE)
    spread = models.ForeignKey(SpreadMethod, related_name='disease_spreads', on_delete=models.CASCADE)
    treatment = models.ForeignKey(TreatmentCure, related_name='disease_treatments', on_delete=models.CASCADE)

    class Meta:
        ordering = ['user_id']
