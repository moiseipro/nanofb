from django.http import HttpResponse
from django.shortcuts import render
from django.utils.datetime_safe import datetime
from django.views.generic import TemplateView
from requests import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend

from events.filters import EventGlobalFilter
from events.forms import MicrocycleUserForm, EventUserForm, EventEditUserForm
from events.models import UserMicrocycles, UserEvent
from events.serializers import UserMicrocyclesSerializer, UserMicrocyclesUpdateSerializer, UserEventSerializer, \
    UserEventEditSerializer
from references.models import UserTeam, UserSeason
from trainings.models import UserTraining


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


class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = EventGlobalFilter

    def perform_create(self, serializer):
        #print(self.request.data)
        user = self.request.user
        team = UserTeam.objects.get(pk=self.request.session['team'])
        event = serializer.save(user_id=user)
        if 'event_type' in self.request.data and '1' in self.request.data['event_type']:
            new_training = UserTraining.objects.create(team_id=team, event_id=event)
            new_training.save()

    # def list(self, request, *args, **kwargs):
    #     queryset = self.filter_queryset(self.get_queryset())
    #
    #     page = self.paginate_queryset(queryset)
    #     if page is not None:
    #         serializer = self.get_serializer(page, many=True)
    #         new_serializer_data = {'new': 'item'}
    #         new_serializer_data = list(serializer.data)
    #         print(new_serializer_data)
    #         return self.get_paginated_response(serializer.data)
    #
    #     serializer = self.get_serializer(queryset, many=True)
    #     return Response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'update':
            return UserEventEditSerializer
        return UserEventSerializer

    def get_queryset(self):
        microcycle_before = self.request.query_params.get('columns[1][search][value][date_before]')
        microcycle_after = self.request.query_params.get('columns[1][search][value][date_after]')
        #print(microcycle_after)
        season = UserSeason.objects.filter(id=self.request.session['season'])
        #print(season[0].date_with)
        events = UserEvent.objects.filter(user_id=self.request.user,
                                          date__gte=season[0].date_with,
                                          date__lte=season[0].date_by)
        if microcycle_before is not None and microcycle_after is not None:
            events = events.filter(date__gte=microcycle_after,
                                   date__lte=microcycle_before)
        return events


# DJANGO
class EventsView(TemplateView):
    template_name = "events/base_events.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teams_list'] = UserTeam.objects.filter(user_id=self.request.user)
        context['seasons_list'] = UserSeason.objects.filter(user_id=self.request.user)
        context['microcycle_form'] = MicrocycleUserForm
        context['event_form'] = EventUserForm
        context['event_edit_form'] = EventEditUserForm
        return context
