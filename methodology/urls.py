from django.urls import path, include
from methodology import views


urlpatterns = [
    path('', views.methodology, name="methodology"),
    path('methodology_api', views.methodology_api, name="methodology_api"),
]
