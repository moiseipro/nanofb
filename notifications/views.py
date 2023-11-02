from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend
from rest_framework.response import Response

from notifications.filters import NotificationUserManagementGlobalFilter
from notifications.models import Notification, NotificationUser
from notifications.serializers import NotificationSerializer, NotificationUserSerializer
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
        context['menu_notification'] = "active"
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
    permission_classes = (IsAdminUser,)
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