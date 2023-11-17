from django.db.models import Count
from django.shortcuts import render
from django.utils.timezone import now, localtime
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend
from rest_framework.response import Response
from taggit.models import Tag

from exercises.models import AdminFolder
from notifications.filters import NotificationUserManagementGlobalFilter
from notifications.models import Notification, NotificationUser
from notifications.serializers import NotificationSerializer, NotificationUserSerializer
from references.models import VideoSource
from system_icons.views import get_ui_elements
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic import TemplateView


# Create your views here.
class NotificationManagementView(PermissionRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'notifications/base_notification.html'
    permission_required = 'notification.view_notification'
    #model = User

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        video_params = {}
        video_params['sources'] = VideoSource.objects.all().annotate(videos=Count('video')).order_by('-videos')
        video_params['folders'] = AdminFolder.objects.exclude(parent=None).order_by('parent', 'order')
        video_params['tags'] = Tag.objects.all()
        context['menu_notification'] = "active"
        context['video_params'] = video_params
        context['ui_elements'] = get_ui_elements(self.request)
        return context


class NotificationManagementApiView(viewsets.ModelViewSet):
    permission_classes = (IsAdminUser,)
    filter_backends = (DatatablesFilterBackend,)
    #filterset_class = UserManagementGlobalFilter

    def get_serializer_class(self):
        return NotificationSerializer

    def get_queryset(self):
        request = self.request
        print(request.data)

        notifications = Notification.objects.all()

        return notifications


class NotificationUserManagementApiView(viewsets.ModelViewSet):
    #permission_classes = (IsAdminUser,)
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = NotificationUserManagementGlobalFilter

    def create(self, request, *args, **kwargs):
        print(request.data)
        data = request.data
        many = isinstance(data, list)
        print(data, many)
        serializer = self.get_serializer(data=data, many=many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=False, methods=['get'])
    def get_user_notification(self, request):
        instance = NotificationUser.objects.filter(user_id=request.user, viewed=False, date_receiving__lte=now())
        serializer = NotificationUserSerializer(instance, many=True)
        if serializer.data:
            response = {
                'action': 'get_user_notification',
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def set_view_notification(self, request, pk=None):
        instance = NotificationUser.objects.get(pk=pk)
        instance.viewed = True
        instance.save()
        #serializer = NotificationUserSerializer(instance)
        response = {
            'action': 'set_view_notification',
            'data': ''
        }
        return Response(response, status=status.HTTP_200_OK)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return NotificationUserSerializer

    def get_queryset(self):
        request = self.request
        print(request.data)

        notifications = NotificationUser.objects.all()

        return notifications


class NotificationListApiView(APIView):
    #authentication_classes = [authentication.TokenAuthentication]
    permission_classes = (IsAdminUser,)

    def get(self, request, format=None):
        queryset = Notification.objects.all()
        print(queryset.values())
        list_notifications = [
            {
                'id': data.id,
                'name': data.title,
                #'count': data.versions
            } for data in queryset
        ]
        print(list_notifications)
        notifications_count = {}
        for notification in list_notifications:
            print(notification)
            notifications_count[notification['id']] = notifications_count.get(notification['id'], {'name': '', 'count': 0})
            #notifications_count[notification['id']]['count'] += notification['count']
            notifications_count[notification['id']]['name'] = notification['name']
        print(notifications_count)

        list2 = [{'id': id, 'text': data['name']} for id, data in notifications_count.items()]
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)