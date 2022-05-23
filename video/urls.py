from django.urls import path, include
from video import views

extra_context = {'menu_video': 'active'}

urlpatterns = [
    path('', views.AllVideoView.as_view(extra_context=extra_context), name="base_video"),
    path('add', views.add_video, name="add_video"),
    path('view', views.view_video, name="view_video"),
]