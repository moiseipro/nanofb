from django.contrib.auth.models import Group
from django.http import HttpResponse
from django.shortcuts import render, redirect


from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions

# Create your views here.
from users.models import User
from users.serializers import GroupSerializer
from version.models import SectionInformation
from version.serializers import SectionInformationSerializer


class SectionInformationPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': [],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


def index(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request=request, template_name="version/base_version.html")


class PermissionsApiView(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    pagination_class = None

    @action(detail=True, methods=['get'])
    def get_available_group(self, request, pk=None):
        data = request.data
        user = User.objects.get(id=pk)
        serializer_class = GroupSerializer
        if user.club_id is not None:
            queryset = user.club_id.groups
            #queryset = Group.objects.filter(customgroup__text_id="club")
        else:
            queryset = Group.objects.filter(customgroup__text_id="user")

        if not self.request.user.is_superuser:
            queryset = queryset.exclude(customgroup__is_admin=True)

        queryset = queryset.order_by("customgroup__order")
        print(queryset)

        serializer = serializer_class(queryset, many=True)
        return Response({'status': 'available_group', 'objs': serializer.data})

    @action(detail=True, methods=['get'])
    def get_club_available_group(self, request, pk=None):
        data = request.data
        serializer_class = GroupSerializer

        queryset = Group.objects.filter(customgroup__text_id="club")

        if not self.request.user.is_superuser:
            queryset = queryset.exclude(customgroup__is_admin=True)

        queryset = queryset.order_by("customgroup__order")
        print(queryset)

        serializer = serializer_class(queryset, many=True)
        return Response({'status': 'available_group', 'objs': serializer.data})

    def get_serializer_class(self):
        return GroupSerializer

    def get_queryset(self):
        request = self.request

        groups = Group.objects.all()

        return groups


class SectionInformationApiView(viewsets.ModelViewSet):
    permission_classes = (SectionInformationPermissions,)
    pagination_class = None

    @action(detail=False, methods=['get'])
    def get_by_name(self, request):
        data = request.query_params
        serializer_class = SectionInformationSerializer
        print(data['name'])
        queryset = SectionInformation.objects.get(name=data['name'])

        serializer = serializer_class(queryset, many=False)
        print(serializer.data)
        return Response({'status': 'success', 'obj': serializer.data})

    def get_serializer_class(self):
        return SectionInformationSerializer

    def get_queryset(self):
        request = self.request

        section_information = SectionInformation.objects.all()

        return section_information