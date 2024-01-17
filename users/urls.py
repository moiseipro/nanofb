from django.urls import path, include
from rest_framework import routers

from users import views

router = routers.DefaultRouter()
router.register(r'', views.UserManagementApiView, basename='clients')
router_club = routers.DefaultRouter()
router_club.register(r'', views.ClubsApiViewSet, basename='clubs')


urlpatterns = [
    path('profile', views.BaseProfileView.as_view(), name="profile"),
    path('profile/api/edit/', views.EditUserApiView.as_view(), name='edit'),
    path('profile/api/password/', views.EditPasswordApiView.as_view(), name='edit'),

    path('clients', views.UserManagementView.as_view(), name='clients'),
    path('clients/api/', include(router.urls), name='api_clients'),

    path('clubs/api/', include(router_club.urls), name='api_clubs'),

    path('countries_list', views.CountryListApiView.as_view(), name='countries_list'),
    path('versions_list', views.VersionListApiView.as_view(), name='versions_list'),
    path('clubs_list', views.ClubListApiView.as_view(), name='clubs_list'),
    path('group_list', views.UserGroupListApiView.as_view(), name='group_list'),
]
