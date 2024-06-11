import json

from django.core.exceptions import ImproperlyConfigured
from django.db.models import Q, Count, Subquery, F
from django.http import QueryDict
from django.shortcuts import render
from django.views.generic import DetailView
from django.views.generic.base import TemplateView
from legacy import reduce
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions, IsAdminUser
from rest_framework.views import APIView
from django.utils.translation import gettext_lazy as _
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend

from events.models import UserEvent, ClubEvent, ClubMicrocycles, UserMicrocycles
from exercises.models import UserExercise, ClubExercise
from exercises.v_api import get_exercises_params
from players.models import UserPlayer, ClubPlayer
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason, ExsAdditionalData, UserExsAdditionalData, \
    ClubExsAdditionalData
from references.serializers import ExsAdditionalDataSerializer
from trainings.filters import ObjectivesGlobalFilter
from trainings.models import UserTraining, UserTrainingExercise, UserTrainingExerciseAdditional, UserTrainingProtocol, \
    ClubTrainingExercise, ClubTrainingProtocol, ClubTraining, ClubTrainingExerciseAdditional, LiteTraining, \
    LiteTrainingExercise, LiteTrainingExerciseAdditional, UserTrainingObjectives, ClubTrainingObjectives, \
    ClubTrainingObjectiveMany, UserTrainingObjectiveMany, ClubTrainingBlocks, UserTrainingBlocks, ClubTrainingBlockMany, \
    UserTrainingBlockMany, ClubTrainingLoad, UserTrainingLoad, AdminTrainingObjectives, AdminTrainingBlocks

# REST FRAMEWORK
from trainings.serializers import UserTrainingSerializer, UserTrainingExerciseSerializer, \
    UserTrainingExerciseAdditionalSerializer, UserTrainingProtocolSerializer, ClubTrainingExerciseSerializer, \
    ClubTrainingProtocolSerializer, ClubTrainingSerializer, ClubTrainingExerciseAdditionalSerializer, \
    LiteTrainingExerciseSerializer, LiteTrainingSerializer, LiteTrainingExerciseAdditionalSerializer, \
    UserTrainingObjectiveSerializer, ClubTrainingObjectiveSerializer, UserTrainingObjectiveManySerializer, \
    ClubTrainingObjectiveManySerializer, ClubTrainingBlockSerializer, UserTrainingBlockSerializer, \
    ClubTrainingBlockManySerializer, UserTrainingBlockManySerializer, ClubTrainingLoadSerializer, \
    UserTrainingLoadSerializer, AdminTrainingObjectiveSerializer, AdminTrainingBlockSerializer
from users.models import User
from system_icons.views import get_ui_elements


class BaseTrainingsPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


class TrainingViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]

    def perform_create(self, serializer):
        if self.request.user.club_id is not None:
            team = ClubTeam.objects.get(pk=self.request.session['team'])
        else:
            team = UserTeam.objects.get(pk=self.request.session['team'])
        serializer.save(team_id=team, trainer_user_id=self.request.user)

    @action(detail=True, methods=['get'])
    def get_exercises(self, request, pk=None):
        group = request.query_params.get('group')
        print(group)
        if self.request.user.club_id is not None:
            if group:
                queryset = ClubTrainingExercise.objects.filter(training_id=pk, group=group)
            else:
                queryset = ClubTrainingExercise.objects.filter(training_id=pk)
        else:
            if group:
                queryset = UserTrainingExercise.objects.filter(training_id=pk, group=group)
            else:
                queryset = UserTrainingExercise.objects.filter(training_id=pk)

        serializer = UserTrainingExerciseSerializer(queryset, many=True)
        return Response({'status': 'exercise_got', 'objs': serializer.data})

    @action(detail=True, methods=['post'])
    def add_exercise(self, request, pk=None):
        data = request.data
        if self.request.user.club_id is not None:
            exercise_count = ClubTrainingExercise.objects.filter(training_id=pk, group=data['group']).count()
            current_exercise = ClubTrainingExercise.objects.filter(training_id=pk, group=data['group'],
                                                                   exercise_id=data['exercise_id']).count()
            previous_training = ClubTrainingExercise.objects.filter(
                exercise_id=data['exercise_id'],
                training_id__team_id=self.request.session['team'],
                training_id__event_id__date__lte=ClubTraining.objects.get(pk=pk).event_id.date
            )
            full_exercise = ClubExercise.objects.get(
                pk=data['exercise_id']
            )

            if previous_training:
                previous_training = previous_training.latest('id')
                last_additional = previous_training.clubtrainingexerciseadditional_set.all()
            else:
                last_additional = None
        else:
            exercise_count = UserTrainingExercise.objects.filter(training_id=pk, group=data['group']).count()
            current_exercise = UserTrainingExercise.objects.filter(training_id=pk, group=data['group'],
                                                                   exercise_id=data['exercise_id']).count()
            previous_training = UserTrainingExercise.objects.filter(
                exercise_id=data['exercise_id'],
                training_id__team_id=self.request.session['team'],
                training_id__event_id__date__lte=UserTraining.objects.get(pk=pk).event_id.date
            )
            full_exercise = UserExercise.objects.get(
                pk=data['exercise_id']
            )

            if previous_training:
                previous_training = previous_training.latest('id')
                last_additional = previous_training.usertrainingexerciseadditional_set.all()
            else:
                last_additional = None
        if previous_training:
            last_description = previous_training.description
            last_additional_json = json.dumps(previous_training.additional_json)
        else:
            if full_exercise.description_trainer is not None and request.LANGUAGE_CODE in full_exercise.description_trainer and \
                    full_exercise.description_trainer[request.LANGUAGE_CODE] != '':
                last_description = full_exercise.description_trainer[request.LANGUAGE_CODE]
            elif full_exercise.description is not None and request.LANGUAGE_CODE in full_exercise.description and \
                    full_exercise.description[request.LANGUAGE_CODE] != '':
                last_description = full_exercise.description[request.LANGUAGE_CODE]
            else:
                last_description = ''

            print(last_description)
            last_additional_json = json.dumps(None)

        if exercise_count > 6:
            return Response({'status': 'exercise_limit'})
        if current_exercise > 0:
            return Response({'status': 'exercise_repeated'})
        data_dict = dict(
            training_id=pk,
            exercise_id=data['exercise_id'],
            group=data['group'],
            duration=data['duration'],
            description=last_description,
            additional_json=last_additional_json,
            order=exercise_count
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        if self.request.user.club_id is not None:
            serializer = ClubTrainingExerciseSerializer(
                data=query_dict
            )
        else:
            serializer = UserTrainingExerciseSerializer(
                data=query_dict
            )
        #print(serializer)
        if serializer.is_valid(raise_exception=True):
            new_obj = serializer.save()
            if self.request.user.club_id is not None:
                if last_additional:
                    for additional in last_additional:
                        ClubTrainingExerciseAdditional.objects.create(
                            training_exercise_id=new_obj,
                            additional_id=additional.additional_id,
                            note=additional.note
                        )
                object_serialize = ClubTrainingExerciseSerializer(new_obj).data
            else:
                if last_additional:
                    for additional in last_additional:
                        UserTrainingExerciseAdditional.objects.create(
                            training_exercise_id=new_obj,
                            additional_id=additional.additional_id,
                            note=additional.note
                        )
                object_serialize = UserTrainingExerciseSerializer(new_obj).data
            return Response({'status': 'exercise_added', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def get_protocol(self, request, pk=None):
        data = request.data
        if self.request.user.club_id is not None:
            queryset = ClubTrainingProtocol.objects.filter(training_id=pk)
            serializer = ClubTrainingProtocolSerializer(queryset, many=True)
        else:
            queryset = UserTrainingProtocol.objects.filter(training_id=pk)
            serializer = UserTrainingProtocolSerializer(queryset, many=True)


        return Response({'status': 'protocol_got', 'objs': serializer.data})

    @action(detail=True, methods=['post'])
    def add_all_protocol(self, request, pk=None):
        data = request.data

        if self.request.user.club_id is not None:
            protocol_count = ClubTrainingProtocol.objects.filter(training_id=pk).count()
            training_team = ClubTraining.objects.values_list('team_id', flat=True).get(pk=pk)
        else:
            protocol_count = UserTrainingProtocol.objects.filter(training_id=pk).count()
            training_team = UserTraining.objects.values_list('team_id', flat=True).get(pk=pk)
        print(training_team)
        if protocol_count > 30:
            return Response({'status': 'protocol_limit'})
        elif protocol_count > 0:
            return Response({'status': 'protocol_not_empty'})

        if self.request.user.club_id is not None:
            players_team = list(ClubPlayer.objects.filter(team=training_team, is_archive=False).values_list('id', flat=True))
        else:
            players_team = list(UserPlayer.objects.filter(team=training_team, is_archive=False).values_list('id', flat=True))
        print(players_team)
        players_array = []
        if len(players_team) > 0:
            for idx, val in enumerate(players_team):
                data_dict = dict(
                    training_id=pk,
                    player_id=val,
                )
                players_array.append(data_dict)
        print(players_array)
        query_dict = QueryDict('', mutable=True)
        query_dict.update(players_array)
        print(query_dict)

        if self.request.user.club_id is not None:
            serializer = ClubTrainingProtocolSerializer(
                data=players_array, many=True
            )
        else:
            serializer = UserTrainingProtocolSerializer(
                data=players_array, many=True
            )
        # print(serializer)
        if serializer.is_valid(raise_exception=True):
            new_obj = serializer.save()
            print(new_obj)
            if self.request.user.club_id is not None:
                object_serialize = ClubTrainingProtocolSerializer(new_obj, many=True).data
            else:
                object_serialize = UserTrainingProtocolSerializer(new_obj, many=True).data
            return Response({'status': 'protocol_added', 'objs': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_all_protocol(self, request, pk=None):
        data = request.data
        try:
            if self.request.user.club_id is not None:
                ClubTraining.objects.get(pk=pk).protocol.clear()
            else:
                UserTraining.objects.get(pk=pk).protocol.clear()
            return Response({'status': 'protocol_clear', 'objs': None})
        except:
            return Response({'status': 'protocol_clear_error', 'objs': None},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_protocol(self, request, pk=None):

        data = request.data.get('players', request.data)
        many = isinstance(data, list)
        print(data, many)
        serializer = self.get_serializer(data=data, many=many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

        data = request.data

        if self.request.user.club_id is not None:
            protocol_count = ClubTrainingProtocol.objects.filter(training_id=pk).count()
        else:
            protocol_count = UserTrainingProtocol.objects.filter(training_id=pk).count()
        print(protocol_count)
        if protocol_count > 30:
            return Response({'status': 'protocol_limit'})

        data_dict = dict(
            training_id=pk,
            player_id=data['player_id'],
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        if self.request.user.club_id is not None:
            serializer = ClubTrainingProtocolSerializer(
                data=query_dict
            )
        else:
            serializer = UserTrainingProtocolSerializer(
                data=query_dict
            )
        # print(serializer)
        if serializer.is_valid(raise_exception=True):
            new_obj = serializer.save()
            if self.request.user.club_id is not None:
                object_serialize = ClubTrainingProtocolSerializer(new_obj).data
            else:
                object_serialize = UserTrainingProtocolSerializer(new_obj).data
            return Response({'status': 'protocol_added', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_objective(self, request, pk=None):

        data = request.data.get('items', request.data)
        data_objectives = json.loads(data)
        many = isinstance(data_objectives, list)
        print(data_objectives, many)

        if self.request.user.club_id is not None:
            ClubTraining.objects.get(pk=pk).objectives.clear()
            serializer = ClubTrainingObjectiveManySerializer(
                data=data_objectives, many=many
            )
        else:
            UserTraining.objects.get(pk=pk).objectives.clear()
            serializer = UserTrainingObjectiveManySerializer(
                data=data_objectives, many=many
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_block(self, request, pk=None):

        data = request.data.get('items', request.data)
        data_blocks = json.loads(data)
        many = isinstance(data_blocks, list)
        print(data_blocks, many)

        if self.request.user.club_id is not None:
            ClubTraining.objects.get(pk=pk).blocks.clear()
            serializer = ClubTrainingBlockManySerializer(
                data=data_blocks, many=many
            )
        else:
            UserTraining.objects.get(pk=pk).blocks.clear()
            serializer = UserTrainingBlockManySerializer(
                data=data_blocks, many=many
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serial = ClubTrainingSerializer
        else:
            serial = UserTrainingSerializer
        return serial

    def get_queryset(self):
        # if self.action == 'partial_update':
        #     return UserTraining.objects.all()
        print(self.request.session['team'])
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'])
            trainings = ClubTraining.objects.filter(team_id=self.request.session['team'],
                                                    event_id__club_id=self.request.user.club_id,
                                                    event_id__date__gte=season[0].date_with,
                                                    event_id__date__lte=season[0].date_by)
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            trainings = UserTraining.objects.filter(team_id=self.request.session['team'],
                                           event_id__user_id=self.request.user,
                                           event_id__date__gte=season[0].date_with,
                                           event_id__date__lte=season[0].date_by)
        return trainings


class LoadsViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]
    #permission_classes = [IsAuthenticated]
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = ObjectivesGlobalFilter

    def perform_create(self, serializer):
        if self.request.user.club_id is not None:
            serializer.save(club=self.request.user.club_id)
        else:
            serializer.save(user=self.request.user)


    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serial = ClubTrainingLoadSerializer
        else:
            serial = UserTrainingLoadSerializer
        return serial

    def get_queryset(self):
        if self.request.user.club_id is not None:
            blocks = ClubTrainingLoad.objects.filter(club=self.request.user.club_id).order_by('short_name', 'name')
        else:
            blocks = UserTrainingLoad.objects.filter(user=self.request.user).order_by('short_name', 'name')

        return blocks


class LoadListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        if search != '':
            words = search.split()
            query_obj = reduce(
                lambda a, b: a & b,
                (Q(name__icontains=term) for term in words),
            )
            query_obj_many = reduce(
                lambda a, b: a & b,
                (Q(load__name__icontains=term) for term in words),
            )
            print(query_obj)
        else:
            query_obj = (Q(name__icontains=search))
            query_obj_many = (Q(load__name__icontains=search))

        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubTrainingLoad.objects. \
                filter(Q(club=request.user.club_id)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = ClubTraining.objects. \
                filter(Q(event_id__date__gte=season[0].date_with) &
                       Q(event_id__date__lte=season[0].date_by) &
                       Q(event_id__club_id=request.user.club_id) &
                       Q(team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('load')).order_by('load__name')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserTrainingLoad.objects. \
                filter(Q(user=request.user)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = UserTraining.objects. \
                filter(Q(event_id__date__gte=season[0].date_with) &
                       Q(event_id__date__lte=season[0].date_by) &
                       Q(event_id__user_id=request.user) &
                       Q(team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('load')).order_by('load__name')

        print(queryset_many.values())
        list_load = []

        for load in queryset:
            load_count = 0
            new_block = {
                'id': load.id,
                'name': load.name,
                'count': load_count
            }
            for load_many in queryset_many:
                if load_many.load.pk == load.pk:
                    new_block['count'] += 1
            #if new_block['count'] > 0:
            list_load.append(new_block)

        print(list_load)
        #list_load.sort(key=lambda x: x['count'], reverse=True)

        object_count = {}
        for load in list_load:
            #print(microcycle)
            object_count[load['id']] = object_count.get(load['id'], {'name': '', 'count': 0})
            object_count[load['id']]['count'] += load['count']
            object_count[load['id']]['name'] = load['name']
        #print(object_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in object_count.items()]
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        #print(list2)
        return Response(list2)

class LoadShortApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        if search != '':
            words = search.split()
            query_obj = reduce(
                lambda a, b: a & b,
                (Q(name__icontains=term) for term in words),
            )
            query_obj_many = reduce(
                lambda a, b: a & b,
                (Q(load__name__icontains=term) for term in words),
            )
            print(query_obj)
        else:
            query_obj = (Q(name__icontains=search))
            query_obj_many = (Q(load__name__icontains=search))

        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubTrainingLoad.objects. \
                filter(Q(club=request.user.club_id)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = ClubTraining.objects. \
                filter(Q(event_id__date__gte=season[0].date_with) &
                       Q(event_id__date__lte=season[0].date_by) &
                       Q(event_id__club_id=request.user.club_id) &
                       Q(team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('load')).order_by('load__name')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserTrainingLoad.objects. \
                filter(Q(user=request.user)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = UserTraining.objects. \
                filter(Q(event_id__date__gte=season[0].date_with) &
                       Q(event_id__date__lte=season[0].date_by) &
                       Q(event_id__user_id=request.user) &
                       Q(team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('load')).order_by('load__name')

        print(queryset_many.values())
        list_load = []

        for load in queryset:
            load_count = 0
            new_block = {
                'id': load.id,
                'name': load.short_name,
                'count': 0
            }
            # for load_many in queryset_many:
            #     if load_many.load.pk == load.pk:
            #         new_block['count'] += 1
            list_load.append(new_block)

        print(list_load)
        #list_load.sort(key=lambda x: x['count'], reverse=True)

        object_count = {}
        for load in list_load:
            #print(microcycle)
            object_count[load['id']] = object_count.get(load['id'], {'name': '', 'count': 0})
            object_count[load['id']]['count'] += load['count']
            object_count[load['id']]['name'] = load['name']
        #print(object_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in object_count.items()]
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        #print(list2)
        return Response(list2)


class BlocksViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]
    #permission_classes = [IsAuthenticated]
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = ObjectivesGlobalFilter

    @action(detail=False, methods=['post'])
    def copy_admin_all(self, request):
        admin_blocks = AdminTrainingBlocks.objects.all()
        new_blocks = []
        if self.request.user.club_id is not None:
            ClubTrainingBlocks.objects.all().delete()
            for block in admin_blocks:
                new_blocks.append(ClubTrainingBlocks(name=block.name, short_name=block.short_name,
                                                         club_id=self.request.user.club_id))
            objs = ClubTrainingBlocks.objects.bulk_create(new_blocks)
        else:
            UserTrainingBlocks.objects.all().delete()
            for block in admin_blocks:
                new_blocks.append(
                    UserTrainingBlocks(name=block.name, short_name=block.short_name, user=self.request.user))
            objs = UserTrainingBlocks.objects.bulk_create(new_blocks)

        print(objs)

        return Response({'status': 'admin_copied'})

    def perform_create(self, serializer):
        if self.request.user.club_id is not None:
            serializer.save(club=self.request.user.club_id)
        else:
            serializer.save(user=self.request.user)

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serial = ClubTrainingBlockSerializer
        else:
            serial = UserTrainingBlockSerializer
        return serial

    def get_queryset(self):
        if self.request.user.club_id is not None:
            blocks = ClubTrainingBlocks.objects.filter(club=self.request.user.club_id).order_by('short_name', 'name')
        else:
            blocks = UserTrainingBlocks.objects.filter(user=self.request.user).order_by('short_name', 'name')

        return blocks


class AdminBlocksViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = ObjectivesGlobalFilter

    def perform_create(self, serializer):
        serializer.save()

    def get_serializer_class(self):
        serial = AdminTrainingBlockSerializer
        return serial

    def get_queryset(self):
        objectives = AdminTrainingBlocks.objects.filter(variant=0).order_by('short_name', 'name')

        return objectives


class AdminBlockShortListApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        queryset = AdminTrainingBlocks.objects. \
            filter(variant=0, short_name__contains=search). \
            annotate(names=Count('short_name')).order_by('short_name')

        list_microcycles = [
            {
                'id': microcycle.short_name,
                'name': microcycle.short_name,
                'count': 0
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
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


class BlockListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        if search != '':
            words = search.split()
            query_obj = reduce(
                lambda a, b: a & b,
                (Q(name__icontains=term) for term in words),
            )
            query_obj_many = reduce(
                lambda a, b: a & b,
                (Q(block__name__icontains=term) for term in words),
            )
            print(query_obj)
        else:
            query_obj = (Q(name__icontains=search))
            query_obj_many = (Q(block__name__icontains=search))

        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubTrainingBlocks.objects. \
                filter(Q(club=request.user.club_id)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = ClubTrainingBlockMany.objects. \
                filter(Q(training__event_id__date__gte=season[0].date_with) &
                       Q(training__event_id__date__lte=season[0].date_by) &
                       Q(block__club=request.user.club_id) &
                       Q(training__team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('block')).order_by('block__short_name', 'block__name')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserTrainingBlocks.objects. \
                filter(Q(user=request.user)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = UserTrainingBlockMany.objects. \
                filter(Q(training__event_id__date__gte=season[0].date_with) &
                       Q(training__event_id__date__lte=season[0].date_by) &
                       Q(block__user=request.user) &
                       Q(training__team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('block')).order_by('block__short_name', 'block__name')

        print(queryset_many.values())
        list_block = []

        for block in queryset:
            block_count = 0
            new_block = {
                'id': block.id,
                'name': block.name,
                'short': '',
                'count': block_count
            }
            for block_many in queryset_many:
                if block_many.block.pk == block.pk:
                    new_block['count'] += block_many.count
            #if new_block['count'] > 0:
            list_block.append(new_block)

        print(list_block)
        #list_block.sort(key=lambda x: x['count'], reverse=True)

        object_count = {}
        for block in list_block:
            #print(microcycle)
            object_count[block['id']] = object_count.get(block['id'], {'name': '', 'count': 0})
            object_count[block['id']]['count'] += block['count']
            object_count[block['id']]['name'] = block['name']
            object_count[block['id']]['short'] = block['short']
        #print(object_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name'], 'short': data['short']} for id, data in object_count.items()]
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        #print(list2)
        return Response(list2)


class BlockShortListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        if request.user.club_id is not None:
            queryset = ClubTrainingBlocks.objects. \
                filter(club=request.user.club_id, short_name__contains=search). \
                annotate(names=Count('short_name')).order_by('short_name')
        else:
            queryset = UserTrainingBlocks.objects. \
                filter(user=request.user, short_name__contains=search). \
                annotate(names=Count('short_name')).order_by('short_name')

        list_microcycles = [
            {
                'id': microcycle.short_name,
                'name': microcycle.short_name,
                'count': 0
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
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


class ObjectivesViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = ObjectivesGlobalFilter

    @action(detail=False, methods=['post'])
    def copy_admin_all(self, request):
        admin_blocks = AdminTrainingObjectives.objects.all()
        new_blocks = []
        if self.request.user.club_id is not None:
            ClubTrainingObjectives.objects.all().delete()
            for block in admin_blocks:
                new_blocks.append(ClubTrainingObjectives(name=block.name, short_name=block.short_name, club_id=self.request.user.club_id))
            objs = ClubTrainingObjectives.objects.bulk_create(new_blocks)
        else:
            UserTrainingObjectives.objects.all().delete()
            for block in admin_blocks:
                new_blocks.append(UserTrainingObjectives(name=block.name, short_name=block.short_name, user=self.request.user))
            objs = UserTrainingObjectives.objects.bulk_create(new_blocks)

        print(objs)

        return Response({'status': 'admin_copied'})

    def perform_create(self, serializer):
        if self.request.user.club_id is not None:
            serializer.save(club=self.request.user.club_id)
        else:
            serializer.save(user=self.request.user)


    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serial = ClubTrainingObjectiveSerializer
        else:
            serial = UserTrainingObjectiveSerializer
        return serial

    def get_queryset(self):
        if self.request.user.club_id is not None:
            objectives = ClubTrainingObjectives.objects.filter(club=self.request.user.club_id).order_by('short_name', 'name')
        else:
            objectives = UserTrainingObjectives.objects.filter(user=self.request.user).order_by('short_name', 'name')

        return objectives


class AdminObjectivesViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = ObjectivesGlobalFilter

    def perform_create(self, serializer):
        serializer.save()

    def get_serializer_class(self):
        serial = AdminTrainingObjectiveSerializer
        return serial

    def get_queryset(self):
        objectives = AdminTrainingObjectives.objects.filter(variant=0).order_by('short_name', 'name')

        return objectives


class AdminObjectiveShortListApiView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        queryset = AdminTrainingObjectives.objects. \
            filter(variant=0, short_name__contains=search). \
            annotate(names=Count('short_name')).order_by('short_name')

        list_microcycles = [
            {
                'id': microcycle.short_name,
                'name': microcycle.short_name,
                'count': 0
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
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


# Списки задачь для тренировок команды
class ObjectivesListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')
        #type = request.GET.get('type', '')
        block = request.GET.get('custom_search', '').split(',')
        print(block)

        if search != '':
            words = search.split()
            query_obj = reduce(
                lambda a, b: a & b,
                (Q(name__icontains=term) | Q(short_name__icontains=term) for term in words),
            )
            query_obj_many = reduce(
                lambda a, b: a & b,
                (Q(objective__name__icontains=term) | Q(objective__short_name__icontains=term) for term in words),
            )
            print(query_obj)
        else:
            query_obj = (Q(name__icontains=search) | Q(short_name__icontains=search))
            query_obj_many = (Q(objective__name__icontains=search) | Q(objective__short_name__icontains=search))

        # if len(block) > 1:
        #     query_obj &=Q(short_name__icontains=block[int(type)])
        #     query_obj_many &= Q(objective__short_name__icontains=block[int(type)])

        if request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'], club_id=self.request.user.club_id)
            queryset = ClubTrainingObjectives.objects. \
                filter(Q(club=request.user.club_id)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = ClubTrainingObjectiveMany.objects. \
                filter(#Q(type=type) &
                       Q(training__event_id__date__gte=season[0].date_with) &
                       Q(training__event_id__date__lte=season[0].date_by) &
                       #Q(objective__club=request.user.club_id) &
                       Q(training__team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('objective__id')).order_by('objective__short_name', 'objective__name')
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])
            queryset = UserTrainingObjectives.objects. \
                filter(Q(user=request.user)).filter(query_obj). \
                order_by('short_name', 'name')
            queryset_many = UserTrainingObjectiveMany.objects. \
                filter(#Q(type=type) &
                       Q(training__event_id__date__gte=season[0].date_with) &
                       Q(training__event_id__date__lte=season[0].date_by) &
                       #Q(objective__user=request.user) &
                       Q(training__team_id=self.request.session['team'])).filter(query_obj_many). \
                annotate(count=Count('objective__id')).order_by('objective__short_name', 'objective__name')

        print(queryset_many.values())
        list_objective = []

        for objective in queryset:
            objective_count = 0
            new_objective = {
                'id': objective.id,
                'name': objective.name,
                'short': objective.short_name,
                'count': objective_count
            }
            for objective_many in queryset_many:
                if objective_many.objective.pk == objective.pk:
                    new_objective['count'] += objective_many.count
            #if new_objective['count'] > 0:
            list_objective.append(new_objective)

        print(list_objective)
        #list_objective.sort(key=lambda x: x['count'], reverse=True)

        object_count = {}
        for objective in list_objective:
            #print(microcycle)
            object_count[objective['id']] = object_count.get(objective['id'], {'name': '', 'count': 0})
            object_count[objective['id']]['count'] += objective['count']
            object_count[objective['id']]['name'] = objective['name']
            object_count[objective['id']]['short'] = objective['short']
        #print(object_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name'], 'short': data['short']} for id, data in object_count.items()]
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        #print(list2)
        return Response(list2)


class ObjectiveShortListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        search = request.GET.get('search', '')

        if request.user.club_id is not None:
            queryset = ClubTrainingObjectives.objects. \
                filter(club=request.user.club_id, short_name__contains=search). \
                annotate(names=Count('short_name')).order_by('short_name')
        else:
            queryset = UserTrainingObjectives.objects. \
                filter(user=request.user, short_name__contains=search). \
                annotate(names=Count('short_name')).order_by('short_name')

        list_microcycles = [
            {
                'id': microcycle.short_name,
                'name': microcycle.short_name,
                'count': 0
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
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


class LiteTrainingViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user, trainer_user_id=self.request.user)

    @action(detail=True, methods=['get'])
    def get_exercises(self, request, pk=None):
        group = request.query_params.get('group')
        print(group)
        if group:
            queryset = LiteTrainingExercise.objects.filter(training_id=pk, group=group)
        else:
            queryset = LiteTrainingExercise.objects.filter(training_id=pk)

        serializer = LiteTrainingExerciseSerializer(queryset, many=True)
        return Response({'status': 'exercise_got', 'objs': serializer.data})

    @action(detail=True, methods=['post'])
    def add_exercise(self, request, pk=None):
        data = request.data

        exercise_count = LiteTrainingExercise.objects.filter(training_id=pk, group=data['group']).count()
        current_exercise = LiteTrainingExercise.objects.filter(training_id=pk, group=data['group'],
                                                               exercise_id=data['exercise_id']).count()
        previous_training = LiteTrainingExercise.objects.filter(
            exercise_id=data['exercise_id'],
            training_id__team_id=self.request.session['team'],
            training_id__event_id__date__lte=LiteTraining.objects.get(pk=pk).event_id.date
        )
        if previous_training:
            previous_training = previous_training.latest('id')
            last_description = previous_training.description
            last_additional_json = json.dumps(previous_training.additional_json)
            last_additional = previous_training.litetrainingexerciseadditional_set.all()
        else:
            last_additional = None
            last_additional_json = json.dumps(None)
            last_description = ''

        if exercise_count > 6:
            return Response({'status': 'exercise_limit'})
        if current_exercise > 0:
            return Response({'status': 'exercise_repeated'})
        data_dict = dict(
            training_id=pk,
            exercise_id=data['exercise_id'],
            group=data['group'],
            duration=data['duration'],
            description=last_description,
            additional_json=last_additional_json,
            order=exercise_count
        )
        print(data_dict)
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)


        serializer = LiteTrainingExerciseSerializer(
            data=query_dict
        )

        #print(serializer)
        if serializer.is_valid(raise_exception=True):
            new_obj = serializer.save()
            if last_additional:
                for additional in last_additional:
                    LiteTrainingExerciseAdditional.objects.create(
                        training_exercise_id=new_obj,
                        additional_id=additional.additional_id,
                        note=additional.note
                    )
            object_serialize = LiteTrainingExerciseSerializer(new_obj).data


            return Response({'status': 'exercise_added', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        serial = LiteTrainingSerializer

        return serial

    def get_queryset(self):
        print(self.request.data)
        if self.request.user.club_id is not None:
            season = ClubSeason.objects.filter(id=self.request.session['season'])
        else:
            season = UserSeason.objects.filter(id=self.request.session['season'])

        trainings = LiteTraining.objects.filter(team_id=self.request.session['team'],
                                                event_id__user_id=self.request.user,
                                                event_id__date__gte=season[0].date_with,
                                                event_id__date__lte=season[0].date_by)

        return trainings


class TrainingExerciseViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]

    @action(detail=True, methods=['get'])
    def get_data(self, request, pk=None):
        if self.request.user.club_id is not None:
            queryset = ClubTrainingExerciseAdditional.objects.filter(training_exercise_id=pk)
            serializer = ClubTrainingExerciseAdditionalSerializer(queryset, many=True)
        else:
            queryset = UserTrainingExerciseAdditional.objects.filter(training_exercise_id=pk)
            serializer = UserTrainingExerciseAdditionalSerializer(queryset, many=True)
        return Response({'status': 'data_got', 'objs': serializer.data})

    @action(detail=True, methods=['delete'])
    def delete_all_data(self, request, pk=None):
        data = request.data

        if self.request.user.club_id is not None:
            training_exercise = ClubTrainingExercise.objects.get(id=pk)
        else:
            training_exercise = UserTrainingExercise.objects.get(id=pk)

        print(pk)
        training_exercise.additional.clear()
        training_exercise.save()
        return Response({'status': 'data_all_removed'})

    @action(detail=True, methods=['delete'])
    def delete_empty_data(self, request, pk=None):
        data = request.data

        if self.request.user.club_id is not None:
            training_exercise = ClubTrainingExercise.objects.get(id=pk)
            additionals = training_exercise.clubtrainingexerciseadditional_set.all()
        else:
            training_exercise = UserTrainingExercise.objects.get(id=pk)
            additionals = training_exercise.usertrainingexerciseadditional_set.all()


        print(additionals)
        print(pk)
        for additional in additionals:
            if additional.note is None or additional.note == '':
                additional.delete()

        return Response({'status': 'data_empty_removed'})

    @action(detail=True, methods=['post'])
    def add_all_data(self, request, pk=None):
        data = request.data

        if self.request.user.club_id is not None:
            additionals = ClubExsAdditionalData.objects.filter(club_id=self.request.user.club_id)
            training_exercise = ClubTrainingExercise.objects.get(id=pk)
        else:
            additionals = UserExsAdditionalData.objects.filter(user_id=self.request.user.id)
            training_exercise = UserTrainingExercise.objects.get(id=pk)
        data_count = training_exercise.additional.all().count()
        #additionals = ExsAdditionalData.objects.all()

        print(data_count)
        print(pk)
        if data_count > 0:
            training_exercise.additional.clear()

        if training_exercise.additional.add(*additionals):
            return Response({'status': 'data_added', 'obj': training_exercise.additional.values()})
        else:
            return Response({'status': 'data_error'})

    @action(detail=True, methods=['post'])
    def add_data(self, request, pk=None):
        data = request.data

        if self.request.user.club_id is not None:
            #additional = ClubExsAdditionalData.objects.filter(club_id=self.request.user.club_id).first().pk
            training_exercise = ClubTrainingExercise.objects.get(id=pk)
        else:
            #additional = UserExsAdditionalData.objects.filter(user_id=self.request.user.id).first().pk
            training_exercise = UserTrainingExercise.objects.get(id=pk)
        data_count = training_exercise.additional.all().count()
        #additional = ExsAdditionalData.objects.all().first().pk

        print(data_count)
        print(pk)
        if data_count > 14:
            return Response({'status': 'data_limit'})
        data_dict = dict(
            training_exercise_id=pk,
            additional_id=data['additional_id'],
            note=data['note']
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        if self.request.user.club_id is not None:
            serializer = ClubTrainingExerciseAdditionalSerializer(
                data=query_dict
            )
        else:
            serializer = UserTrainingExerciseAdditionalSerializer(
                data=query_dict
            )
        print(serializer)
        if serializer.is_valid(raise_exception=True):
            #print(serializer.validated_data)
            new_obj = serializer.save()
            if self.request.user.club_id is not None:
                object_serialize = ClubTrainingExerciseAdditionalSerializer(new_obj).data
            else:
                object_serialize = UserTrainingExerciseAdditionalSerializer(new_obj).data
            return Response({'status': 'data_added', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def edit_data(self, request, pk=None):
        data = request.data
        instance = self.get_object()
        print(data)
        if self.request.user.club_id is not None:
            edit_object = ClubTrainingExercise.objects.filter(
                pk=pk
            )
        else:
            edit_object = UserTrainingExercise.objects.filter(
                pk=pk
            )
        print(edit_object)

        data_dict = {}
        if(data['duration']):
            data_dict['duration'] = data['duration']
            data_dict['order'] = 1

        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        if self.request.user.club_id is not None:
            serializer = ClubTrainingExerciseSerializer(
                edit_object,
                data=query_dict
            )
        else:
            serializer = UserTrainingExerciseSerializer(
                edit_object,
                data=query_dict
            )
        # print(serializer)
        if serializer.is_valid(raise_exception=True):
            update_obj = serializer.save()
            if self.request.user.club_id is not None:
                object_serialize = ClubTrainingExerciseSerializer(update_obj).data
            else:
                object_serialize = UserTrainingExerciseSerializer(update_obj).data
            return Response({'status': 'exercise_updated', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def get_object_by_id(self, obj_id):
        if self.request.user.club_id is not None:
            model = ClubTrainingExercise
        else:
            model = UserTrainingExercise
        try:
            return model.objects.get(id=obj_id)
        except (model.DoesNotExist, ValidationError):
            raise status.HTTP_400_BAD_REQUEST

    def validate_ids(self, id_list):
        if self.request.user.club_id is not None:
            model = ClubTrainingExercise
        else:
            model = UserTrainingExercise
        for id in id_list:
            try:
                model.objects.get(id=int(id))
            except (model.DoesNotExist, ValidationError):
                raise status.HTTP_400_BAD_REQUEST
        return True

    @action(detail=False, methods=['put'])
    def sort_exercise(self, request, *args, **kwargs):
        print(request.data)
        id_list = request.data.getlist('exercise_ids[]')
        print(id_list)
        self.validate_ids(id_list=id_list)
        instances = []
        for i, id in enumerate(id_list):
            print(id)
            obj = self.get_object_by_id(obj_id=id)
            obj.order = i
            obj.save()
            instances.append(obj)
        if self.request.user.club_id is not None:
            serializer = ClubTrainingExerciseSerializer(instances, many=True)
        else:
            serializer = UserTrainingExerciseSerializer(instances, many=True)
        return Response({'status': 'sort_exercise', 'objs': serializer.data})

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serializer_class = ClubTrainingExerciseSerializer
        else:
            serializer_class = UserTrainingExerciseSerializer
        return serializer_class

    def get_queryset(self):
        if self.request.user.club_id is not None:
            queryset = ClubTrainingExercise.objects.all()
        else:
            queryset = UserTrainingExercise.objects.all()
        return queryset


class LiteTrainingExerciseViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]

    @action(detail=True, methods=['get'])
    def get_data(self, request, pk=None):
        queryset = LiteTrainingExerciseAdditional.objects.filter(training_exercise_id=pk)
        serializer = LiteTrainingExerciseAdditionalSerializer(queryset, many=True)

        return Response({'status': 'data_got', 'objs': serializer.data})

    @action(detail=True, methods=['delete'])
    def delete_all_data(self, request, pk=None):
        data = request.data

        training_exercise = LiteTrainingExercise.objects.get(id=pk)

        print(pk)
        training_exercise.additional.clear()
        training_exercise.save()
        return Response({'status': 'data_all_removed'})

    @action(detail=True, methods=['delete'])
    def delete_empty_data(self, request, pk=None):
        data = request.data

        training_exercise = LiteTrainingExercise.objects.get(id=pk)
        additionals = training_exercise.litetrainingexerciseadditional_set.all()

        print(additionals)
        print(pk)
        for additional in additionals:
            if additional.note is None or additional.note == '':
                additional.delete()

        return Response({'status': 'data_empty_removed'})

    @action(detail=True, methods=['post'])
    def add_all_data(self, request, pk=None):
        data = request.data

        training_exercise = LiteTrainingExercise.objects.get(id=pk)

        data_count = training_exercise.additional.all().count()
        additionals = UserExsAdditionalData.objects.filter(user_id=self.request.user.id)

        print(data_count)
        print(pk)
        if data_count > 0:
            training_exercise.additional.clear()

        if training_exercise.additional.add(*additionals):
            return Response({'status': 'data_added', 'obj': training_exercise.additional.values()})
        else:
            return Response({'status': 'data_error'})

    @action(detail=True, methods=['post'])
    def add_data(self, request, pk=None):
        data = request.data
        print(data)
        training_exercise = LiteTrainingExercise.objects.get(id=pk)

        data_count = training_exercise.additional.all().count()

        print(data_count)
        if data_count > 14:
            return Response({'status': 'data_limit'})
        data_dict = dict(
            training_exercise_id=pk,
            additional_id=data['additional_id'],
            note=data['note']
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        serializer = LiteTrainingExerciseAdditionalSerializer(
            data=query_dict
        )
        print(serializer)
        if serializer.is_valid(raise_exception=True):
            #print(serializer.validated_data)
            new_obj = serializer.save()

            object_serialize = LiteTrainingExerciseAdditionalSerializer(new_obj).data

            return Response({'status': 'data_added', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def edit_data(self, request, pk=None):
        data = request.data
        instance = self.get_object()
        print(data)

        edit_object = LiteTrainingExercise.objects.filter(
            pk=pk
        )

        print(edit_object)

        data_dict = {}
        if(data['duration']):
            data_dict['duration'] = data['duration']
            data_dict['order'] = 1

        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        serializer = LiteTrainingExerciseSerializer(
            edit_object,
            data=query_dict
        )

        # print(serializer)
        if serializer.is_valid(raise_exception=True):
            update_obj = serializer.save()

            object_serialize = LiteTrainingExerciseSerializer(update_obj).data

            return Response({'status': 'exercise_updated', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def get_object_by_id(self, obj_id):
        model = LiteTrainingExercise
        try:
            return model.objects.get(id=obj_id)
        except (model.DoesNotExist, ValidationError):
            raise status.HTTP_400_BAD_REQUEST

    def validate_ids(self, id_list):
        model = LiteTrainingExercise
        for id in id_list:
            try:
                model.objects.get(id=int(id))
            except (model.DoesNotExist, ValidationError):
                raise status.HTTP_400_BAD_REQUEST
        return True

    @action(detail=False, methods=['put'])
    def sort_exercise(self, request, *args, **kwargs):
        print(request.data)
        id_list = request.data.getlist('exercise_ids[]')
        print(id_list)
        self.validate_ids(id_list=id_list)
        instances = []
        for i, id in enumerate(id_list):
            print(id)
            obj = self.get_object_by_id(obj_id=id)
            obj.order = i
            obj.save()
            instances.append(obj)

        serializer = LiteTrainingExerciseSerializer(instances, many=True)
        return Response({'status': 'sort_exercise', 'objs': serializer.data})

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def get_serializer_class(self):
        serializer_class = LiteTrainingExerciseSerializer
        return serializer_class

    def get_queryset(self):
        queryset = LiteTrainingExercise.objects.all()
        return queryset


class TrainingExerciseAdditionalViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = self.request.data.get('items')
        data_additionals = json.loads(data)
        print(data)
        print(data_additionals)
        if isinstance(data_additionals, list):  # <- is the main logic
            serializer = self.get_serializer(data=data_additionals, many=True)
        else:
            serializer = self.get_serializer(data=data_additionals)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serializer_class = ClubTrainingExerciseAdditionalSerializer
        else:
            serializer_class = UserTrainingExerciseAdditionalSerializer
        return serializer_class

    def get_queryset(self):
        if self.request.user.club_id is not None:
            queryset = ClubTrainingExerciseAdditional.objects.all()
        else:
            queryset = UserTrainingExerciseAdditional.objects.all()
        return queryset


class LiteTrainingExerciseAdditionalViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        data = self.request.data.get('items')
        data_additionals = json.loads(data)
        print(data)
        print(data_additionals)
        if isinstance(data_additionals, list):  # <- is the main logic
            serializer = self.get_serializer(data=data_additionals, many=True)
        else:
            serializer = self.get_serializer(data=data_additionals)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        serializer_class = LiteTrainingExerciseAdditionalSerializer
        return serializer_class

    def get_queryset(self):
        queryset = LiteTrainingExerciseAdditional.objects.all()
        return queryset


class TrainingProtocolViewSet(viewsets.ModelViewSet):
    permission_classes = [BaseTrainingsPermissions]

    @action(detail=True, methods=['post'])
    def check(self, request, pk=None):
        data = request.data
        instance = self.get_object()
        print(data['exercise_training'])
        if self.request.user.club_id is not None:
            training = ClubTrainingProtocol.objects.get(pk=pk)
            exercise = ClubTrainingExercise
        else:
            training = UserTrainingProtocol.objects.get(pk=pk)
            exercise = UserTrainingExercise
        edit_exercises = training.training_exercise_check
        print(training.status)

        status_exs = ''
        if training:
            if edit_exercises.exists() and edit_exercises.filter(pk=data['exercise_training']).exists():
                training.training_exercise_check.remove(edit_exercises.get(pk=data['exercise_training']))
                status_exs = 'removed'
            else:
                training.training_exercise_check.add(exercise.objects.get(pk=data['exercise_training']))
                status_exs = 'added'
            return Response({'status': status_exs})
        else:
            status_exs = 'error'
            return Response({'status': status_exs},
                            status=status.HTTP_400_BAD_REQUEST)

    def create(self, request, *args, **kwargs):
        data = self.request.data.get('items')
        data_players = json.loads(data)
        print(data)
        print(data_players)
        if isinstance(data_players, list):  # <- is the main logic
            serializer = self.get_serializer(data=data_players, many=True)
        else:
            serializer = self.get_serializer(data=data_players)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if self.request.user.club_id is not None:
            protocol_model = ClubTrainingProtocol
        else:
            protocol_model = UserTrainingProtocol

        print(serializer.data)
        if serializer.data['status_info'] != None and 'trainings_reset' in serializer.data['status_info']['tags'] and serializer.data['status_info']['tags']['trainings_reset'] == 1:
            protocol_model.objects.get(pk=serializer.data['id']).training_exercise_check.clear()

        return Response(serializer.data)

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serializer_class = ClubTrainingProtocolSerializer
        else:
            serializer_class = UserTrainingProtocolSerializer
        return serializer_class

    def get_queryset(self):
        if self.request.user.club_id is not None:
            queryset = ClubTrainingProtocol.objects.all()
        else:
            queryset = UserTrainingProtocol.objects.all()
        return queryset


# DJANGO
class TrainingsView(TemplateView):
    template_name = 'trainings/base_trainings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['ui_elements'] = get_ui_elements(self.request)
        return context


class EditTrainingsView(DetailView):
    template_name = 'trainings/view_training.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Подтягиваем папки и упражнения
        cur_user = User.objects.filter(pk=self.request.user.id).only("club_id")
        #print(cur_user.values())
        found_folders, found_club_folders, found_nfb_folders, refs = get_exercises_params(self.request, cur_user[0], self.request.session['team'])
        context['folders'] = found_folders
        context['folders_only_view'] = True
        # context['nfb_folders'] = found_nfb_folders
        context['nfb_folders'] = False
        context['refs'] = refs
        context['is_exercises'] = True
        context['ui_elements'] = get_ui_elements(self.request)
        context['group'] = get_training_group(self.request, context['object'])
        print(context)

        return context

    def get_queryset(self):
        if self.request.user.club_id is not None:
            self.model = ClubTraining
        else:
            self.model = UserTraining

        if self.queryset is None:
            if self.model:
                return self.model._default_manager.all()
            else:
                raise ImproperlyConfigured(
                    "%(cls)s is missing a QuerySet. Define "
                    "%(cls)s.model, %(cls)s.queryset, or override "
                    "%(cls)s.get_queryset()." % {"cls": self.__class__.__name__}
                )
        return self.queryset.all()


def get_training_group(request, current_training):
    print(request)
    if request.user.club_id is not None:
        training = ClubTraining
    else:
        training = UserTraining
    return training.objects.filter(team_id=request.session['team'], event_id__date=current_training.event_id.date).values()


class EditLiteTrainingsView(DetailView):
    template_name = 'trainings/view_lite_training.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Подтягиваем папки и упражнения
        cur_user = User.objects.filter(pk=self.request.user.id).only("club_id")
        #print(cur_user.values())
        found_folders, found_club_folders, found_nfb_folders, refs = get_exercises_params(self.request, cur_user[0], self.request.session['team'])
        context['folders'] = found_folders
        context['folders_only_view'] = True
        # context['nfb_folders'] = found_nfb_folders
        context['nfb_folders'] = False
        context['refs'] = refs
        context['is_exercises'] = True
        context['ui_elements'] = get_ui_elements(self.request)
        return context

    def get_queryset(self):
        self.model = LiteTraining

        if self.queryset is None:
            if self.model:
                return self.model._default_manager.all()
            else:
                raise ImproperlyConfigured(
                    "%(cls)s is missing a QuerySet. Define "
                    "%(cls)s.model, %(cls)s.queryset, or override "
                    "%(cls)s.get_queryset()." % {"cls": self.__class__.__name__}
                )
        return self.queryset.all()