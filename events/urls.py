from django.urls import path, include
from events import views
from rest_framework import routers

extra_context = {'menu_events': 'active'}

urlpatterns = [
    path('', views.EventsView.as_view(extra_context=extra_context), name="base_events"),
    path('microcycles', views.MicrocycleListView.as_view(), name="microcycles"),
]