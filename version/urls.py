from django.urls import path, include
from rest_framework import routers

from version import views

router = routers.DefaultRouter()
router.register(r'', views.PermissionsApiView, basename='clients')
router_info = routers.DefaultRouter()
router_info.register(r'information', views.SectionInformationApiView, basename='section_information')

urlpatterns = [
    path('', views.index, name="base_version"),

    path('api/', include(router_info.urls), name='api_version'),
    path('group/api/', include(router.urls), name='api_group'),
]