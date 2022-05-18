from django.http import HttpResponse
from django.shortcuts import render, redirect


# Create your views here.


def index(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request=request, template_name="version/base_version.html")