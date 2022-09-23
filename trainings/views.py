from django.http import QueryDict
from django.shortcuts import render
from django.views.generic import DetailView
from django.views.generic.base import TemplateView
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from events.models import UserEvent
from exercises.models import UserExercise
from exercises.v_api import get_exercises_params
from players.models import UserPlayer
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason, ExsAdditionalData
from references.serializers import ExsAdditionalDataSerializer
from trainings.models import UserTraining, UserTrainingExercise, UserTrainingExerciseAdditional, UserTrainingProtocol

# REST FRAMEWORK
from trainings.serializers import UserTrainingSerializer, UserTrainingExerciseSerializer, \
    UserTrainingExerciseAdditionalSerializer, UserTrainingProtocolSerializer
from users.models import User
from system_icons.views import get_ui_elements


class TrainingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team = UserTeam.objects.get(pk=self.request.session['team'])
        serializer.save(team_id=team)

    @action(detail=True, methods=['get'])
    def get_exercises(self, request, pk=None):
        group = request.query_params.get('group')
        print(group)
        if group:
            queryset = UserTrainingExercise.objects.filter(training_id=pk, group=group)
        else:
            queryset = UserTrainingExercise.objects.filter(training_id=pk)

        serializer = UserTrainingExerciseSerializer(queryset, many=True)
        return Response({'status': 'exercise_got', 'objs': serializer.data})

    @action(detail=True, methods=['post'])
    def add_exercise(self, request, pk=None):
        data = request.data

        exercise_count = UserTrainingExercise.objects.filter(training_id=pk, group=data['group']).count()
        print(exercise_count)
        if exercise_count > 7:
            return Response({'status': 'exercise_limit'})
        data_dict = dict(
            training_id=pk,
            exercise_id=data['exercise_id'],
            group=data['group'],
            duration=data['duration'],
            order=exercise_count
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        serializer = UserTrainingExerciseSerializer(
            data=query_dict
        )
        #print(serializer)
        if serializer.is_valid(raise_exception=True):
            new_obj = serializer.save()
            object_serialize = UserTrainingExerciseSerializer(new_obj).data
            return Response({'status': 'exercise_added', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def get_protocol(self, request, pk=None):
        data = request.data
        queryset = UserTrainingProtocol.objects.filter(training_id=pk)
        print(queryset)

        serializer = UserTrainingProtocolSerializer(queryset, many=True)
        return Response({'status': 'protocol_got', 'objs': serializer.data})

    @action(detail=True, methods=['post'])
    def add_all_protocol(self, request, pk=None):
        data = request.data

        protocol_count = UserTrainingProtocol.objects.filter(training_id=pk).count()
        training_team = UserTraining.objects.values_list('team_id', flat=True).get(pk=pk)
        print(training_team)
        if protocol_count > 30:
            return Response({'status': 'protocol_limit'})
        elif protocol_count > 0:
            return Response({'status': 'protocol_not_empty'})

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

        serializer = UserTrainingProtocolSerializer(
            data=players_array, many=True
        )
        # print(serializer)
        if serializer.is_valid(raise_exception=True):
            new_obj = serializer.save()
            print(new_obj)
            object_serialize = UserTrainingProtocolSerializer(new_obj, many=True).data
            return Response({'status': 'protocol_added', 'objs': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_protocol(self, request, pk=None):
        data = request.data

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

        serializer = UserTrainingProtocolSerializer(
            data=query_dict
        )
        # print(serializer)
        if serializer.is_valid(raise_exception=True):
            new_obj = serializer.save()
            object_serialize = UserTrainingProtocolSerializer(new_obj).data
            return Response({'status': 'protocol_added', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.action == 'update':
            return UserTrainingSerializer
        return UserTrainingSerializer

    def get_queryset(self):
        # if self.action == 'partial_update':
        #     return UserTraining.objects.all()
        print(self.request.session['team'])
        season = UserSeason.objects.filter(id=self.request.session['season'])
        return UserTraining.objects.filter(team_id=self.request.session['team'],
                                           event_id__user_id=self.request.user,
                                           event_id__date__gte=season[0].date_with,
                                           event_id__date__lte=season[0].date_by)


class TrainingExerciseViewSet(viewsets.ModelViewSet):
    queryset = UserTrainingExercise.objects.all()
    serializer_class = UserTrainingExerciseSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def get_data(self, request, pk=None):
        queryset = UserTrainingExerciseAdditional.objects.filter(training_exercise_id=pk)

        serializer = UserTrainingExerciseAdditionalSerializer(queryset, many=True)
        return Response({'status': 'data_got', 'objs': serializer.data})

    @action(detail=True, methods=['post'])
    def add_data(self, request, pk=None):
        data = request.data

        training_exercise = UserTrainingExercise.objects.get(id=pk)
        data_count = training_exercise.additional.all().count()
        additional = ExsAdditionalData.objects.all().first().pk
        print(data_count)
        print(pk)
        if data_count > 5:
            return Response({'status': 'data_limit'})
        data_dict = dict(
            training_exercise_id=pk,
            additional_id=additional,
            note=None
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        serializer = UserTrainingExerciseAdditionalSerializer(
            data=query_dict
        )
        print(serializer)
        if serializer.is_valid(raise_exception=True):
            print(serializer.validated_data)
            new_obj = serializer.save()
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
        edit_object = UserTrainingExercise.objects.filter(
            pk=pk
        )
        print(edit_object)

        data_dict = dict(
            duration=data['duration'],
            order=1
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(data_dict)

        serializer = UserTrainingExerciseSerializer(
            edit_object,
            data=query_dict
        )
        # print(serializer)
        if serializer.is_valid(raise_exception=True):
            update_obj = serializer.save()
            object_serialize = UserTrainingExerciseSerializer(update_obj).data
            return Response({'status': 'exercise_updated', 'obj': object_serialize})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def get_object_by_id(self, obj_id):
        try:
            return UserTrainingExercise.objects.get(id=obj_id)
        except (UserTrainingExercise.DoesNotExist, ValidationError):
            raise status.HTTP_400_BAD_REQUEST

    def validate_ids(self, id_list):
        for id in id_list:
            try:
                UserTrainingExercise.objects.get(id=int(id))
            except (UserTrainingExercise.DoesNotExist, ValidationError):
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


class TrainingExerciseAdditionalViewSet(viewsets.ModelViewSet):
    queryset = UserTrainingExerciseAdditional.objects.all()
    serializer_class = UserTrainingExerciseAdditionalSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


class TrainingProtocolViewSet(viewsets.ModelViewSet):
    queryset = UserTrainingProtocol.objects.all()
    serializer_class = UserTrainingProtocolSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        print(request.data)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


# DJANGO
class TrainingsView(TemplateView):
    template_name = 'trainings/base_trainings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teams_list'] = UserTeam.objects.filter(user_id=self.request.user)
        context['seasons_list'] = UserSeason.objects.filter(user_id=self.request.user)
        context['ui_elements'] = get_ui_elements()
        return context


class EditTrainingsView(DetailView):
    template_name = 'trainings/view_training.html'
    model = UserTraining

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teams_list'] = UserTeam.objects.filter(user_id=self.request.user)
        context['seasons_list'] = UserSeason.objects.filter(user_id=self.request.user)

        # Подтягиваем папки и упражнения
        cur_user = User.objects.filter(pk=self.request.user.id).only("club_id")
        #print(cur_user.values())
        found_folders, found_nfb_folders, refs = get_exercises_params(self.request, cur_user, self.request.session['team'])
        context['folders'] = found_folders
        context['folders_only_view'] = True
        context['nfb_folders'] = found_nfb_folders
        context['refs'] = refs
        context['is_exercises'] = True
        context['ui_elements'] = get_ui_elements()


        return context

