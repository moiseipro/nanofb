from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response

from clubs.models import Club
from clubs.serializers import ClubSerializer
from users.models import User
from users.serializers import UserSerializer


class ClubPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['clubs.club_admin'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['clubs.club_admin'],
        'PUT': ['clubs.club_admin'],
        'PATCH': ['clubs.club_admin'],
        'DELETE': ['clubs.club_admin'],
    }


# Create your views here.
class BaseClubView(LoginRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'clubs/admin_panel.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # context['update_form'] = UpdateVideoForm()
        return context


class ClubUsersViewSet(viewsets.ModelViewSet):
    # filter_backends = (DatatablesFilterBackend,)
    # filterset_class = VideoGlobalFilter

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_permissions(self):
        permission_classes = [ClubPermissions]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return UserSerializer

    def get_queryset(self):
        users = User.objects.filter(club_id=self.request.user.club_id)
        result = users
        print(result)
        return result


class ClubViewSet(viewsets.ModelViewSet):
    # filter_backends = (DatatablesFilterBackend,)
    # filterset_class = VideoGlobalFilter

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_permissions(self):
        permission_classes = [ClubPermissions]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return ClubSerializer

    def get_queryset(self):
        club = Club.objects.filter(id=self.request.user.club_id.id)
        result = club
        print(result)
        return result