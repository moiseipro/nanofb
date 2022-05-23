from django.urls import path, include
from version import views

urlpatterns = [
    path('', views.index, name="base_version"),
]