from django.urls import path, include
from rest_framework import routers

from users import views

router = routers.DefaultRouter()
router.register(r'', views.UserManagementApiView, basename='clients')


urlpatterns = [
    path('profile', views.BaseProfileView.as_view(), name="profile"),
    path('profile/api/edit/', views.EditUserApiView.as_view(), name='edit'),
    path('profile/api/password/', views.EditPasswordApiView.as_view(), name='edit'),

    path('clients', views.UserManagementView.as_view(), name='clients'),
    path('clients/api/', include(router.urls), name='api_clients'),

    path('countries', views.CountryListApiView.as_view(), name='counties'),
    path('versions', views.VersionListApiView.as_view(), name='versions'),
]
