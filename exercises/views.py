from django.shortcuts import render, redirect


def exercises(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'exercises/base_exercises.html')


def folders(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'exercises/base_folders.html')
