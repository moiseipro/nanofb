from django.urls import path, include
from rest_framework import routers

from version import views

router = routers.DefaultRouter()
router.register(r'', views.PermissionsApiView, basename='clients')

urlpatterns = [
    path('', views.index, name="base_version"),

    path('group/api/', include(router.urls), name='api_group'),
]