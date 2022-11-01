from django.urls import path, include
from clubs import views
from rest_framework import routers

extra_context = {'menu_clubs': 'active'}

router = routers.DefaultRouter()
router.register(r'users', views.ClubUsersViewSet, basename='users_list')
router.register(r'', views.ClubViewSet, basename='club')

urlpatterns = [
    path('api/', include(router.urls), name='api_club'),

    path('', views.BaseClubView.as_view(extra_context=extra_context), name="base_club"),
    # path('<int:pk>', views.VideoDetailView.as_view(extra_context=extra_context), name="view_video"),
    # path('add', views.CreateVideoView.as_view(extra_context=extra_context), name="add_video"),
    # path('parse_nf', views.parse_video, name="parse_video"),
]