from django.urls import path, include
from rest_framework import routers
from trainings import views

router = routers.DefaultRouter()
router.register(r'action', views.TrainingViewSet, basename="action")
router.register(r'exercise', views.TrainingExerciseViewSet, basename="exercise")
router.register(r'exercise_data', views.TrainingExerciseAdditionalViewSet, basename="exercise_data")
router.register(r'protocol', views.TrainingProtocolViewSet, basename="protocol")
router.register(r'objectives', views.ObjectivesViewSet, basename="objectives")
router.register(r'aobjectives', views.AdminObjectivesViewSet, basename="aobjectives")
router.register(r'blocks', views.BlocksViewSet, basename="blocks")
router.register(r'ablocks', views.AdminBlocksViewSet, basename="ablocks")
router.register(r'loads', views.LoadsViewSet, basename="loads")
router.register(r'aloads', views.AdminLoadsViewSet, basename="aloads")
router.register(r'amd', views.AdminMDViewSet, basename="amd")

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
    path('objectives_short/', views.ObjectiveShortListApiView.as_view(), name='objective_short_list'),
    path('aobjectives_short/', views.AdminObjectiveShortListApiView.as_view(), name='aobjective_short_list'),
    path('blocks_list/', views.BlockListApiView.as_view(), name='block_list'),
    path('blocks_short/', views.BlockShortListApiView.as_view(), name='block_short_list'),
    path('ablocks_short/', views.AdminBlockShortListApiView.as_view(), name='ablock_short_list'),
    path('aloads_list/', views.AdminLoadListApiView.as_view(), name='aloads_list'),
    path('aloads_short/', views.AdminLoadShortApiView.as_view(), name='aloads_short'),
    path('amd_list/', views.AdminMDListApiView.as_view(), name='amd_list'),
]