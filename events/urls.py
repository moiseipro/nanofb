from django.urls import path, include
from events import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'microcycles', views.MicrocycleViewSet, basename="microcycles")
router.register(r'action', views.EventViewSet, basename="action")

lrouter = routers.DefaultRouter()
lrouter.register(r'microcycles', views.LiteMicrocycleViewSet, basename="microcycles")
lrouter.register(r'action', views.LiteEventViewSet, basename="action")

urlpatterns = [
    path('', views.EventsView.as_view(), name="base_events"),
    path('api/', include(router.urls), name="api"),

    path('lite/', views.LiteEventsView.as_view(), name="lite_events"),
    path('lite/api/', include(lrouter.urls), name="api"),

    path('microcycle_name_list', views.MicrocycleNameListApiView.as_view(), name='microcycle_name_list'),
    path('microcycle_goal_list', views.MicrocycleGoalListApiView.as_view(), name='microcycle_goal_list'),
]