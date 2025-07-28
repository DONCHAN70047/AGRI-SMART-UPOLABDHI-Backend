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
    description = models.TextField()

class RiskFactor(models.Model):
    description = models.TextField()

class SpreadMethod(models.Model):
    description = models.TextField()

class TreatmentCure(models.Model):
    description = models.TextField()

class PreventionMeasure(models.Model):
    description = models.TextField()

class CropDisease(models.Model):
    user_id = models.IntegerField()
    disease_name = models.CharField(max_length=200)
    crop_affected = models.CharField(max_length=100)
    scientific_name = models.CharField(max_length=200)
    possible_causal_agent = models.CharField(max_length=200)

    common_symptoms = models.ManyToManyField(Symptom)
    risk_causes = models.ManyToManyField(RiskFactor)
    prevention = models.ManyToManyField(PreventionMeasure)
    spread = models.ManyToManyField(SpreadMethod)
    treatment = models.ManyToManyField(TreatmentCure)

class UploadedImage(models.Model):
    image = models.ImageField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)