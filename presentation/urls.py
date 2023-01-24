from django.urls import path, include
from presentation import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'training', views.TrainingPresentationViewSet, basename="training")
router.register(r'match', views.TrainingPresentationViewSet, basename="match")



urlpatterns = [
    path('api/', include(router.urls), name="api_settings"),
]