from django.urls import path, include
from video import views

urlpatterns = [
    path('', views.index, name="base_video"),
]