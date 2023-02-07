import requests
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
                login(request, user)
                messages.info(request, f"You are now logged in as {email}.")
                return redirect("users:profile")
            else:
                messages.error(request, "Invalid email or password.")
        else:
            messages.error(request, "Invalid email or password.")
    form = NewLoginForm()
    return render(request=request, template_name="authorization/login.html", context={"login_form": form})


def register_req(request):
    if request.user.is_authenticated:
        return redirect("users:profile")
    if request.method == "POST":
        form = NewUserForm(request.POST)
        form2 = NewUserPersonalForm(request.POST)
        tmp_msg = ""
        if not form.is_valid():
            for field in form:
                for error in field.errors:
                    tmp_msg += f"* {field.label} : {error}"
        if not form2.is_valid():
            for field in form2:
                for error in field.errors:
                    tmp_msg += f"* {field.label} : {error}"
        if form.is_valid() and form2.is_valid():
            email = form.cleaned_data.get("email")
            if not User.objects.filter(email=email).exists():
                user = form.save()
                form2.save(user)
                login(request, user)
                messages.success(request, "Registration successful.")
                return redirect("users:profile")
        messages.error(request, f"Unsuccessful registration. Invalid information. {tmp_msg}")
    form = NewUserForm()
    form2 = NewUserPersonalForm()
    return render(request=request, template_name="authorization/register.html",
                  context={"register_form": form, "register_form2": form2})


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


# REST FRAMEWORK
class AuthorizationUserViewSet(UserViewSet):
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        print(request.data)
        serializer_personal = UserPersonalSerializer(data=request.data)
        serializer_personal.is_valid(raise_exception=True)
        serializer_personal.save()
        print(serializer_personal.data)
        userDict = dict(
            personal=serializer_personal.data['id'],
            email=request.data['email'],
            password=request.data['password'],
            password2=request.data['password2'],
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
