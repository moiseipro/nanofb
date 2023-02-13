from django.contrib.auth import get_user_model
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from authorization import views

router = DefaultRouter()
router.register("api", views.AuthorizationUserViewSet, basename="api")

User = get_user_model()

urlpatterns = [
    path('', views.login_req, name="login"),
    path('logout', views.logout_req, name="logout"),
    path('register/', views.RegistrationUserView.as_view(), name='register'),
    path('forgot/', views.ForgotPasswordUserView.as_view(), name='forgot'),
    path('', include(router.urls), name="api"),
    path('activation/<uid>/<token>', views.ActivationUserView.as_view(), name='activation'),
    path('reset_password/<uid>/<token>', views.ConfirmPasswordUserView.as_view(), name='activation'),
    #path('api/registration/', views.RegistrationUserApiView.as_view(), name='register_api'),
]
