from django.contrib import messages
from django.shortcuts import render, redirect
from video.forms import CreateVideoForm

context = {'menu_video': 'active'}


def index(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    return render(request=request, template_name="video/base_video.html", context=context)


def view_video(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    return render(request=request, template_name="video/view_video.html", context=context)


def add_video(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    if request.method == "POST":
        form = CreateVideoForm(request.POST)
        if form.is_valid():
            video = form.save(commit=False)

            video.save()
            messages.success(request, "Video added successfully.")
            return redirect("video:view_video")
    form = CreateVideoForm()
    context['create_form'] = form;

    return render(request=request, template_name="video/add_video.html", context=context)
