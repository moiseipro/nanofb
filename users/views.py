from django.shortcuts import render, redirect


def profile_req(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'users/base_profile.html')
