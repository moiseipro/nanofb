from django.urls import path, include
from rest_framework import routers
from notifications import views


router = routers.DefaultRouter()
router.register(r'all', views.NotificationManagementApiView, basename='notification_clients')
router.register(r'sent', views.NotificationUserManagementApiView, basename='notification_sent')


urlpatterns = [
    path('view', views.NotificationManagementView.as_view(), name="view"),

    path('api/', include(router.urls), name='api_notification'),
    path('notification_list/', views.NotificationListApiView.as_view(), name='notification_list'),
]