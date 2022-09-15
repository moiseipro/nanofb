from django.urls import path, include
from rest_framework import routers
from trainings import views

router = routers.DefaultRouter()
router.register(r'action', views.TrainingViewSet, basename="action")
router.register(r'exercise', views.TrainingExerciseViewSet, basename="exercise")
router.register(r'exercise_data', views.TrainingExerciseAdditionalViewSet, basename="exercise_data")

extra_context = {'menu_trainings': 'active'}

urlpatterns = [
    path('', views.TrainingsView.as_view(extra_context=extra_context), name="base_trainings"),
    path('view/<int:pk>', views.EditTrainingsView.as_view(extra_context=extra_context), name="view_training"),
    path('api/', include(router.urls), name="api"),
]