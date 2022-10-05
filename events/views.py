from django.http import HttpResponse
from django.shortcuts import render
from django.utils.datetime_safe import datetime
from django.db.models import Q, Count
from django.views.generic import TemplateView
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend

from events.filters import EventGlobalFilter
from events.forms import MicrocycleUserForm, EventUserForm, EventEditUserForm
from events.models import UserMicrocycles, UserEvent
from events.serializers import UserMicrocyclesSerializer, UserMicrocyclesUpdateSerializer, UserEventSerializer, \
    UserEventEditSerializer
from matches.models import UserMatch
from references.models import UserTeam, UserSeason
from trainings.models import UserTraining
from system_icons.views import get_ui_elements


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
    # filter_backends = (DatatablesFilterBackend,)
    # filterset_class = EventGlobalFilter

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if self.perform_create(serializer):
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response({'status': 'event_type_full'})

    def perform_create(self, serializer):
        print(self.request.data)
        user = self.request.user
        cur_date = datetime.strptime(self.request.data['date'], "%d/%m/%Y %H:%M").date()
        print(cur_date)
        team = UserTeam.objects.get(pk=self.request.session['team'])
        if 'event_type' in self.request.data and '1' in self.request.data['event_type']:
            count_tr = UserEvent.objects.filter(user_id=user, date__date=cur_date, usertraining__team_id=team).count()
            print(count_tr)
            if count_tr < 2:
                event = serializer.save(user_id=user)
                new_training = UserTraining.objects.create(team_id=team, event_id=event)
                new_training.save()
                return True
            else:
                return False
        elif 'event_type' in self.request.data and '2' in self.request.data['event_type']:
            count_m = UserEvent.objects.filter(user_id=user, date__date=cur_date, usermatch__team_id=team).count()
            print(count_m)
            if count_m < 2:
                event = serializer.save(user_id=user)
                new_match = UserMatch.objects.create(team_id=team, event_id=event)
                new_match.save()
                return True
            else:
                return False

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
        microcycle_before = self.request.query_params.get('columns[1][search][value][only_date_before]')
        microcycle_after = self.request.query_params.get('columns[1][search][value][only_date_after]')
        #print(self.request.query_params)
        team = self.request.session['team']
        season = UserSeason.objects.filter(id=self.request.session['season'])
        #print(season[0].date_with)
        events = UserEvent.objects.filter(Q(usertraining__team_id=team) | Q(usermatch__team_id=team),
                                          user_id=self.request.user,
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
        context['ui_elements'] = get_ui_elements(self.request)
        return context
