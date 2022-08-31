from django.urls import path, include
from players import views


urlpatterns = [
    path('', views.players, name="players"),
    path('players_api', views.players_api, name="players_api"),
]
