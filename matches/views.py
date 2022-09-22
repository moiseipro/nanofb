import imp
from django.shortcuts import render
from django.views.generic import TemplateView

from references.models import UserTeam
from system_icons.views import get_ui_elements


# Create your views here.
class MatchesView(TemplateView):
    template_name = "matches/base_matches.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['team'] = UserTeam.objects.all()
        context['ui_elements'] = get_ui_elements()
        return context
