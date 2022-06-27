from django.shortcuts import render
from django.views.generic import TemplateView

from references.models import UserTeam


# Create your views here.
class EventsView(TemplateView):
    template_name = "events/base_events.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['team'] = UserTeam.objects.all()
        return context
