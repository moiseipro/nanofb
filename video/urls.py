from django.urls import path, include
from video import views

urlpatterns = [
    path('', views.index, name="base_video"),
    path('add', views.add_video, name="add_video"),
    path('view', views.view_video, name="view_video"),
]