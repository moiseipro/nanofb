from django.shortcuts import render
from django.utils.datetime_safe import datetime
from django.views.generic import TemplateView
from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated

from events.models import UserMicrocycles
from events.serializers import UserMicrocyclesSerializer
from references.models import UserTeam, UserSeason


# Create your views here.
# REST FRAMEWORK
class MicrocycleListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return UserMicrocyclesSerializer

    def get_queryset(self):
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
        return context
