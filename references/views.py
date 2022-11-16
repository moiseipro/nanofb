from django.contrib.auth.mixins import PermissionRequiredMixin
from django.http import HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response

from players.models import UserPlayer
from players.serializers import UserPlayerSerializer
from references.forms import CreateTeamForm, CreateSeasonForm
from references.models import UserSeason, UserTeam, ClubSeason, ClubTeam, ExsAdditionalData, PlayerProtocolStatus
from references.serializers import UserTeamsSerializer, UserSeasonsSerializer, ExsAdditionalDataSerializer, \
    PlayerProtocolStatusSerializer, ClubTeamsSerializer, ClubSeasonsSerializer


# REST PERMISSIONS
from users.models import User


class ReferencePermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


# REST FRAMEWORK
class TeamViewSet(viewsets.ModelViewSet):
    permission_classes = [ReferencePermissions]

    def perform_create(self, serializer):
        if self.request.user.club_id is not None:
            serializer.save(club_id=self.request.user.club_id)
        else:
            serializer.save(user_id=self.request.user)

    @action(detail=True, methods=['get'])
    def get_team_players(self, request, pk=None):
        data = request.data
        queryset = UserPlayer.objects.filter(team=pk)
        print(queryset)

        serializer = UserPlayerSerializer(queryset, many=True)
        return Response({'status': 'players_got', 'objs': serializer.data})

    @action(detail=True, methods=['post'])
    def change_permission(self, request, pk=None):
        data = request.data

        team_edit = ClubTeam.objects.get(id=pk, club_id=request.user.club_id)
        print(team_edit.users.all())
        user = User.objects.get(id=data['user_id'])
        print(data)
        if user in team_edit.users.all():
            team_edit.users.remove(user)
            return Response({'status': 'user_removed'})
        else:
            team_edit.users.add(user)
            return Response({'status': 'user_added'})

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            return ClubTeamsSerializer
        else:
            return UserTeamsSerializer
        #if self.action == 'partial_update':

    def get_queryset(self):
        request = self.request
        if request.user.club_id is not None:
            if request.user.has_perm('clubs.club_admin'):
                team = ClubTeam.objects.filter(club_id=request.user.club_id)
            else:
                team = ClubTeam.objects.filter(club_id=request.user.club_id, users=request.user)
        else:
            team = UserTeam.objects.filter(user_id=request.user)
        return team


class SeasonViewSet(viewsets.ModelViewSet):
    permission_classes = [ReferencePermissions]

    def perform_create(self, serializer):
        if self.request.user.club_id is not None:
            serializer.save(club_id=self.request.user.club_id)
        else:
            serializer.save(user_id=self.request.user)

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            return ClubSeasonsSerializer
        else:
            return UserSeasonsSerializer
        #if self.action == 'partial_update':

    def get_queryset(self):
        request = self.request
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(club_id=request.user.club_id)
        else:
            season = UserSeason.objects.filter(user_id=request.user)
        return season


class ExsAdditionalViewSet(viewsets.ModelViewSet):
    permission_classes = [DjangoModelPermissions]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return ExsAdditionalDataSerializer
        return ExsAdditionalDataSerializer

    def get_queryset(self):
        return ExsAdditionalData.objects.all()


class PlayerProtocolStatusViewSet(viewsets.ModelViewSet):
    permission_classes = [DjangoModelPermissions]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return PlayerProtocolStatusSerializer
        return PlayerProtocolStatusSerializer

    def get_queryset(self):
        return PlayerProtocolStatus.objects.all()


# DJANGO
class SettingsView(TemplateView):
    template_name = 'references/base_settings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['team_form'] = CreateTeamForm
        context['season_form'] = CreateSeasonForm
        return context
    pass


# Custom view
def change_season(request):
    if request.method == "POST":
        if request.POST['season_value'] is None:
            request.session['season'] = str(UserSeason.objects.filter(user_id=request.user).first().id)
        else:
            request.session['season'] = request.POST['season_value']
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


def change_team(request):
    if request.method == "POST":
        if request.POST['team_value'] is None:
            request.session['team'] = str(UserTeam.objects.filter(user_id=request.user).first().id)
        else:
            request.session['team'] = request.POST['team_value']
        print(type(request.session['team']))
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

