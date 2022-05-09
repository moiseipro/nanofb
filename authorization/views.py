from django.shortcuts import render, redirect
from django.http import HttpResponse
from .forms import NewUserForm, NewLoginForm
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
	    if form.is_valid():
		    user = form.save()
		    login(request, user)
		    messages.success(request, "Registration successful." )
		    return redirect("users:profile")
	    messages.error(request, "Unsuccessful registration. Invalid information.")
    form = NewUserForm()
    return render (request=request, template_name="authorization/register.html", context={"register_form":form})


def logout_req(request):
    logout(request)
    messages.info(request, "You have successfully logged out.") 
    return redirect("authorization:login")

