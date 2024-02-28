from django.urls import path, include
from rest_framework import routers
from trainings import views

router = routers.DefaultRouter()
router.register(r'action', views.TrainingViewSet, basename="action")
router.register(r'exercise', views.TrainingExerciseViewSet, basename="exercise")
router.register(r'exercise_data', views.TrainingExerciseAdditionalViewSet, basename="exercise_data")
router.register(r'protocol', views.TrainingProtocolViewSet, basename="protocol")
router.register(r'objectives', views.ObjectivesViewSet, basename="objectives")

lrouter = routers.DefaultRouter()
lrouter.register(r'action', views.LiteTrainingViewSet, basename="action")
lrouter.register(r'exercise', views.LiteTrainingExerciseViewSet, basename="exercise")
lrouter.register(r'exercise_data', views.LiteTrainingExerciseAdditionalViewSet, basename="exercise_data")

extra_context = {'menu_trainings': 'active'}

urlpatterns = [
    path('', views.TrainingsView.as_view(extra_context=extra_context), name="base_trainings"),
    path('view/<int:pk>', views.EditTrainingsView.as_view(extra_context=extra_context), name="view_training"),
    path('api/', include(router.urls), name="api"),

    path('lite/view/<int:pk>', views.EditLiteTrainingsView.as_view(extra_context=extra_context), name="view_lite_training"),
    path('lite/api/', include(lrouter.urls), name="lite_api"),

    path('objectives_list/', views.ObjectivesListApiView.as_view(), name='objectives_list'),
    path('objective_block/', views.ObjectiveBlockListApiView.as_view(), name='objective_block_list'),
    path('training_block/', views.TrainingBlockListApiView.as_view(), name='training_block'),
    path('training_block_short/', views.TrainingBlockKeyApiView.as_view(), name='training_block_short'),
]