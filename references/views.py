from django.http import HttpResponseRedirect
from django.views.generic.base import TemplateView
from django.shortcuts import render
from references.models import UserSeason, UserTeam, ClubSeason, ClubTeam


# Create your views here.
class SettingsView(TemplateView):
    template_name = 'references/base_settings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teams'] = UserTeam.objects.all()
        context['seasons'] = UserSeason.objects.all()
        return context
    pass


# Custom view
def change_season(request):
    if request.method == "POST":
        if request.POST['season_value'] is None:
            request.session['season'] = UserSeason.objects.filter(user_id=request.user).first().id
        else:
            request.session['season'] = request.POST['season_value']
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


def change_team(request):
    if request.method == "POST":
        if request.POST['team_value'] is None:
            request.session['team'] = UserTeam.objects.filter(user_id=request.user).first().id
        else:
            request.session['team'] = request.POST['team_value']
    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

