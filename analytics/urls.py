from django.urls import path, include
from analytics import views


urlpatterns = [
    path('', views.analytics, name="analytics"),
    path('analytics_api', views.analytics_api, name="analytics_api")
]
