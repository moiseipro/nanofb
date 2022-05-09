from django.urls import path, include
from users import views


urlpatterns = [
    path('profile', views.profile_req, name="profile"),
]
