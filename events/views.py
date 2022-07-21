from django.http import HttpResponse
from django.shortcuts import render
from django.utils.datetime_safe import datetime
from django.views.generic import TemplateView
from requests import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from events.forms import MicrocycleUserForm, EventUserForm
from events.models import UserMicrocycles
from events.serializers import UserMicrocyclesSerializer, UserMicrocyclesUpdateSerializer
from references.models import UserTeam, UserSeason


# Create your views here.
# REST FRAMEWORK
class MicrocycleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team = UserTeam.objects.get(pk=self.request.session['team'])
        serializer.save(team_id=team)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return UserMicrocyclesUpdateSerializer
        return UserMicrocyclesSerializer

    def get_queryset(self):
        if self.action == 'partial_update':
            return UserMicrocycles.objects.all()
        season = UserSeason.objects.filter(id=self.request.session['season'])
        return UserMicrocycles.objects.filter(team_id=self.request.session['team'],
                                              date_with__gte=season[0].date_with,
                                              date_by__lte=season[0].date_by)


# DJANGO
class EventsView(TemplateView):
    template_name = "events/base_events.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teams_list'] = UserTeam.objects.filter(user_id=self.request.user)
        context['seasons_list'] = UserSeason.objects.filter(user_id=self.request.user)
        context['microcycle_form'] = MicrocycleUserForm
        context['event_form'] = EventUserForm
        return context
