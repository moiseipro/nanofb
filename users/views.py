import imp

from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, DetailView

from system_icons.views import get_ui_elements


# Create your views here.
from users.forms import EditUserPersonalForm
from users.models import User


class BaseProfileView(LoginRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'users/base_profile.html'
    model = User

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['edit_profile'] = EditUserPersonalForm()
        context['menu_profile'] = "active"
        context['ui_elements'] = get_ui_elements(self.request)
        return context


def profile_req(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'users/base_profile.html', {'ui_elements': get_ui_elements(request)})
