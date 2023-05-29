import requests
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.shortcuts import render, redirect
from django.http import HttpResponse, QueryDict
from django.views.generic import TemplateView
from djoser.views import UserViewSet
from rest_framework import generics, status
from rest_framework.response import Response

from .forms import NewUserForm, NewLoginForm, NewUserPersonalForm
from users.models import User, UserPersonal
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.utils.translation import gettext_lazy as _

from .serializers import UserPersonalSerializer, UserCreateSerializer


def login_req(request):
    if request.user.is_authenticated:
        return redirect("users:profile")
    if request.method == "POST":
        form = NewLoginForm(request, data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(email=email, password=password)
            if user is not None:
                if user.club_id is None:
                    if user.p_version is not None:
                        version_groups = user.p_version.groups.all().values_list('id', flat=True)
                        user_groups = user.groups.all().values_list('id', flat=True)
                        if len(user.groups.all()) == 0:
                            print(version_groups)
                            user.groups.set(version_groups)
                            #user.save()
                        else:
                            a = set(user_groups)
                            b = set(version_groups)
                            if a != b:
                                user.groups.set(version_groups)
                                print("Noticed a mismatch of rights with the version")

                login(request, user)
                messages.info(request, f"You are now logged in as {email}.")
                return redirect("users:profile")
            else:
                messages.error(request, "Invalid email or password.")
        else:
            messages.error(request, "Invalid email or password.")
    form = NewLoginForm()
    return render(request=request, template_name="authorization/login.html", context={"login_form": form})


def logout_req(request):
    logout(request)
    messages.info(request, "You have successfully logged out.")
    return redirect("authorization:login")


# DJANGO
class RegistrationUserView(TemplateView):
    template_name = "authorization/register.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['register_form'] = NewUserForm()
        context['register_form2'] = NewUserPersonalForm()
        return context


class ActivationUserView(TemplateView):
    template_name = "authorization/activate.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['uid'] = self.kwargs['uid']
        context['token'] = self.kwargs['token']
        return context


class ForgotPasswordUserView(TemplateView):
    template_name = "authorization/forgot_password.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class ConfirmPasswordUserView(TemplateView):
    template_name = "authorization/reset_password.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['uid'] = self.kwargs['uid']
        context['token'] = self.kwargs['token']
        return context


# REST FRAMEWORK
class AuthorizationUserViewSet(UserViewSet):
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        print(request.data)
        try:
            validate_email(request.data['email'])
        except ValidationError as e:
            res_data = {'registration': _("A user with this Email already exists!")}
            return Response(res_data, status=status.HTTP_403_FORBIDDEN, headers=e)
        serializer_personal = UserPersonalSerializer(data=request.data)
        serializer_personal.is_valid(raise_exception=True)
        serializer_personal.save()
        print(serializer_personal.data)
        userDict = dict(
            personal=serializer_personal.data['id'],
            email=request.data['email'],
            password=request.data['password'],
            p_version=request.data['p_version'],
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(userDict)
        print(query_dict)
        serializer = UserCreateSerializer(data=userDict)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        res_data = {'registration': _("Registration success!")}
        res_data.update(serializer.data)
        return Response(res_data, status=status.HTTP_201_CREATED, headers=headers)
