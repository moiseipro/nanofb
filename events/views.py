from datetime import timedelta, time
from itertools import count

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import HttpResponse, QueryDict
from django.shortcuts import render
from django.utils.datetime_safe import datetime
from django.db.models import Q, F, Count, Subquery
from django.views.generic import TemplateView
from legacy import reduce
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _

from events.filters import EventGlobalFilter
from events.forms import MicrocycleUserForm, EventUserForm, EventEditUserForm
from events.models import UserMicrocycles, UserEvent, ClubMicrocycles, ClubEvent, LiteMicrocycles, LiteEvent
from events.serializers import UserMicrocyclesSerializer, UserMicrocyclesUpdateSerializer, UserEventSerializer, \
    UserEventEditSerializer, ClubMicrocyclesSerializer, ClubMicrocyclesUpdateSerializer, ClubEventSerializer, \
    ClubEventEditSerializer, LiteMicrocyclesUpdateSerializer, LiteMicrocyclesSerializer, LiteEventEditSerializer, \
    LiteEventSerializer
from matches.models import UserMatch, ClubMatch, LiteMatch
from references.models import UserTeam, UserSeason, ClubSeason, ClubTeam
from trainings.models import UserTraining, ClubTraining, UserTrainingExercise, ClubTrainingExercise, LiteTraining, \
    LiteTrainingExercise, ClubTrainingExerciseAdditional, UserTrainingExerciseAdditional, \
    LiteTrainingExerciseAdditional, ClubTrainingObjectiveMany, UserTrainingObjectiveMany
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


class ViewAllEventsPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': [],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


# REST FRAMEWORK
class MicrocycleViewSet(viewsets.ModelViewSet):
    permission_classes = [ViewAllEventsPermissions]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if self.perform_create(serializer):
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response({'status': 'microcycle_full'})

    def perform_create(self, serializer):
        date_with = datetime.strptime(self.request.data['date_with'], "%d/%m/%Y").date()
        date_by = datetime.strptime(self.request.data['date_by'], "%d/%m/%Y").date()
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            if date_with < season[0].date_with or date_by < season[0].date_with or \
                    date_with > season[0].date_by or date_by > season[0].date_by:
                return False
            team = ClubTeam.objects.get(pk=self.request.session['team'], club_id=self.request.user.club_id)
            microcycles = ClubMicrocycles.objects.filter(
                Q(team_id=team) &
                ((Q(date_by__range=[date_with, date_by]) | Q(date_with__range=[date_with, date_by])) |
                 Q(date_with__lte=date_with) & Q(date_by__gte=date_with) |
                 Q(date_with__lte=date_by) & Q(date_by__gte=date_by))
            )
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            if date_with < season[0].date_with or date_by < season[0].date_with or \
                    date_with > season[0].date_by or date_by > season[0].date_by:
                return False
            team = UserTeam.objects.get(pk=self.request.session['team'])
            microcycles = UserMicrocycles.objects.filter(
                Q(team_id=team) &
                ((Q(date_by__range=[date_with, date_by]) | Q(date_with__range=[date_with, date_by])) |
                 Q(date_with__lte=date_with) & Q(date_by__gte=date_with) |
                 Q(date_with__lte=date_by) & Q(date_by__gte=date_by))
            )

        if microcycles.count() == 0:
            serializer.save(team_id=team)
            return True
        else:
            return False

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        date_with = datetime.strptime(self.request.data['date_with'], "%d/%m/%Y").date()
        date_by = datetime.strptime(self.request.data['date_by'], "%d/%m/%Y").date()
        pk = kwargs.pop('pk')
        print(pk)
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            team = ClubTeam.objects.get(pk=self.request.session['team'], club_id=self.request.user.club_id)
            if date_with < season[0].date_with or date_by < season[0].date_with or \
                    date_with > season[0].date_by or date_by > season[0].date_by:
                return Response({'status': 'microcycle_full'})
            microcycles = ClubMicrocycles.objects.filter(
                Q(team_id=team) &
                ((Q(date_by__range=[date_with, date_by]) | Q(date_with__range=[date_with, date_by])) |
                 Q(date_with__lte=date_with) & Q(date_by__gte=date_with) |
                 Q(date_with__lte=date_by) & Q(date_by__gte=date_by))
            ).exclude(pk=pk)
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            team = UserTeam.objects.get(pk=self.request.session['team'])
            if date_with < season[0].date_with or date_by < season[0].date_with or \
                    date_with > season[0].date_by or date_by > season[0].date_by:
                return Response({'status': 'microcycle_full'})
            microcycles = UserMicrocycles.objects.filter(
                Q(team_id=team) &
                ((Q(date_by__range=[date_with, date_by]) | Q(date_with__range=[date_with, date_by])) |
                 Q(date_with__lte=date_with) & Q(date_by__gte=date_with) |
                 Q(date_with__lte=date_by) & Q(date_by__gte=date_by))
            ).exclude(pk=pk)

        if microcycles.count() == 0:
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                # If 'prefetch_related' has been applied to a queryset, we need to
                # forcibly invalidate the prefetch cache on the instance.
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        else:
            return Response({'status': 'microcycle_full'})

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


# LITE MICROCYCLE
class LiteMicrocycleViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseEventsPermissions]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if self.perform_create(serializer):
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response({'status': 'microcycle_full'})

    def perform_create(self, serializer):
        date_with = datetime.strptime(self.request.data['date_with'], "%d/%m/%Y").date()
        date_by = datetime.strptime(self.request.data['date_by'], "%d/%m/%Y").date()
        team = UserTeam.objects.get(pk=self.request.session['team'])
        microcycles = LiteMicrocycles.objects.filter(
            Q(team_id=team) &
            ((Q(date_by__range=[date_with, date_by]) | Q(date_with__range=[date_with, date_by])) |
             Q(date_with__lte=date_with) & Q(date_by__gte=date_with) |
             Q(date_with__lte=date_by) & Q(date_by__gte=date_by))
        )
        if microcycles.count() == 0:
            serializer.save(team_id=team)
            return True
        else:
            return False

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        team = UserTeam.objects.get(pk=self.request.session['team'])
        date_with = datetime.strptime(self.request.data['date_with'], "%d/%m/%Y").date()
        date_by = datetime.strptime(self.request.data['date_by'], "%d/%m/%Y").date()
        pk = kwargs.pop('pk')
        print(pk)

        microcycles = LiteMicrocycles.objects.filter(
            Q(team_id=team) &
            ((Q(date_by__range=[date_with, date_by]) | Q(date_with__range=[date_with, date_by])) |
             Q(date_with__lte=date_with) & Q(date_by__gte=date_with) |
             Q(date_with__lte=date_by) & Q(date_by__gte=date_by))
        ).exclude(pk=pk)

        if microcycles.count() == 0:
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                # If 'prefetch_related' has been applied to a queryset, we need to
                # forcibly invalidate the prefetch cache on the instance.
                instance._prefetched_objects_cache = {}

            return Response(serializer.data)
        else:
            return Response({'status': 'microcycle_full'})

    def get_serializer_class(self):
        if self.action == 'partial_update':
            serial = LiteMicrocyclesUpdateSerializer
        else:
            serial = LiteMicrocyclesSerializer
        return serial

    def get_queryset(self):
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
        microcycle = LiteMicrocycles.objects.filter(team_id=self.request.session['team'],
                                                    date_with__gte=season[0].date_with,
                                                    date_by__lte=season[0].date_by)
        return microcycle


class MicrocycleMCListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubMicrocycles.objects. \
                filter(Q(date_with__gte=season[0].date_with) &
                       Q(date_by__lte=season[0].date_by) &
                       Q(team_id=self.request.session['team'])).order_by('name')
            queryset_training = ClubTraining.objects. \
                filter(Q(event_id__date__gte=season[0].date_with) &
                       Q(event_id__date__lte=season[0].date_by) &
                       Q(event_id__club_id=request.user.club_id) &
                       Q(team_id=self.request.session['team'])).order_by('event_id__date')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserMicrocycles.objects. \
                filter(Q(date_with__gte=season[0].date_with) &
                       Q(date_by__lte=season[0].date_by) &
                       Q(team_id=self.request.session['team'])).order_by('name')
            queryset_training = UserTraining.objects. \
                filter(Q(event_id__date__gte=season[0].date_with) &
                       Q(event_id__date__lte=season[0].date_by) &
                       Q(event_id__user_id=request.user) &
                       Q(team_id=self.request.session['team'])).order_by('event_id__date')

        print(queryset.values())
        list_training = []

        for microcycle in queryset:
            md_days = get_days(microcycle)
            date_with = microcycle.date_with
            date_by = microcycle.date_by

            for training in queryset_training:
                tr_date = training.event_id.date.date()
                tdelta = tr_date - date_with
                days = round(tdelta.total_seconds() / 60 / 60 / 24) + 1
                if tr_date >= date_with and tr_date <= date_by:
                    new_md_value = days if days < 3 else -(md_days - days)
                    new_md_text = "+" + str(new_md_value) if new_md_value > 0 else new_md_value
                    tr_find = False
                    if len(list_training) != 0:
                        for training_data in list_training:
                            if training_data['id'] == new_md_text:
                                training_data['count'] += 1
                                tr_find = True
                    if not tr_find:
                        new_block = {
                            'id': new_md_text,
                            'name': new_md_text,
                            'sort': new_md_value - 20 if new_md_value > 0 else new_md_value,
                            'count': 1
                        }
                        list_training.append(new_block)

        list_training.sort(key=lambda x: x['sort'], reverse=True)
        print(list_training)
        # list_load.sort(key=lambda x: x['count'], reverse=True)

        object_count = {}
        for microcycle in list_training:
            # print(microcycle)
            object_count[microcycle['id']] = object_count.get(microcycle['id'], {'name': '', 'count': 0})
            object_count[microcycle['id']]['count'] += microcycle['count']
            object_count[microcycle['id']]['name'] = microcycle['name']
        # print(object_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in object_count.items()]
        # list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        # print(list2)
        return Response(list2)


class MicrocycleDayListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubMicrocycles.objects. \
                filter(Q(date_with__gte=season[0].date_with) &
                       Q(date_by__lte=season[0].date_by) &
                       Q(team_id=self.request.session['team'])). \
                annotate(count=Count('date_with')).order_by('name')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserMicrocycles.objects. \
                filter(Q(date_with__gte=season[0].date_with) &
                       Q(date_by__lte=season[0].date_by) &
                       Q(team_id=self.request.session['team'])). \
                annotate(count=Count('date_with')).order_by('name')

        print(queryset.values())
        list_microcycle = []

        for microcycle in queryset:
            mc_find = False
            mc_days = get_days(microcycle)
            new_block = {
                'id': mc_days,
                'name': mc_days,
                'count': 1
            }
            for microcycle_data in list_microcycle:
                if microcycle_data['id'] == mc_days:
                    microcycle_data['count'] += 1
                    mc_find = True
            if not mc_find:
                list_microcycle.append(new_block)

        list_microcycle.sort(key=lambda x: x['id'], reverse=False)

        print(list_microcycle)
        # list_load.sort(key=lambda x: x['count'], reverse=True)

        object_count = {}
        for microcycle in list_microcycle:
            # print(microcycle)
            object_count[microcycle['id']] = object_count.get(microcycle['id'], {'name': '', 'count': 0})
            object_count[microcycle['id']]['count'] += microcycle['count']
            object_count[microcycle['id']]['name'] = microcycle['name']
        # print(object_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in object_count.items()]
        # list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        # print(list2)
        return Response(list2)


def get_days(microcycle):
    date_with = microcycle.date_with
    date_by = microcycle.date_by
    tdelta = date_by - date_with
    days = round(tdelta.total_seconds() / 60 / 60 / 24) + 1
    return days


class MicrocycleNameListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(names=Count('name')).order_by('name')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(names=Count('name')).order_by('name')

        list_microcycles = [
            {
                'id': microcycle.name,
                'name': microcycle.name,
                'count': microcycle.names
            } for microcycle in queryset
        ]
        print(list_microcycles)
        microcycles_count = {}
        for microcycle in list_microcycles:
            print(microcycle)
            microcycles_count[microcycle['id']] = microcycles_count.get(microcycle['id'], {'name': '', 'count': 0})
            microcycles_count[microcycle['id']]['count'] += microcycle['count']
            microcycles_count[microcycle['id']]['name'] = microcycle['name']
        print(microcycles_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in microcycles_count.items()]
        # list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


class MicrocycleShortKeyApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(short_keys=Count('short_key')).order_by('short_key')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(short_keys=Count('short_key')).order_by('short_key')

        list_microcycles = [
            {
                'id': microcycle.short_key,
                'name': microcycle.short_key,
                'count': microcycle.short_keys
            } for microcycle in queryset
        ]
        print(list_microcycles)
        microcycles_count = {}
        for microcycle in list_microcycles:
            print(microcycle)
            microcycles_count[microcycle['id']] = microcycles_count.get(microcycle['id'], {'name': '', 'count': 0})
            microcycles_count[microcycle['id']]['count'] += microcycle['count']
            microcycles_count[microcycle['id']]['name'] = microcycle['name']
        print(microcycles_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in microcycles_count.items()]
        # list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


# Не используется
class MicrocycleBlockListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(blocks=Count('block')).order_by('block')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(blocks=Count('block')).order_by('block')

        list_microcycles = [
            {
                'id': microcycle.block,
                'name': microcycle.block,
                'count': microcycle.blocks
            } for microcycle in queryset
        ]
        print(list_microcycles)
        microcycles_count = {}
        for microcycle in list_microcycles:
            print(microcycle)
            microcycles_count[microcycle['id']] = microcycles_count.get(microcycle['id'], {'name': '', 'count': 0})
            microcycles_count[microcycle['id']]['count'] += microcycle['count']
            microcycles_count[microcycle['id']]['name'] = microcycle['name']
        print(microcycles_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in microcycles_count.items()]
        # list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


# Не используется
class MicrocycleBlockKeyApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(block_keys=Count('block_key')).order_by('block_key')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserMicrocycles.objects. \
                filter(team_id=self.request.session['team'], date_with__gte=season[0].date_with,
                       date_by__lte=season[0].date_by). \
                annotate(block_keys=Count('block_key')).order_by('block_key')

        list_microcycles = [
            {
                'id': microcycle.block_key,
                'name': microcycle.block_key,
                'count': microcycle.block_keys
            } for microcycle in queryset
        ]
        print(list_microcycles)
        microcycles_count = {}
        for microcycle in list_microcycles:
            print(microcycle)
            microcycles_count[microcycle['id']] = microcycles_count.get(microcycle['id'], {'name': '', 'count': 0})
            microcycles_count[microcycle['id']]['count'] += microcycle['count']
            microcycles_count[microcycle['id']]['name'] = microcycle['name']
        print(microcycles_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in microcycles_count.items()]
        # list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseEventsPermissions]
    pagination_class = None

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
        cur_time = datetime.strptime(self.request.data['date'], "%d/%m/%Y %H:%M").time()
        print(cur_date)
        if self.request.user.club_id is not None:
            team = ClubTeam.objects.get(pk=self.request.session['team'])
        else:
            team = UserTeam.objects.get(pk=self.request.session['team'])
        if 'event_type' in self.request.data and (
                '1' in self.request.data['event_type'] or '4' in self.request.data['event_type']):
            if self.request.user.club_id is not None:
                tr_query = ClubEvent.objects.values('date').filter(club_id=self.request.user.club_id,
                                                                   date__date=cur_date,
                                                                   clubtraining__team_id=team)

            else:
                tr_query = UserEvent.objects.values('date').filter(user_id=user, date__date=cur_date,
                                                                   usertraining__team_id=team)
            count_tr = tr_query.count()
            if self.request.data['event_type'] == '1':
                group = 0
            else:
                group = 1
            if count_tr < 3:
                count_group_tr = tr_query.filter(date__date=cur_date, date__hour=cur_time.hour,
                                                 date__minute=cur_time.minute).count()
                print(count_tr)
                print(count_group_tr)
                print(count_tr < 3 and count_group_tr >= 0 and count_group_tr < 2)
                if count_tr < 2 or (count_tr < 3 and count_group_tr > 0 and count_group_tr < 2):
                    if self.request.user.club_id is not None:
                        event = serializer.save(user_id=user, club_id=self.request.user.club_id)
                        new_training = ClubTraining.objects.create(team_id=team, event_id=event, group=group)
                    else:
                        event = serializer.save(user_id=user)
                        new_training = UserTraining.objects.create(team_id=team, event_id=event, group=group)
                    new_training.save()
                    return True
                else:
                    return False
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
        cur_time = datetime.strptime(self.request.data['date'], "%Y-%m-%d %H:%M").time()
        if self.request.user.club_id is not None:
            team = ClubTeam.objects.get(pk=self.request.data['team'])
            event = ClubEvent.objects.get(pk=pk)
            try:
                training = ClubTraining.objects.get(pk=pk)
                tr_query = ClubEvent.objects.filter(club_id=self.request.user.club_id, date__date=cur_date,
                                                    clubtraining__team_id=team)
                count_tr = tr_query.count()
                count_tr_group = tr_query.filter(date__hour=cur_time.hour, date__minute=cur_time.minute).count()
            except ClubTraining.DoesNotExist:
                training = None
                count_tr = 0
                count_tr_group = 0
            try:
                exercises = ClubTrainingExercise.objects.filter(training_id=pk)
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
                tr_query = UserEvent.objects.filter(user_id=user, date__date=cur_date,
                                                    usertraining__team_id=team)
                count_tr = tr_query.count()
                count_tr_group = tr_query.filter(date__hour=cur_time.hour, date__minute=cur_time.minute).count()
            except UserTraining.DoesNotExist:
                training = None
                count_tr = 0
                count_tr_group = 0
            try:
                exercises = UserTrainingExercise.objects.filter(training_id=pk)
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
        if count_tr > 2 | count_tr_group > 1:
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
                    print(exercise)
                    if self.request.user.club_id is not None:
                        last_additional = ClubTrainingExercise.objects.get(
                            pk=exercise.pk).clubtrainingexerciseadditional_set.all()
                    else:
                        last_additional = UserTrainingExercise.objects.get(
                            pk=exercise.pk).usertrainingexerciseadditional_set.all()
                    exercise.pk = None
                    print(last_additional)
                    exercise.training_id = training
                    exercise.save()
                    if self.request.user.club_id is not None:
                        for additional in last_additional:
                            ClubTrainingExerciseAdditional.objects.create(
                                training_exercise_id=exercise,
                                additional_id=additional.additional_id,
                                note=additional.note
                            )
                    else:
                        for additional in last_additional:
                            UserTrainingExerciseAdditional.objects.create(
                                training_exercise_id=exercise,
                                additional_id=additional.additional_id,
                                note=additional.note
                            )
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
        favourites = self.request.query_params.get('favourites')
        # load_type = self.request.query_params.get('load_type')
        # goal = self.request.query_params.get('goal')
        # field_size = self.request.query_params.get('field_size')

        team = self.request.session['team']
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)

            q_filter = Q(clubtraining__team_id=team)
            if favourites != '0' and favourites is not None:
                q_filter &= Q(clubtraining__favourites=favourites)
            # if load_type != '' and load_type is not None:
            #     q_filter &= Q(clubtraining__load_type__icontains=load_type)
            # if goal != '' and goal is not None:
            #     q_filter &= Q(clubtraining__goal__icontains=goal)
            # if field_size != '' and field_size is not None:
            #     q_filter &= Q(clubtraining__field_size__icontains=field_size)
            q_filter |= Q(clubmatch__team_id=team)
            events = ClubEvent.objects.filter(q_filter)

            events = events.filter(club_id=self.request.user.club_id,
                                   date__gte=season[0].date_with,
                                   date__lte=season[0].date_by)
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])

            q_filter = Q(usertraining__team_id=team)
            if favourites != '0' and favourites is not None:
                q_filter &= Q(usertraining__favourites=favourites)
            # if load_type != '' and load_type is not None:
            #     q_filter &= Q(usertraining__load_type__icontains=load_type)
            # if goal != '' and goal is not None:
            #     q_filter &= Q(usertraining__goal__icontains=goal)
            # if field_size != '' and field_size is not None:
            #     q_filter &= Q(usertraining__field_size__icontains=field_size)
            q_filter |= Q(usermatch__team_id=team)
            events = UserEvent.objects.filter(q_filter)

            events = events.filter(user_id=self.request.user,
                                   date__gte=season[0].date_with,
                                   date__lte=season[0].date_by)

        if microcycle_before is not None and microcycle_after is not None:
            events = events.filter(date__gte=microcycle_after,
                                   date__lte=datetime.combine(datetime.strptime(microcycle_before, '%Y-%m-%d'),
                                                              time.max))

        return events


# LITE EVENT
class LiteEventViewSet(viewsets.ModelViewSet):
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
        current_data = self.request.data
        print(self.request.data)
        team = UserTeam.objects.get(pk=self.request.session['team'])
        user = self.request.user
        cur_date = datetime.strptime(self.request.data['date'], "%d/%m/%Y %H:%M").date()
        print(cur_date)

        if 'event_type' in self.request.data and '1' in self.request.data['event_type']:
            count_tr = LiteTraining.objects.filter(event_id__user_id=user, event_id__date__date=cur_date,
                                                   team_id=team).count()
            print(count_tr)
            if count_tr < 2:
                event = serializer.save(user_id=user)
                new_training = LiteTraining.objects.create(event_id=event, team_id=team)
                new_training.save()
                return True
            else:
                return False
        elif 'event_type' in self.request.data and '2' in self.request.data['event_type']:
            match = LiteMatch.objects.filter(event_id__user_id=user, event_id__date__date=cur_date, m_type=0,
                                             team_id=team).count()
            print(match)
            if match == 0:
                event = serializer.save(user_id=user)
                new_match = LiteMatch.objects.create(event_id=event, m_type=0, team_id=team)
                new_match.save()
                return True
            else:
                return False
        elif 'event_type' in self.request.data and '3' in self.request.data['event_type']:
            match = LiteMatch.objects.filter(event_id__user_id=user, event_id__date__date=cur_date, m_type=1,
                                             team_id=team).count()
            print(match)
            if match == 0:
                event = serializer.save(user_id=user)
                new_match = LiteMatch.objects.create(event_id=event, m_type=1, team_id=team)
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
        current_data = self.request.data
        print(self.request.data)
        team = UserTeam.objects.get(pk=self.request.session['team'])
        user = self.request.user
        cur_date = datetime.strptime(self.request.data['date'], "%Y-%m-%d %H:%M").date()

        event = LiteEvent.objects.get(pk=pk)
        try:
            training = LiteTraining.objects.get(pk=pk)
            count_tr = LiteTraining.objects.filter(event_id__user_id=user, event_id__date__date=cur_date,
                                                   team_id=team).count()
        except LiteTraining.DoesNotExist:
            training = None
            count_tr = 0
        try:
            exercises = LiteTrainingExercise.objects.filter(training_id=pk)
            print(exercises)
        except LiteTrainingExercise.DoesNotExist:
            exercises = None
        try:
            match = LiteMatch.objects.get(pk=pk)
            match1 = LiteMatch.objects.filter(event_id__user_id=user, event_id__date__date=cur_date, m_type=0,
                                              team_id=team).count()
            match2 = LiteMatch.objects.filter(event_id__user_id=user, event_id__date__date=cur_date, m_type=1,
                                              team_id=team).count()

        except LiteMatch.DoesNotExist:
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
                training.save()
                for exercise in exercises:
                    last_additional = LiteTrainingExercise.objects.get(
                        pk=exercise.pk).litetrainingexerciseadditional_set.all()
                    exercise.pk = None
                    exercise.training_id = training
                    exercise.save()
                    for additional in last_additional:
                        LiteTrainingExerciseAdditional.objects.create(
                            training_exercise_id=exercise,
                            additional_id=additional.additional_id,
                            note=additional.note
                        )
                response = Response({'status': 'training_copied'})
            elif match:
                match.pk = None
                match.event_id = event
                match.save()
                response = Response({'status': 'match_copied'})
            else:
                response = Response({'status': 'filed_copied'})
        else:
            response = Response({'status': 'filed_copied'})

        return response

    def get_serializer_class(self):
        if self.action == 'update':
            serial = LiteEventEditSerializer
        else:
            serial = LiteEventSerializer
        return serial

    def get_queryset(self):
        microcycle_before = self.request.query_params.get('to_date')
        microcycle_after = self.request.query_params.get('from_date')
        favourites = self.request.query_params.get('favourites')
        load_type = self.request.query_params.get('load_type')
        goal = self.request.query_params.get('goal')
        keywords = self.request.query_params.get('keywords')
        field_size = self.request.query_params.get('field_size')
        print(load_type)
        team = self.request.session['team']
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])

        q_filter = Q(litetraining__team_id=team)
        if favourites != '0' and favourites is not None:
            q_filter &= Q(litetraining__favourites=favourites)
        if load_type != '' and load_type is not None:
            q_filter &= Q(litetraining__load_type__icontains=load_type)
        if goal != '' and goal is not None:
            q_filter &= Q(litetraining__goal__icontains=goal)
        if keywords != '' and keywords is not None:
            q_filter &= Q(litetraining__objective_1__icontains=keywords) | Q(
                litetraining__objective_2__icontains=keywords) | Q(litetraining__goal__icontains=keywords)
        if field_size != '' and field_size is not None:
            q_filter &= Q(litetraining__field_size__icontains=field_size)
        q_filter |= Q(litematch__team_id=team)
        events = LiteEvent.objects.filter(q_filter)

        events = events.filter(user_id=self.request.user,
                               date__gte=season[0].date_with,
                               date__lte=season[0].date_by)

        if microcycle_before is not None and microcycle_after is not None:
            events = events.filter(date__gte=microcycle_after,
                                   date__lte=datetime.combine(datetime.strptime(microcycle_before, '%Y-%m-%d'),
                                                              time.max))

        return events


# DJANGO
class EventsView(LoginRequiredMixin, TemplateView):
    template_name = "events/base_events.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['microcycle_form'] = MicrocycleUserForm
        context['event_form'] = EventUserForm
        context['event_edit_form'] = EventEditUserForm
        context['ui_elements'] = get_ui_elements(self.request)
        context['menu_events'] = 'active'
        return context


# DJANGO
class LiteEventsView(LoginRequiredMixin, TemplateView):
    template_name = "events/lite_events.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['microcycle_form'] = MicrocycleUserForm
        context['event_form'] = EventUserForm
        context['event_edit_form'] = EventEditUserForm
        context['ui_elements'] = get_ui_elements(self.request)
        context['menu_levents'] = 'active'
        return context
