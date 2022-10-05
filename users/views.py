import imp
from django.shortcuts import render, redirect
from system_icons.views import get_ui_elements


def profile_req(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'users/base_profile.html', {'ui_elements': get_ui_elements(request)})
