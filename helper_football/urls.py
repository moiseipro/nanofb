from django.urls import path, include
from helper_football import views


urlpatterns = [
    path('', views.helper_football, name="helper_football"),
    path('helper_football_api', views.helper_football_api, name="helper_football_api"),
    path('ckeditor', include('ckeditor_uploader.urls')),
]
