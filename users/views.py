from collections import Counter

from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.core.mail import EmailMultiAlternatives
from django.db.models import QuerySet, Count
from django.http import QueryDict
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.views.generic import TemplateView, DetailView
from django_countries import countries
from rest_framework import status, viewsets, authentication, permissions
from rest_framework.decorators import action
from rest_framework.generics import UpdateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from datetime import date

from rest_framework.views import APIView
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
    template_name = 'users/base_profile.html'
    model = User

    def licence_check(self):
        activation = 'active'
        if self.request.user.is_archive:
            activation = 'achieve'
        elif self.request.user.club_id is not None:
            if self.request.user.club_id.date_registration_to < date.today():
                activation = 'club_license_expired'
        else:
            if self.request.user.registration_to < date.today():
                activation = 'license_expired'

        return activation

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['edit_profile'] = EditUserPersonalForm()
        context['menu_profile'] = "active"
        context['activation'] = self.licence_check()
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
        #User.objects.filter(first_name__icontains=)
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
            if self.object.check_password(serializer.data.get("old_password")):
                # set_password also hashes the password that the user will get
                self.object.set_password(serializer.data.get("password"))
                self.object.save()
                response = Response({"message": _('Password updated successfully')+'!'}, status=status.HTTP_200_OK)
            else:
                response = Response({"message": _("Wrong password")+'!'}, status=status.HTTP_400_BAD_REQUEST)

            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CountryListApiView(APIView):
    #authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        queryset = UserPersonal.objects.annotate(countries=Count('country_id')).order_by(
            '-country_id')
        list_countries = [
            {
                'id': personal.country_id.code,
                'name': personal.country_id.name,
                'flag': personal.country_id.flag,
                'count': personal.countries
            } for personal in queryset
        ]
        print(list_countries)
        countries_count = {}
        for country in list_countries:
            print(country)
            countries_count[country['id']] = countries_count.get(country['id'], {'name': '', 'count': 0})
            countries_count[country['id']]['count'] += country['count']
            countries_count[country['id']]['name'] = country['name']
            countries_count[country['id']]['flag'] = country['flag']
        print(countries_count)
        # counter = Counter()
        # for d in list_countries:
        #     id, name, count = d.get('id'), d.get('name'), d.get('count')
        #     counter.update({id: count, name: count})
        # print(counter)
        list2 = [{'id': id, 'flag': data['flag'], 'count': data['count'], 'text': data['name']} for id, data in countries_count.items()]
        list2.insert(0, {'id': 'all', 'flag': '', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


class VersionListApiView(APIView):
    #authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        queryset = User.objects.exclude(p_version=None).annotate(versions=Count('p_version')).order_by(
            'p_version')
        print(queryset.values())
        list_versions = [
            {
                'id': data.p_version.id,
                'name': data.p_version.name,
                'count': data.versions
            } for data in queryset
        ]
        print(list_versions)
        versions_count = {}
        for version in list_versions:
            print(version)
            versions_count[version['id']] = versions_count.get(version['id'], {'name': '', 'count': 0})
            versions_count[version['id']]['count'] += version['count']
            versions_count[version['id']]['name'] = version['name']
        print(versions_count)

        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in versions_count.items()]
        list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


def profile_req(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'users/base_profile.html', {'ui_elements': get_ui_elements(request)})
