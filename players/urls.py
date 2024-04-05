from django.urls import path, include
from players import views


urlpatterns = [
    path('', views.players, name="players"),
    path('archive', views.archive_players, name="archive_players"),
    path('documents', views.documents, name="documents"),
    path('player', views.player, name="player"),
    path('players_api', views.players_api, name="players_api"),
    path('parents', views.parents, name="parents"),
]
