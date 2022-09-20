from django.urls import path, include
from video import views
from rest_framework import routers

extra_context = {'menu_video': 'active'}

router = routers.DefaultRouter()
router.register(r'all', views.VideoViewSet, basename='video_list')
router.register(r'exercises', views.VideoExerciseViewSet, basename='video_list_exercises')

urlpatterns = [
    path('api/', include(router.urls), name='api_video'),

    path('', views.BaseVideoView.as_view(extra_context=extra_context), name="base_video"),
    path('<int:pk>', views.VideoDetailView.as_view(extra_context=extra_context), name="view_video"),
    path('add', views.CreateVideoView.as_view(extra_context=extra_context), name="add_video"),
    path('parse_nf', views.parse_video, name="parse_video"),
]