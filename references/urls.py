from django.urls import path, include
from references import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'teams', views.TeamViewSet, basename="teams")

urlpatterns = [
    path('season', views.change_season, name="set_season"),
    path('team', views.change_team, name="set_team"),
    path('', views.SettingsView.as_view(), name="settings"),

    path('api/', include(router.urls), name="teams"),
]