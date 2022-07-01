from django.urls import path, include
from events import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'microcycles', views.MicrocycleViewSet, basename="microcycles")

extra_context = {'menu_events': 'active'}

urlpatterns = [
    path('', views.EventsView.as_view(extra_context=extra_context), name="base_events"),
    path('api/', include(router.urls), name="microcycles"),
]