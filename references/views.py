from django.http import HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from references.forms import CreateTeamForm, CreateSeasonForm
from references.models import UserSeason, UserTeam, ClubSeason, ClubTeam, ExsAdditionalData
from references.serializers import UserTeamsSerializer, UserSeasonsSerializer, ExsAdditionalDataSerializer


# REST FRAMEWORK
class TeamViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return UserTeamsSerializer
        return UserTeamsSerializer

    def get_queryset(self):
        return UserTeam.objects.filter(user_id=self.request.user)


class SeasonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return UserSeasonsSerializer
        return UserSeasonsSerializer

    def get_queryset(self):
        return UserSeason.objects.filter(user_id=self.request.user)


class ExsAdditionalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return ExsAdditionalDataSerializer
        return ExsAdditionalDataSerializer

    def get_queryset(self):
        return ExsAdditionalData.objects.all()


# DJANGO
class SettingsView(TemplateView):
    template_name = 'references/base_settings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teams_list'] = UserTeam.objects.filter(user_id=self.request.user)
        context['seasons_list'] = UserSeason.objects.filter(user_id=self.request.user)
        context['team_form'] = CreateTeamForm
        context['season_form'] = CreateSeasonForm
        return context
    pass


# Custom view
def change_season(request):
    if request.method == "POST":
        if request.POST['season_value'] is None:
            request.session['season'] = UserSeason.objects.filter(user_id=request.user).first().id
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

