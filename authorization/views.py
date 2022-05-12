from django.shortcuts import render, redirect
from django.http import HttpResponse
from .forms import NewUserForm, NewLoginForm, NewUserPersonalForm
from users.models import User
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages


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
                messages.error(request,"Invalid email or password.")
        else:
            messages.error(request,"Invalid email or password.")
    form = NewLoginForm()
    return render(request=request, template_name="authorization/login.html", context={"login_form":form})


def register_req(request):
    if request.user.is_authenticated:
        return redirect("users:profile")
    if request.method == "POST":
        form = NewUserForm(request.POST)
        form2 = NewUserPersonalForm(request.POST)
        tmp_msg = ""
        if not form.is_valid():
            tmp_msg += "form 1 loh"
        if not form2.is_valid():
            tmp_msg += "form 2 loh"
        if form.is_valid() and form2.is_valid():
            email = form.cleaned_data.get("email")
            if not User.objects.filter(email=email).exists():
                user = form.save()
                form2.save(user.id)
                login(request, user)
                messages.success(request, "Registration successful.")
                return redirect("users:profile")
        messages.error(request, f"Unsuccessful registration. Invalid information. {tmp_msg}")
    form = NewUserForm()
    form2 = NewUserPersonalForm()
    return render (request=request, template_name="authorization/register.html", context={"register_form": form, "register_form2": form2})


def logout_req(request):
    logout(request)
    messages.info(request, "You have successfully logged out.") 
    return redirect("authorization:login")

