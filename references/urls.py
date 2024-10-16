from django.urls import path, include
from references import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'teams', views.TeamViewSet, basename="teams")
router.register(r'seasons', views.SeasonViewSet, basename="seasons")
router.register(r'exercise_additional', views.ExsAdditionalViewSet, basename="exercise_additional")
router.register(r'protocol_status', views.PlayerProtocolStatusViewSet, basename="protocol_status")
router.register(r'training_space', views.TrainingSpaceViewSet, basename="training_space")
router.register(r'training_additional', views.TrainingAdditionalDataViewSet, basename="training_additional")
router.register(r'payment/user', views.UserPaymentViewSet, basename="payment_user")
router.register(r'payment/club', views.ClubPaymentViewSet, basename="payment_club")



urlpatterns = [
    path('season', views.change_season, name="set_season"),
    path('team', views.change_team, name="set_team"),
    path('', views.SettingsView.as_view(), name="settings"),

    path('api/', include(router.urls), name="api_settings"),
]