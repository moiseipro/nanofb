import imp
import io
import os
import zipfile
from itertools import islice, chain

import requests
import json

from django.http import Http404, QueryDict, HttpResponse, FileResponse
from django.urls import reverse_lazy
from django.utils.dateparse import parse_duration
from django.db.models import Q, Count, F
from pytube import extract
from django.views.generic import ListView, DetailView, CreateView, TemplateView
from django.contrib import messages
from django.shortcuts import render, redirect
from rest_framework import viewsets, status, generics
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend
from rest_framework.permissions import IsAuthenticated, IsAdminUser, DjangoModelPermissions
from django.core.files.storage import FileSystemStorage
from requests_toolbelt.multipart.encoder import MultipartEncoder
from rest_framework.response import Response
from taggit.models import Tag

from exercises.models import ExerciseVideo, AdminExercise, AdminFolder
from exercises.serializers import ExerciseVideoSerializer
from video.filters import VideoGlobalFilter
from video.serializers import VideoSerializer, VideoUpdateSerializer, OnlyVideoSerializer
from references.models import VideoSource
from video.forms import CreateVideoForm, UpdateVideoForm
from video.models import Video, VideoTags
from system_icons.views import get_ui_elements

context_page = {'menu_video': 'active'}


class VideoPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': [],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


# API REST
class VideoViewSet(viewsets.ModelViewSet):
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = VideoGlobalFilter

    def get_permissions(self):
        permission_classes = [IsAuthenticated, VideoPermissions]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        note_video = False
        note_animation = False
        data = request.data
        print(data)
        links = {'nftv': '', 'youtube': ''}
        data_dict = dict(
            name=data['name'],
            duration=data['duration'],
            language=data['language'],
            videosource_id=data['videosource_id']
        )
        if 'note_animation' in data:
            note_animation = True
        if 'note_video' in data:
            note_video = True
        note = json.dumps({'video': note_video, 'animation': note_animation})
        data_dict['note'] = note
        if 'music' in data:
            data_dict['music'] = data['music']
        else:
            data_dict['music'] = 'off'
        if 'taggit' in data:
            data_dict['taggit'] = data['taggit']
        if 'file_video' in request.FILES:
            url = 'https://nanofootball.pro/api/add_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
            fs = FileSystemStorage()
            print(request.FILES)
            file_name = fs.save(request.FILES['file_video'].name, self.request.FILES['file_video'])
            file_content_type = request.FILES['file_video'].content_type

            with fs.open(file_name, 'rb') as file:
                mp_encoder = MultipartEncoder(
                    fields={
                        'folder-type': '',
                        'user-file': (file_name, file, file_content_type)
                    }
                )
                print(mp_encoder)
                response = requests.post(url, data=mp_encoder, headers={'Content-Type': mp_encoder.content_type}, verify=False)
                content = response.json()
                if 'data' in content:
                    video_data = content['data'][0]
                else:
                    video_data = content
                print(content)
            fs.delete(file_name)

            if video_data['success']:
                links['nftv'] = video_data['id']
                url = 'https://nanofootball.pro/video/length/' + video_data['id']
                try:
                    response = requests.get(url, verify=False)
                    content = json.loads(response.content.decode('utf-8'))
                    data_dict['duration'] = content['time']
                except requests.exceptions.ConnectionError as e:
                    response = "No response"

                url = 'https://nanofootball.pro/api/change_cover/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
                if 'file_screen' in request.FILES:
                    fs = FileSystemStorage()
                    file_name = fs.save(request.FILES['file_screen'].name, self.request.FILES['file_screen'])
                    file_content_type = request.FILES['file_screen'].content_type
                    with fs.open(file_name, 'rb') as file:
                        mp_encoder = MultipartEncoder(
                            fields={
                                'id': video_data['id'],
                                'type': 'file',
                                'user-cover': (file_name, file, file_content_type)
                            }
                        )
                        # print(mp_encoder)
                        response = requests.post(url, data=mp_encoder,
                                                 headers={'Content-Type': mp_encoder.content_type}, verify=False)
                        content = response.json()
                        print(content)

                    fs.delete(file_name)
                elif 'second_screensaver' in data:
                    if data['second_screensaver'] == '':
                        data['second_screensaver'] = "1"
                    mp_encoder = MultipartEncoder(
                        fields={
                            'id': video_data['id'],
                            'type': 'frame',
                            'time': data['second_screensaver']
                        }
                    )
                    response = requests.post(url, data=mp_encoder,
                                             headers={'Content-Type': mp_encoder.content_type}, verify=False)
                    content = response.json()
                    print(content)

        if 'youtube_link' in data and data['youtube_link']:
            id_video = extract.video_id(data['youtube_link'])
            if id_video:
                links['youtube'] = id_video

        print(links)
        if links['nftv'] or links['youtube']:
            data_dict['links'] = json.dumps(links)

            query_dict = QueryDict('', mutable=True)
            query_dict.update(data_dict)
            print(query_dict)
            serializer = self.get_serializer(data=query_dict)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response({'empty_load': 'You cant create an object without links to the video'}, status=status.HTTP_423_LOCKED)

    def perform_update(self, serializer):
        music = False
        note_video = False
        note_animation = False
        duration = '00:00:00'
        instance = self.get_object()
        if 'note_animation' in self.request.data:
            note_animation = True
        if 'note_video' in self.request.data:
            note_video = True
        note = {'video': note_video, 'animation': note_animation}
        print(note)
        if 'music' in self.request.data:
            music = True
        if 'duration' in self.request.data and self.request.data['duration'] == '00:00:00' and instance.links['nftv'] != '':
            # print(serializer)
            url = 'https://nanofootball.pro/video/length/' + instance.links['nftv']
            try:
                response = requests.get(url, verify=False)
                content = json.loads(response.content.decode('utf-8'))
                print(content)
                if 'time' in content:
                    duration = content['time']
            except requests.exceptions.ConnectionError as e:
                response = "No response"
        if duration == '00:00:00':
            serializer.save(music=music, note=note)
        else:
            serializer.save(music=music, note=note, duration=parse_duration(duration))

    def update(self, request, *args, **kwarg):
        partial = True
        data = request.data
        instance = self.get_object()
        data.links = instance.links

        print(data)
        if 'file_video' in request.FILES:
            is_delete = False
            server_id = None
            # print(instance.links)
            if 'nftv' in instance.links:
                server_id = instance.links['nftv']
            # print(server_id)
            if server_id:
                url = 'https://nanofootball.pro/api/remove_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
                post_data = {
                    "videos": [
                        {"id": server_id},
                    ]
                }
                response = requests.post(url, json=post_data, headers={'Content-Type': 'application/json'}, verify=False)
                content = response.json()
                # print(content)
                video_data = content['data'][0]
                is_delete = video_data['success'] or 'error' in video_data and video_data[
                    'error'] == 'not found by this ids'
            else:
                is_delete = True
            if is_delete:
                url = 'https://nanofootball.pro/api/add_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
                fs = FileSystemStorage()
                file_name = fs.save(request.FILES['file_video'].name, self.request.FILES['file_video'])
                file_content_type = request.FILES['file_video'].content_type
                print(request.FILES)
                with fs.open(file_name, 'rb') as file:
                    mp_encoder = MultipartEncoder(
                        fields={
                            'folder-type': '',
                            'user-file': (file_name, file, file_content_type)
                        }
                    )
                    # print(mp_encoder)
                    response = requests.post(url, data=mp_encoder, headers={'Content-Type': mp_encoder.content_type}, verify=False)
                    content = response.json()
                    video_data = content['data'][0]
                    # print(content)

                fs.delete(file_name)

                if video_data['success']:
                    data.links['nftv'] = video_data['id']

        url = 'https://nanofootball.pro/api/change_cover/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
        if 'file_screen' in request.FILES:
            fs = FileSystemStorage()
            file_name = fs.save(request.FILES['file_screen'].name, self.request.FILES['file_screen'])
            file_content_type = request.FILES['file_screen'].content_type
            with fs.open(file_name, 'rb') as file:
                mp_encoder = MultipartEncoder(
                    fields={
                        'id': data.links['nftv'],
                        'type': 'file',
                        'user-cover': (file_name, file, file_content_type)
                    }
                )
                # print(mp_encoder)
                response = requests.post(url, data=mp_encoder,
                                         headers={'Content-Type': mp_encoder.content_type}, verify=False)
                content = response.json()
                print(content)

            fs.delete(file_name)
        elif 'second_screensaver' in data and 'nftv' in data.links and data.links['nftv'] != '':
            second_screensaver = data['second_screensaver']
            if second_screensaver == '':
                second_screensaver = "1"
            mp_encoder = MultipartEncoder(
                fields={
                    'id': data.links['nftv'],
                    'type': 'frame',
                    'time': second_screensaver
                }
            )
            response = requests.post(url, data=mp_encoder,
                                     headers={'Content-Type': mp_encoder.content_type}, verify=False)
            content = response.json()
            print(content)

        if 'youtube_link' in data and data['youtube_link']:
            id_video = extract.video_id(data['youtube_link'])
            if id_video:
                data.links['youtube'] = id_video
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)
        print(serializer.data)
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
                is_delete = delete_video_nf(server_id)
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

    @action(detail=True, methods=['GET'])
    def download_video(self, request, pk=None):
        queryset = Video.objects.all()
        video = get_object_or_404(queryset, pk=pk)
        video_data = {}
        if video:
            server_id = None
            youtube_id = None
            print(video.links)
            if 'nftv' in video.links:
                server_id = video.links['nftv']
            elif 'youtube' in video.links:
                youtube_id = video.links['youtube']
            print(server_id)
            if server_id or youtube_id:
                url = 'https://nanofootball.pro/api/download_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
                post_data = {
                    "videos": [
                        {"id": server_id},
                        {"youtube_id": youtube_id}
                    ]
                }
                response = requests.post(url, json=post_data, headers={'Content-Type': 'application/json'}, verify=False)
                print(response)
                buffer = io.BytesIO(response.content)
                # zip_file = zipfile.ZipFile(buffer, 'r')
                # print(zip_file.printdir())
                # zip_file.close()

                response = HttpResponse(buffer.getvalue())
                response['Content-Type'] = 'application/x-zip-compressed'
                response['Content-Disposition'] = 'attachment; filename=album.zip'


                print(response)
        return response

    def get_serializer_class(self):
        if self.action == 'update' or self.action == 'partial_update' or self.action == 'create':
            return VideoUpdateSerializer
        return VideoSerializer

    def get_queryset(self):

        return Video.objects.all()#.order_by('adminexercise__folder__parent', 'adminexercise__folder__order')


def delete_video_nf(video_id):
    url = 'https://nanofootball.pro/api/remove_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
    post_data = {
        "videos": [
            {"id": video_id},
        ]
    }
    response = requests.post(url, json=post_data, headers={'Content-Type': 'application/json'}, verify=False)
    content = response.json()
    print(content)
    video_data = content['data'][0]
    is_delete = video_data['success'] or 'error' in video_data and video_data[
        'error'] == 'not found by this ids'
    return is_delete


def delete_video_obj_nf(video_obj):
    instance = video_obj
    is_delete = True
    server_id = None
    if 'nftv' in instance.links:
        server_id = instance.links['nftv']
    if server_id:
        url = 'https://nanofootball.pro/api/remove_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
        post_data = {
            "videos": [
                {"id": server_id},
            ]
        }
        response = requests.post(url, json=post_data, headers={'Content-Type': 'application/json'}, verify=False)
        content = response.json()
        print(content)
        video_data = content['data'][0]
        is_delete = video_data['success'] or 'error' in video_data and video_data[
            'error'] == 'not found by this ids'
    return is_delete


class VideoExerciseViewSet(viewsets.ModelViewSet):
    # filter_backends = (DatatablesFilterBackend,)
    # filterset_class = VideoGlobalFilter

    def get_permissions(self):
        permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return ExerciseVideoSerializer

    def get_queryset(self):
        video = ExerciseVideo.objects.filter()
        result = video
        print(result)
        return result


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
        context['sources'] = VideoSource.objects.all().annotate(videos=Count('video')).order_by('-videos')
        context['folders'] = AdminFolder.objects.exclude(parent=None).order_by('parent', 'order')
        context['tags'] = Tag.objects.all()
        context['ui_elements'] = get_ui_elements(self.request)
        # context['update_form'] = UpdateVideoForm()
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
            url = 'https://nanofootball.pro/api/add_videos/hydheuCdF4q6tB9RB5rYhGUQx7VnQ5VSS7X5tws7'
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
                response = requests.post(url, data=mp_encoder, headers={'Content-Type': mp_encoder.content_type}, verify=False)
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
        response = requests.get(
            f'https://nanofootball.pro/api/token/3F4AwFqWHk3GYGJuDRWh/?&folders[]="Z13"', verify=False)  # ?&folders[]="Z10"&folders[]="Z11"&folders[]="Z12"&folders[]="Z13"&folders[]="Z14"&folders[]="Z15"&folders[]="Z16"&folders[]="Z17"&folders[]="Z18"&folders[]="Z19"&folders[]="Z20"&folders[]="Z21"&folders[]="Z22"&folders[]="Z23"&folders[]="Z24"&folders[]="Z25"&folders[]="Z26"&folders[]="Z27"&folders[]="Z28"&folders[]="Z29"&folders[]="Z30"&folders[]="Z31"&folders[]="Z32"&folders[]="Z33"&folders[]="Z34"&folders[]="Z35"&folders[]="Z36"&folders[]="Z37"
        context_page['content'] = json.loads(response.content.decode('utf-8'))
        videos = []
        sources = []
        sources_name = []
        video_nftv = []
        video_youtube = []
        server_sources = VideoSource.objects.all()
        server_video = Video.objects.all()
        for ss in server_sources:
            if ss.name not in sources_name:
                sources_name.append(ss.name)
        for sv in server_video:
            if 'nftv' in sv.links and sv.links['nftv'] not in video_nftv:
                video_nftv.append(sv.links['nftv'])
            if 'youtube' in sv.links and sv.links['youtube'] not in video_youtube:
                video_youtube.append(sv.links['youtube'])
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
                                    if links['nftv'].isdigit():
                                        url = 'https://nanofootball.pro/video/length/' + links['nftv']
                                        # try:
                                        #     response = requests.get(url)
                                        #     print(response.content)
                                        #     content = json.loads(response.content.decode('utf-8'))
                                        #     if 'time' in content:
                                        #         duration = content['time']
                                        #     elif 'error' in content:
                                        #         links['nftv'] = ''
                                        # except requests.exceptions.ConnectionError as e:
                                        #     response = "No response"
                                    else:
                                        links['nftv'] = ''

                                if n['video_id_youtube'] is not None and n['video_id_youtube'][i] != '':
                                    links['youtube'] = n['video_id_youtube'][i]
                                if (links['nftv'] != '' and links['nftv'] not in video_nftv) or (links['youtube'] != '' and links['youtube'] not in video_youtube):
                                    videos.append(Video(name=n['name'] if n['name'] else 'No name', old_id=n['id'],
                                                        links=links, videosource_id=ss,
                                                        duration=parse_duration(duration)))
                            break
            else:
                if n['video_id'] is not None:
                    for i in range(len(n['video_id'])):
                        links = {'nftv': '', 'youtube': ''}
                        duration = '00:00:00'
                        if n['video_id'][i] != '':
                            nftv_list = n['video_id'][i].split("|")
                            if len(nftv_list) > 1:
                                links['nftv'] = nftv_list[1]
                            else:
                                links['nftv'] = nftv_list[0]
                            if links['nftv'].isdigit():
                                url = 'https://nanofootball.pro/video/length/' + links['nftv']
                                # try:
                                #     response = requests.get(url)
                                #     print(response.content)
                                #     content = json.loads(response.content.decode('utf-8'))
                                #     if 'time' in content:
                                #         duration = content['time']
                                #     elif 'error' in content:
                                #         links['nftv'] = ''
                                # except requests.exceptions.ConnectionError as e:
                                #     response = "No response"
                            else:
                                links['nftv'] = ''
                        if n['video_id_youtube'] is not None and n['video_id_youtube'][i] != '':
                            links['youtube'] = n['video_id_youtube'][i]
                        if (links['nftv'] != '' and links['nftv'] not in video_nftv) or (links['youtube'] != '' and links['youtube'] not in video_youtube):
                            videos.append(Video(name=n['name'] if n['name'] else 'No name', old_id=n['id'],
                                                links=links, duration=parse_duration(duration)))

        batch = list(sources)
        created_source = VideoSource.objects.bulk_create(batch)
        context_page['sources'] = created_source
        batch = list(videos)
        created_videos = Video.objects.bulk_create(batch)
        context_page['videos'] = created_videos
        if context_page['sources']:
            messages.success(request, "Source parse successfully.")
        if context_page['videos']:
            messages.success(request, "Video parse successfully.")

    return render(request=request, template_name="video/parse_video.html", context=context_page)
