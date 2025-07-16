from django.urls import path
from backend_router import views

urlpatterns = [
    path('get_your_map/', views.get_your_map, name="get_your_map"),
    path('weather/', views.weather, name="weather"),

    path('sign_in/', views.sign_in, name="sign_in"),
    path('log_in', views.login, name="login"),
    path('refresh/', views.refresh, name="refresh"),
    path('blacklist/', views.blacklist, name="blacklist")
]
