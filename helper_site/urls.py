from django.urls import path, include
from helper_site import views


urlpatterns = [
    path('', views.helper_site, name="helper_site"),
    path('helper_site_api', views.helper_site_api, name="helper_site_api"),
    path('ckeditor', include('ckeditor_uploader.urls')),
]
