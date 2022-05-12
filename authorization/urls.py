from django.urls import path, include
from authorization import views


urlpatterns = [
    path('', views.login_req, name="login"),
    path('register', views.register_req, name="register"),
    path('logout', views.logout_req, name="logout"),
]
