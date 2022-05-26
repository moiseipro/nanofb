import requests
from pytube import extract
from django.views.generic import ListView, DetailView
from django.contrib import messages
from django.shortcuts import render, redirect
from rest_framework import viewsets

from video.serializers import VideoSerializer
from references.models import VideoSource
from video.forms import CreateVideoForm
from video.models import Video

context_menu = {'menu_video': 'active'}


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('videosource_id')
    serializer_class = VideoSerializer


class VideoDetailView(DetailView):
    template_name = 'video/view_video.html'
    model = Video

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class BaseVideoView(ListView):
    template_name = 'video/base_video.html'
    model = VideoSource

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


def index(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    return render(request=request, template_name="video/base_video.html", context=context_menu)


def view_video(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    return render(request=request, template_name="video/view_video.html", context=context_menu)


def add_video(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    if request.method == "POST":
        form = CreateVideoForm(request.POST)
        print(form)
        if form.is_valid():
            if form.data['file']:
                post_data = {
                    'username': 'admin',
                    'password': 'admin',
                    'user-file': request.POST['file']
                }
                response = requests.post('http://213.108.4.28/', post_data)
                content = response.content
                if content['success']:
                    video = form.save(commit=False)
                    video.links = {'server': content['link'][0]}
                    video.save()
                    messages.success(request, "Video added successfully.")
                    return redirect("video:view_video")
                else:
                    messages.error(request, "Error uploading video to the server.")
            elif form.data['youtube_link']:
                video = form.save(commit=False)
                id_video = extract.video_id(form.data['youtube_link'])
                if id_video:
                    video.links = {'youtube': id_video}
                    video.save()
                    messages.success(request, "Video added successfully.")
                    return redirect("video:view_video")
                else:
                    messages.error(request, "Incorrect link to the video!")
            else:
                messages.error(request, "Video creation error. There is no link to the video.")

    form = CreateVideoForm()
    context_menu['create_form'] = form;

    return render(request=request, template_name="video/add_video.html", context=context_menu)
