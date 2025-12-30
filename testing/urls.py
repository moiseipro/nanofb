from django.urls import path, include
from testing import views


urlpatterns = [
    path('', views.testing, name="testing"),
    path('testing_api', views.testing_api, name="testing_api"),
]
