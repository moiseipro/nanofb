import json

from django.core.exceptions import ImproperlyConfigured
from django.http import QueryDict
from django.shortcuts import render
from django.views.generic import DetailView
from django.views.generic.base import TemplateView
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions

from events.models import UserEvent
from exercises.models import UserExercise
from exercises.v_api import get_exercises_params
from players.models import UserPlayer, ClubPlayer
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason, ExsAdditionalData
from references.serializers import ExsAdditionalDataSerializer
from trainings.models import UserTraining, UserTrainingExercise, UserTrainingExerciseAdditional, UserTrainingProtocol, \
    ClubTrainingExercise, ClubTrainingProtocol, ClubTraining, ClubTrainingExerciseAdditional

# REST FRAMEWORK
from trainings.serializers import UserTrainingSerializer, UserTrainingExerciseSerializer, \
    UserTrainingExerciseAdditionalSerializer, UserTrainingProtocolSerializer, ClubTrainingExerciseSerializer, \
    ClubTrainingProtocolSerializer, ClubTrainingSerializer, ClubTrainingExerciseAdditionalSerializer
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
        serializer.save(team_id=team)

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
        else:
            exercise_count = UserTrainingExercise.objects.filter(training_id=pk, group=data['group']).count()
            current_exercise = UserTrainingExercise.objects.filter(training_id=pk, group=data['group'],
                                                                   exercise_id=data['exercise_id']).count()
        print(exercise_count)
        if exercise_count > 6:
            return Response({'status': 'exercise_limit'})
        if current_exercise > 0:
            return Response({'status': 'exercise_repeated'})
        data_dict = dict(
            training_id=pk,
            exercise_id=data['exercise_id'],
            group=data['group'],
            duration=data['duration'],
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
                object_serialize = ClubTrainingExerciseSerializer(new_obj).data
            else:
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
            players_team = list(ClubPlayer.objects.filter(team=training_team).values_list('id', flat=True))
        else:
            players_team = list(UserPlayer.objects.filter(team=training_team).values_list('id', flat=True))
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

    @action(detail=True, methods=['post'])
    def add_all_data(self, request, pk=None):
        data = request.data

        if self.request.user.club_id is not None:
            training_exercise = ClubTrainingExercise.objects.get(id=pk)
        else:
            training_exercise = UserTrainingExercise.objects.get(id=pk)
        data_count = training_exercise.additional.all().count()
        additionals = ExsAdditionalData.objects.all()

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
            training_exercise = ClubTrainingExercise.objects.get(id=pk)
        else:
            training_exercise = UserTrainingExercise.objects.get(id=pk)
        data_count = training_exercise.additional.all().count()
        additional = ExsAdditionalData.objects.all().first().pk

        print(data_count)
        print(pk)
        if data_count > 14:
            return Response({'status': 'data_limit'})
        data_dict = dict(
            training_exercise_id=pk,
            additional_id=additional,
            note=None
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
            print(serializer.validated_data)
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

