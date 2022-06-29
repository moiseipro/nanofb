from django.urls import path, include
from references import views
from rest_framework import routers

urlpatterns = [
    path('season', views.change_season, name="set_season"),
    path('team', views.change_team, name="set_team"),
]