from django.urls import path, include
from rest_framework import routers
from matches import views

router = routers.DefaultRouter()
router.register(r'action', views.MatchViewSet, basename="action")

urlpatterns = [
    path('', views.matches, name="base_matches"),
    path('match', views.match, name="base_match"),
    path('matches_api', views.matches_api, name="matches_api"),

    path('api/', include(router.urls), name="api"),
]
