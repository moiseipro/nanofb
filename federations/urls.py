from django.urls import path, include
from federations import views
from rest_framework import routers

extra_context = {'menu_federations': 'active'}

router = routers.DefaultRouter()
#router.register(r'users', views.FederationUsersViewSet, basename='users_list')
router.register(r'', views.FederationViewSet, basename='federation')

urlpatterns = [
    path('api/', include(router.urls), name='api_federation'),

    path('', views.BaseFederationView.as_view(extra_context=extra_context), name="base_federation"),
]
