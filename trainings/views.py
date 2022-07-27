from django.shortcuts import render
from django.views.generic import DetailView
from django.views.generic.base import TemplateView
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from events.models import UserEvent
from exercises.models import UserExercise
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason
from trainings.models import UserTraining, UserTrainingExercise

# REST FRAMEWORK
from trainings.serializers import UserTrainingSerializer, UserTrainingExerciseSerializer


class TrainingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team = UserTeam.objects.get(pk=self.request.session['team'])
        serializer.save(team_id=team)

    def create(self, request, *args, **kwargs):
        data = request.data
        user = request.user
        instance = self.get_object()
        new_event = UserEvent.objects.create(user_id=user)

        print(data)

    @action(detail=True, methods=['post'])
    def add_exercise(self, request, pk=None):
        data = request.data
        instance = self.get_object()

        print(data)

        serializer = UserTrainingExerciseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            # UserTrainingExercise.objects.create(serializer.validated_data)
            # instance.exercises.add(UserExercise.objects.get(id=1))
            # instance.save()
            return Response({'status': 'exercise_added'})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return UserTrainingSerializer
        return UserTrainingSerializer

    def get_queryset(self):
        if self.action == 'partial_update':
            return UserTraining.objects.all()
        season = UserSeason.objects.filter(id=self.request.session['season'])
        return UserTraining.objects.filter(event_id__user_id=self.request.user,
                                           event_id__date__gte=season[0].date_with,
                                           event_id__date__lte=season[0].date_by)


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
        return context