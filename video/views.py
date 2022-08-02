import os
from itertools import islice

import requests
import json

from django.http import Http404
from django.urls import reverse_lazy
from pytube import extract
from django.views.generic import ListView, DetailView, CreateView, TemplateView
from django.contrib import messages
from django.shortcuts import render, redirect
from rest_framework import viewsets, status, generics
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import FileSystemStorage
from requests_toolbelt.multipart.encoder import MultipartEncoder
from rest_framework.response import Response

from video.serializers import VideoSerializer, VideoUpdateSerializer
from references.models import VideoSource
from video.forms import CreateVideoForm, UpdateVideoForm
from video.models import Video, VideoTags

context_page = {'menu_video': 'active'}


# API REST
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('videosource_id')
    serializer_class = VideoSerializer

    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            is_delete = True
            server_id = None
            print(instance.links)
            if 'nftv' in instance.links:
                server_id = instance.links['nftv']
            if server_id:
                url = 'http://213.108.4.28/api/remove_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
                post_data = {
                    "videos": [
                        {"id": server_id},
                    ]
                }
                response = requests.post(url, json=post_data, headers={'Content-Type': 'application/json'})
                content = response.json()
                print(content)
                video_data = content['data'][0]
                is_delete = video_data['success']
            if is_delete:
                self.perform_destroy(instance)
        except Http404:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class VideoUpdateApiView(generics.UpdateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoUpdateSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwarg):
        partial = True
        data = request.data
        instance = self.get_object()
        data.links = instance.links
        print(data)
        if data['youtube_link']:
            id_video = extract.video_id(data['youtube_link'])
            if id_video:
                data.links['youtube'] = id_video
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        return Response(serializer.data)


# DJANGO
class VideoDetailView(LoginRequiredMixin, DetailView):
    redirect_field_name = "authorization:login"
    template_name = 'video/view_video.html'
    model = Video

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


class BaseVideoView(LoginRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'video/base_video.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['sources'] = VideoSource.objects.all()
        context['tags'] = VideoTags.objects.all()
        context['update_form'] = UpdateVideoForm()
        return context


class CreateVideoView(LoginRequiredMixin, CreateView):
    redirect_field_name = "authorization:login"
    template_name = 'video/add_video.html'
    model = Video
    success_url = reverse_lazy('video:base_video')

    form_class = CreateVideoForm

    def get_form_class(self):
        exclude_fields = []

        if not self.request.user.has_perm('video.uploading_files'):
            exclude_fields.append('file')

        class CustomCreateVideoForm(CreateVideoForm):
            class Meta(CreateVideoForm.Meta):
                exclude = exclude_fields

        self.form_class = CustomCreateVideoForm
        return self.form_class

    def form_valid(self, form):
        video = form.save(commit=False)
        video.links = {'nftv': '', 'youtube': ''}
        #print(video.links)
        if 'file' in self.request.FILES:
            url = 'http://213.108.4.28/api/add_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
            fs = FileSystemStorage()
            file_name = fs.save(self.request.FILES['file'].name, self.request.FILES['file'])
            file_content_type = self.request.FILES['file'].content_type

            with fs.open(file_name, 'rb') as file:
                mp_encoder = MultipartEncoder(
                    fields={
                        'folder-type': '',
                        'user-file': (file_name, file, file_content_type)
                    }
                )
                print(mp_encoder)
                response = requests.post(url, data=mp_encoder, headers={'Content-Type': mp_encoder.content_type})
                content = response.json()
                video_data = content['data'][0]
                print(content)

            fs.delete(file_name)

            if video_data['success']:
                video.links['nftv'] = video_data['id']

        if form.data['youtube_link']:
            id_video = extract.video_id(form.data['youtube_link'])
            if id_video:
                video.links['youtube'] = id_video
        video.save()
        return super().form_valid(form)


def add_video(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    exclude_fields = []
    if request.user.has_perm('video.uploading_files'):
        exclude_fields.append('file')

    class CustomCreateVideoForm(CreateVideoForm):
        class Meta(CreateVideoForm.Meta):
            model = Video
            exclude = exclude_fields

    if request.method == "POST":
        form = CustomCreateVideoForm(request.POST)

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

    form = CustomCreateVideoForm()
    context_page['create_form'] = form;

    return render(request=request, template_name="video/add_video.html", context=context_page)


def parse_video(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    if request.method == "GET":
        response = requests.get(f'https://nanofootball.kz/api/token/3F4AwFqWHk3GYGJuDRWh/')
        context_page['content'] = json.loads(response.content.decode('utf-8'))
        videos = []
        sources = []
        sources_name = []
        video_name = []
        server_sources = VideoSource.objects.all()
        server_video = Video.objects.all()
        for ss in server_sources:
            if ss.name not in sources_name:
                sources_name.append(ss.name)
        for sv in server_video:
            if sv.name not in video_name:
                video_name.append(sv.name)
        for n in context_page['content']:
            if n['p_source'] is not None:
                if n['p_source']['name'] not in sources_name:
                    sources_name.append(n['p_source']['name'])
                    sources.append(
                        VideoSource(name=n['p_source']['name'], link=n['p_source']['source'], short_name='Empty'))
                if server_sources:
                    for ss in server_sources:
                        if ss.name == n['p_source']['name'] and n['video_id_youtube'] is not None:
                            for y_id in n['video_id_youtube']:
                                if y_id != '':
                                    videos.append(Video(name=n['name'] if n['name'] else 'No name', old_id=n['id'],
                                                        links={'youtube': y_id}, videosource_id=ss))
                            break
            else:
                if n['video_id_youtube'] is not None:
                    for y_id in n['video_id_youtube']:
                        if y_id != '':
                            videos.append(Video(name=n['name'] if n['name'] else 'No name', old_id=n['id'],
                                                links={'youtube': y_id}))

        batch = list(islice(sources, 1, 10))
        created_source = VideoSource.objects.bulk_create(batch)
        context_page['sources'] = created_source
        batch = list(islice(videos, 1, 80))
        created_source = Video.objects.bulk_create(batch)
        context_page['videos'] = created_source
        if context_page['sources']:
            messages.success(request, "Source parse successfully.")
        if context_page['videos']:
            messages.success(request, "Video parse successfully.")

    return render(request=request, template_name="video/parse_video.html", context=context_page)
