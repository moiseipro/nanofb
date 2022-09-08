from django.http import QueryDict
from django.shortcuts import render
from django.views.generic import DetailView
from django.views.generic.base import TemplateView
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from events.models import UserEvent
from exercises.models import UserExercise
from exercises.views import get_exercises_params
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason
from trainings.models import UserTraining, UserTrainingExercise

# REST FRAMEWORK
from trainings.serializers import UserTrainingSerializer, UserTrainingExerciseSerializer
from users.models import User


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
            order=1
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

    @action(detail=True, methods=['put'])
    def edit_exercise(self, request, pk=None):
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


        return context