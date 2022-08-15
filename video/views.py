import os
from itertools import islice

import requests
import json

from django.http import Http404, QueryDict
from django.urls import reverse_lazy
from pytube import extract
from django.views.generic import ListView, DetailView, CreateView, TemplateView
from django.contrib import messages
from django.shortcuts import render, redirect
from rest_framework import viewsets, status, generics
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.files.storage import FileSystemStorage
from requests_toolbelt.multipart.encoder import MultipartEncoder
from rest_framework.response import Response

from video.serializers import VideoSerializer, VideoUpdateSerializer, OnlyVideoSerializer
from references.models import VideoSource
from video.forms import CreateVideoForm, UpdateVideoForm
from video.models import Video, VideoTags

context_page = {'menu_video': 'active'}


# API REST
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('videosource_id')

    def get_permissions(self):
        permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        data = request.data
        print(data)
        links = {'nftv': '', 'youtube': ''}
        data_dict = dict(
            name=data['name'],
            duration=data['duration'],
            language=data['language'],
            videosource_id=data['videosource_id']
        )
        if 'music' in data:
            data_dict['music'] = data['music']
        else:
            data_dict['music'] = 'off'
        if 'tags' in data:
            data_dict['tags'] = data['tags']
        if 'file' in request.FILES:
            url = 'http://213.108.4.28/api/add_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
            fs = FileSystemStorage()
            file_name = fs.save(request.FILES['file'].name, self.request.FILES['file'])
            file_content_type = request.FILES['file'].content_type

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
                links['nftv'] = video_data['id']
                url = 'https://213.108.4.28/video/length/' + video_data['id']
                response = requests.post(url, json={}, headers={'Content-Type': 'application/json'})
                content = response.json()
                data_dict['duration'] = content['time']

        if 'youtube_link' in data and data['youtube_link']:
            id_video = extract.video_id(data['youtube_link'])
            if id_video:
                links['youtube'] = id_video

        data_dict['links'] = json.dumps(links)

        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)
        print(query_dict)
        serializer = self.get_serializer(data=query_dict)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        music = False
        duration = '00:00:00'
        if 'music' in self.request.data:
            music = True
        if 'duration' in self.request.data and self.request.data['duration'] == '00:00:00':
            instance = self.get_object().links
            #print(instance)
            url = 'https://213.108.4.28/video/length/'+instance['nftv']
            response = requests.post(url, json={}, headers={'Content-Type': 'application/json'})
            content = response.json()
            print(content)
            duration = content['time']

        serializer.save(music=music, duration=duration)

    def update(self, request, *args, **kwarg):
        partial = True
        data = request.data
        instance = self.get_object()
        data.links = instance.links

        #print(data)
        if 'file' in request.FILES:
            is_delete = False
            server_id = None
            #print(instance.links)
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
                #print(content)
                video_data = content['data'][0]
                is_delete = video_data['success']
            if is_delete:
                url = 'http://213.108.4.28/api/add_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
                fs = FileSystemStorage()
                file_name = fs.save(request.FILES['file'].name, self.request.FILES['file'])
                file_content_type = request.FILES['file'].content_type

                with fs.open(file_name, 'rb') as file:
                    mp_encoder = MultipartEncoder(
                        fields={
                            'folder-type': '',
                            'user-file': (file_name, file, file_content_type)
                        }
                    )
                    #print(mp_encoder)
                    response = requests.post(url, data=mp_encoder, headers={'Content-Type': mp_encoder.content_type})
                    content = response.json()
                    video_data = content['data'][0]
                    #print(content)

                fs.delete(file_name)

                if video_data['success']:
                    data.links['nftv'] = video_data['id']

        if 'youtube_link' in data and data['youtube_link']:
            id_video = extract.video_id(data['youtube_link'])
            if id_video:
                data.links['youtube'] = id_video
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        return Response(serializer.data)

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

    @action(detail=True, methods=['get'])
    def get_video(self, request, pk=None):
        queryset = Video.objects.all()
        video = get_object_or_404(queryset, pk=pk)
        serializer = OnlyVideoSerializer(video)
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'update' or self.action == 'partial_update' or self.action == 'create':
            return VideoUpdateSerializer
        return VideoSerializer

    def get_queryset(self):
        return Video.objects.all()


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
        #context['update_form'] = UpdateVideoForm()
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
        # print(video.links)
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


def parse_video(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")

    if request.method == "GET":
        response = requests.get(f'https://nanofootball.ru/api/token/3F4AwFqWHk3GYGJuDRWh/?folders[]="A"&folders[]="B"&folders[]="C"&folders[]="D"') #
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
                        if ss.name == n['p_source']['name'] and n['video_id'] is not None:
                            for i in range(len(n['video_id'])):
                                links = {'nftv': '', 'youtube': ''}
                                duration = '00:00:00'
                                if n['video_id'][i] != '':
                                    nftv_list = n['video_id'][i].split("|")
                                    if len(nftv_list) > 1:
                                        links['nftv'] = nftv_list[1]
                                    else:
                                        links['nftv'] = nftv_list[0]
                                    url = 'https://213.108.4.28/video/length/' + links['nftv']
                                    response = requests.post(url, json={}, headers={'Content-Type': 'application/json'})
                                    content = response.json()
                                    duration = content['time']
                                if n['video_id_youtube'] is not None and n['video_id_youtube'][i] != '':
                                    links['youtube'] = n['video_id_youtube'][i]
                                if links['nftv'] != '' or links['youtube'] != '':
                                    videos.append(Video(name=n['name'] if n['name'] else 'No name', old_id=n['id'],
                                                        links=links, videosource_id=ss, duration=duration))
                            break
            else:
                if n['video_id'] is not None:
                    for i in range(len(n['video_id'])):
                        links = {'nftv': '', 'youtube': ''}
                        if n['video_id'][i] != '':
                            nftv_list = n['video_id'][i].split("|")
                            if len(nftv_list) > 1:
                                links['nftv'] = nftv_list[1]
                            else:
                                links['nftv'] = nftv_list[0]
                            url = 'https://213.108.4.28/video/length/' + links['nftv']
                            response = requests.post(url, json={}, headers={'Content-Type': 'application/json'})
                            content = response.json()
                            duration = content['time']
                        if n['video_id_youtube'] is not None and n['video_id_youtube'][i] != '':
                            links['youtube'] = n['video_id_youtube'][i]
                        if links['nftv'] != '' or links['youtube'] != '':
                            videos.append(Video(name=n['name'] if n['name'] else 'No name', old_id=n['id'],
                                                links=links, duration=duration))

        batch = list(sources)
        created_source = VideoSource.objects.bulk_create(batch)
        context_page['sources'] = created_source
        batch = list(videos)
        created_source = Video.objects.bulk_create(batch)
        context_page['videos'] = created_source
        if context_page['sources']:
            messages.success(request, "Source parse successfully.")
        if context_page['videos']:
            messages.success(request, "Video parse successfully.")

    return render(request=request, template_name="video/parse_video.html", context=context_page)
