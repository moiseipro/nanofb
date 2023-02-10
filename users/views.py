import imp

from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import QuerySet
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, DetailView
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response

from system_icons.views import get_ui_elements


# Create your views here.
from users.forms import EditUserPersonalForm
from users.models import User, UserPersonal
from users.serializers import UserPersonalSerializer


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


class EditUserApiView(UpdateAPIView):
    serializer_class = UserPersonalSerializer

    def get_queryset(self):
        queryset = UserPersonal.objects.filter(pk=self.request.user.personal.id)
        if isinstance(queryset, QuerySet):
            # Ensure queryset is re-evaluated on each request.
            queryset = queryset.all()
        return queryset

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = UserPersonal.objects.get(pk=self.request.user.personal.id)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


def profile_req(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'users/base_profile.html', {'ui_elements': get_ui_elements(request)})
