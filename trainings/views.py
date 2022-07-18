from django.shortcuts import render
from django.views.generic.base import TemplateView
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason


# Create your models here.
# DJANGO
class TrainingsView(TemplateView):
    template_name = 'trainings/base_trainings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teams_list'] = UserTeam.objects.filter(user_id=self.request.user)
        context['seasons_list'] = UserSeason.objects.filter(user_id=self.request.user)
        return context
