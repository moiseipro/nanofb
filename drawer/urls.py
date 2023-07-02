from django.urls import path, include
from drawer import views


urlpatterns = [
    path('', views.drawings, name="drawings"),
    path('draw', views.drawer, name="draw"),
    path('rendered', views.rendered, name="rendered"),
    path('get_icon', views.get_icon, name="icon"),
    path('drawer_api', views.drawer_api, name="drawer_api"),
]
