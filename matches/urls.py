from django.urls import path, include
from matches import views
from rest_framework import routers

extra_context = {'menu_matches': 'active'}

urlpatterns = [
    path('', views.MatchesView.as_view(extra_context=extra_context), name="base_matches"),
]