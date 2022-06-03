from django.urls import path, include
from exercises import views


urlpatterns = [
    path('', views.exercises, name="exercises"),
    path('folders', views.folders, name="folders"),
    path('folders_api', views.folders_api, name="folders_api"),
]
