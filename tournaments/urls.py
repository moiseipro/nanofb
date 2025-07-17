from django.urls import path, include
from tournaments import views


urlpatterns = [
    path('', views.tournaments, name="tournaments"),
    path('tournaments_api', views.tournaments_api, name="tournaments_api"),
    path('ckeditor', include('ckeditor_uploader.urls')),
]
