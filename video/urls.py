from django.urls import path, include
from video import views
from rest_framework import routers

extra_context = {'menu_video': 'active'}

router = routers.DefaultRouter()
router.register(r'view', views.VideoViewSet, basename='view')

urlpatterns = [
    path('api/', include(router.urls)),

    path('', views.BaseVideoView.as_view(extra_context=extra_context), name="base_video"),
    path('<int:pk>', views.VideoDetailView.as_view(extra_context=extra_context), name="view_video"),
    path('add', views.add_video, name="add_video"),
    #path('view', views.view_video, name="view_video"),
]