from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.core.mail import EmailMultiAlternatives
from django.db.models import QuerySet
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.views.generic import TemplateView, DetailView
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import UpdateAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend

from clubs.models import Club
from system_icons.views import get_ui_elements

from users.filters import UserManagementGlobalFilter
from users.forms import EditUserPersonalForm
from users.models import User, UserPersonal
from users.serializers import UserPersonalSerializer, ChangePasswordSerializer, UserSerializer, \
    UserManagementSerializer, UserEditSerializer, UserAllDataSerializer


# Create your views here.
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


class UserManagementView(PermissionRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'users/base_clients.html'
    permission_required = 'users.view_users'
    model = User

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['edit_profile'] = EditUserPersonalForm()
        context['menu_clients'] = "active"
        context['ui_elements'] = get_ui_elements(self.request)
        context['clubs'] = Club.objects.all()
        return context


class UserManagementApiView(viewsets.ModelViewSet):
    permission_classes = (IsAdminUser,)
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = UserManagementGlobalFilter

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = User.objects.get(pk=self.request.user.personal.id)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def edit_personal(self, request, pk=None):
        instance = User.objects.get(pk=pk)
        personal = UserPersonal.objects.get(pk=instance.personal.pk)
        serializer = UserPersonalSerializer(personal, data=self.request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response = {
                'status': 'success',
                'message': _('New personal profile data is saved!'),
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def edit_user(self, request, pk=None):
        instance = User.objects.get(pk=pk)
        serializer = UserEditSerializer(instance, data=self.request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response = {
                'status': 'success',
                'message': _('User data is saved!'),
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def get_user_data(self, request, pk=None):
        instance = User.objects.get(pk=pk)
        serializer = UserAllDataSerializer(instance)
        if serializer.data:
            response = {
                'status': 'get_users',
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def generate_new_password(self, request, pk=None):
        instance = User.objects.get(pk=pk)
        password = User.objects.make_random_password()
        instance.set_password(password)

        try:
            instance.save()
            context = {'email': instance.email, 'password': password}
            text_content = render_to_string('clubs/mail/email.txt', context)
            html_content = render_to_string('clubs/mail/email.html', context)

            email = EmailMultiAlternatives(_('New password on the Nanofootball website'), text_content)
            email.attach_alternative(html_content, "text/html")
            email.to = [instance.email]
            email.send()
            response = {
                'status': 'success',
                'message': _('A new password has been sent to the mail!'),
            }
            return Response(response, status=status.HTTP_200_OK)
        except:
            response = {
                'status': 'error',
                'message': _('Password generation error!'),
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)


    def perform_update(self, serializer):
        serializer.save()

    def get_serializer_class(self):
        return UserManagementSerializer

    def get_queryset(self):
        request = self.request

        #users = User.objects.filter(club_id=request.user.club_id)
        users = User.objects.all()

        return users


class EditUserApiView(UpdateAPIView):
    serializer_class = UserPersonalSerializer
    permission_classes = (IsAuthenticated,)

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


class EditPasswordApiView(UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        obj = self.request.user
        return obj

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": _("Wrong password.")}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("password"))
            self.object.save()
            response = {
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': _('Password updated successfully!'),
                'data': []
            }

            return Response(response)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def profile_req(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'users/base_profile.html', {'ui_elements': get_ui_elements(request)})
