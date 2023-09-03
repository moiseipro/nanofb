from django.urls import path, include
from rest_framework import routers
from medicine import views


urlpatterns = [
    path('', views.medicine, name="base_medicine"),
    path('medicine_api', views.medicine_api, name="medicine_api"),
]
