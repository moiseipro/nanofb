from datetime import timedelta, time

from django.http import HttpResponse, QueryDict
from django.shortcuts import render
from django.utils.datetime_safe import datetime
from django.db.models import Q, F, Count, Subquery
from django.views.generic import TemplateView
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend

from events.filters import EventGlobalFilter
from events.forms import MicrocycleUserForm, EventUserForm, EventEditUserForm
from events.models import UserMicrocycles, UserEvent, ClubMicrocycles, ClubEvent
from events.serializers import UserMicrocyclesSerializer, UserMicrocyclesUpdateSerializer, UserEventSerializer, \
    UserEventEditSerializer, ClubMicrocyclesSerializer, ClubMicrocyclesUpdateSerializer, ClubEventSerializer, \
    ClubEventEditSerializer
from matches.models import UserMatch, ClubMatch
from references.models import UserTeam, UserSeason, ClubSeason, ClubTeam
from trainings.models import UserTraining, ClubTraining, UserTrainingExercise, ClubTrainingExercise
from system_icons.views import get_ui_elements


class BaseEventsPermissions(DjangoModelPermissions):
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
class MicrocycleViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseEventsPermissions]

    def perform_create(self, serializer):
        if self.request.user.club_id is not None:
            team = ClubTeam.objects.get(pk=self.request.session['team'], club_id=self.request.user.club_id)
        else:
            team = UserTeam.objects.get(pk=self.request.session['team'])
        serializer.save(team_id=team)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            if self.request.user.club_id is not None:
                serial = ClubMicrocyclesUpdateSerializer
            else:
                serial = UserMicrocyclesUpdateSerializer
            return serial
        if self.request.user.club_id is not None:
            serial = ClubMicrocyclesSerializer
        else:
            serial = UserMicrocyclesSerializer
        return serial

    def get_queryset(self):
        # if self.action == 'partial_update':
        #     return UserMicrocycles.objects.all()
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            microcycle = ClubMicrocycles.objects.filter(team_id=self.request.session['team'],
                                                        date_with__gte=season[0].date_with,
                                                        date_by__lte=season[0].date_by)
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            microcycle = UserMicrocycles.objects.filter(team_id=self.request.session['team'],
                                                        date_with__gte=season[0].date_with,
                                                        date_by__lte=season[0].date_by)
        return microcycle


class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseEventsPermissions]

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
        if self.request.user.club_id is not None:
            team = ClubTeam.objects.get(pk=self.request.session['team'])
        else:
            team = UserTeam.objects.get(pk=self.request.session['team'])
        if 'event_type' in self.request.data and '1' in self.request.data['event_type']:
            if self.request.user.club_id is not None:
                count_tr = ClubEvent.objects.filter(club_id=self.request.user.club_id, date__date=cur_date,
                                                    clubtraining__team_id=team).count()
            else:
                count_tr = UserEvent.objects.filter(user_id=user, date__date=cur_date,
                                                    usertraining__team_id=team).count()
            print(count_tr)
            if count_tr < 2:
                if self.request.user.club_id is not None:
                    event = serializer.save(user_id=user, club_id=self.request.user.club_id)
                    new_training = ClubTraining.objects.create(team_id=team, event_id=event)
                else:
                    event = serializer.save(user_id=user)
                    new_training = UserTraining.objects.create(team_id=team, event_id=event)
                new_training.save()
                return True
            else:
                return False
        elif 'event_type' in self.request.data and '2' in self.request.data['event_type']:
            if self.request.user.club_id is not None:
                match = ClubEvent.objects.filter(club_id=self.request.user.club_id, date__date=cur_date,
                                                 clubmatch__team_id=team, clubmatch__m_type=0).count()
            else:
                match = UserEvent.objects.filter(user_id=user, date__date=cur_date, usermatch__team_id=team,
                                                 usermatch__m_type=0).count()
            print(match)
            if match == 0:
                if self.request.user.club_id is not None:
                    event = serializer.save(user_id=user, club_id=self.request.user.club_id)
                    new_match = ClubMatch.objects.create(team_id=team, event_id=event, m_type=0)
                else:
                    event = serializer.save(user_id=user)
                    new_match = UserMatch.objects.create(team_id=team, event_id=event, m_type=0)
                new_match.save()
                return True
            else:
                return False
        elif 'event_type' in self.request.data and '3' in self.request.data['event_type']:
            if self.request.user.club_id is not None:
                match = ClubEvent.objects.filter(club_id=self.request.user.club_id, date__date=cur_date,
                                                 clubmatch__team_id=team, clubmatch__m_type=1).count()
            else:
                match = UserEvent.objects.filter(user_id=user, date__date=cur_date, usermatch__team_id=team,
                                                 usermatch__m_type=1).count()
            print(match)
            if match == 0:
                if self.request.user.club_id is not None:
                    event = serializer.save(user_id=user, club_id=self.request.user.club_id)
                    new_match = ClubMatch.objects.create(team_id=team, event_id=event, m_type=1)
                else:
                    event = serializer.save(user_id=user)
                    new_match = UserMatch.objects.create(team_id=team, event_id=event, m_type=1)
                new_match.save()
                return True
            else:
                return False

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        events = serializer.data
        print(events)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def copy_event(self, request, pk=None):
        print(self.request.data)
        user = self.request.user
        cur_date = datetime.strptime(self.request.data['date'], "%Y-%m-%d %H:%M").date()
        if self.request.user.club_id is not None:
            team = ClubTeam.objects.get(pk=self.request.data['team'])
            event = ClubEvent.objects.get(pk=pk)
            try:
                training = ClubTraining.objects.get(pk=pk)
                count_tr = ClubEvent.objects.filter(club_id=self.request.user.club_id, date__date=cur_date,
                                                    clubtraining__team_id=team).count()
            except ClubTraining.DoesNotExist:
                training = None
                count_tr = 0
            try:
                exercises = ClubTrainingExercise.objects.filter(training_id=pk)
                print(exercises)
            except ClubTrainingExercise.DoesNotExist:
                exercises = None
            try:
                match = ClubMatch.objects.get(pk=pk)
                match1 = ClubEvent.objects.filter(club_id=self.request.user.club_id, date__date=cur_date,
                                                  clubmatch__team_id=team, clubmatch__m_type=0).count()
                match2 = ClubEvent.objects.filter(club_id=self.request.user.club_id, date__date=cur_date,
                                                  clubmatch__team_id=team, clubmatch__m_type=1).count()
            except ClubMatch.DoesNotExist:
                match = None
                match1 = 0
                match2 = 0
        else:
            team = UserTeam.objects.get(pk=self.request.data['team'])
            event = UserEvent.objects.get(pk=pk)
            try:
                training = UserTraining.objects.get(pk=pk)
                count_tr = UserEvent.objects.filter(user_id=user, date__date=cur_date,
                                                    usertraining__team_id=team).count()
            except UserTraining.DoesNotExist:
                training = None
                count_tr = 0
            try:
                exercises = UserTrainingExercise.objects.filter(training_id=pk)
                print(exercises)
            except UserTrainingExercise.DoesNotExist:
                exercises = None
            try:
                match = UserMatch.objects.get(pk=pk)
                match1 = UserEvent.objects.filter(user_id=user, date__date=cur_date, usermatch__team_id=team,
                                                  usermatch__m_type=0).count()
                match2 = UserEvent.objects.filter(user_id=user, date__date=cur_date, usermatch__team_id=team,
                                                  usermatch__m_type=1).count()

            except UserMatch.DoesNotExist:
                match = None
                match1 = 0
                match2 = 0

        print(count_tr)
        if count_tr > 1:
            return Response({'status': 'event_type_full'})
        if match1 != 0:
            return Response({'status': 'event_type_full'})
        if match2 != 0:
            return Response({'status': 'event_type_full'})
        print(event)

        if event:
            event.pk = None
            event.date = self.request.data['date']
            event.save()
            if training:
                training.pk = None
                training.event_id = event
                training.team_id = team
                training.protocol.clear()
                training.save()
                for exercise in exercises:
                    exercise.pk = None
                    exercise.training_id = training
                    exercise.save()
                response = Response({'status': 'training_copied'})
            elif match:
                match.pk = None
                match.event_id = event
                match.team_id = team
                match.save()
                response = Response({'status': 'match_copied'})
            else:
                response = Response({'status': 'filed_copied'})
        else:
            response = Response({'status': 'filed_copied'})

        return response

    def get_serializer_class(self):
        if self.action == 'update':
            if self.request.user.club_id is not None:
                serial = ClubEventEditSerializer
            else:
                serial = UserEventEditSerializer
            return serial
        if self.request.user.club_id is not None:
            serial = ClubEventSerializer
        else:
            serial = UserEventSerializer
        return serial

    def get_queryset(self):
        microcycle_before = self.request.query_params.get('to_date')
        microcycle_after = self.request.query_params.get('from_date')
        # print(microcycle_after)
        team = self.request.session['team']
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            events = ClubEvent.objects.filter(Q(clubtraining__team_id=team) | Q(clubmatch__team_id=team),
                                              club_id=self.request.user.club_id,
                                              date__gte=season[0].date_with,
                                              date__lte=season[0].date_by)
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            events = UserEvent.objects.filter(Q(usertraining__team_id=team) | Q(usermatch__team_id=team),
                                              user_id=self.request.user,
                                              date__gte=season[0].date_with,
                                              date__lte=season[0].date_by)

        if microcycle_before is not None and microcycle_after is not None:
            events = events.filter(date__gte=microcycle_after,
                                   date__lte=datetime.combine(datetime.strptime(microcycle_before, '%Y-%m-%d'),
                                                              time.max))

        return events


# DJANGO
class EventsView(TemplateView):
    template_name = "events/base_events.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['microcycle_form'] = MicrocycleUserForm
        context['event_form'] = EventUserForm
        context['event_edit_form'] = EventEditUserForm
        context['ui_elements'] = get_ui_elements(self.request)
        return context
