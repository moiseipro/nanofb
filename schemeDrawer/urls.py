from django.urls import path, include
from schemeDrawer import views


urlpatterns = [
    path('', views.drawer, name="draw")
]
