from django.urls import path, include
from nanofootball import views


urlpatterns = [
    path('', views.default_page, name="default_page"),
]
