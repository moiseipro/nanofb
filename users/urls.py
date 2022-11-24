from django.urls import path, include
from users import views


urlpatterns = [
    path('profile', views.BaseProfileView.as_view(), name="profile"),
]
