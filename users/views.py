from collections import Counter

from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.contrib.auth.models import Group
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models import QuerySet, Count
from django.http import QueryDict
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.views.generic import TemplateView, DetailView
from django_countries import countries
from django_countries.fields import Country
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
from clubs.serializers import ClubSerializer
from notifications.models import Notification
from system_icons.views import get_ui_elements

from users.filters import UserManagementGlobalFilter
from users.forms import EditUserPersonalForm
from users.models import User, UserPersonal, TrainerLicense
from users.serializers import UserPersonalSerializer, ChangePasswordSerializer, UserSerializer, \
    UserManagementSerializer, UserEditSerializer, UserAllDataSerializer, CreateUserSerializer, \
    CreateUserManagementSerializer, GroupSerializer, UserAdminEditSerializer

# Create your views here.
from version.models import Version


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
        context['trainer_license'] = TrainerLicense.objects.all()
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
        context['versions'] = Version.objects.all()
        context['trainer_license'] = TrainerLicense.objects.all()
        return context


class UserManagementApiView(viewsets.ModelViewSet):
    permission_classes = (IsAdminUser,)
    filter_backends = (DatatablesFilterBackend,)
    filterset_class = UserManagementGlobalFilter

    def create(self, request, *args, **kwargs):
        print(request.data)
        if User.objects.filter(email=request.data['email']).exists():
            res_data = {'registration': _("A user with this Email already exists!")}
            return Response(res_data, status=status.HTTP_403_FORBIDDEN)
        try:
            validate_email(request.data['email'])
        except ValidationError as e:
            res_data = {'registration': _("This Email not valid!")}
            return Response(res_data, status=status.HTTP_403_FORBIDDEN, headers=e)
        serializer_personal = UserPersonalSerializer(data=request.data)
        serializer_personal.is_valid(raise_exception=True)
        serializer_personal.save()
        print(serializer_personal.data)
        password = User.objects.make_random_password()
        userDict = dict(
            personal=serializer_personal.data['id'],
            email=request.data['email'],
            password=password,
            club_id=request.data['club_id'],
            p_version=request.data['p_version']
        )
        query_dict = QueryDict('', mutable=True)
        query_dict.update(userDict)
        print(query_dict)
        serializer = CreateUserManagementSerializer(data=userDict)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        headers = self.get_success_headers(serializer.data)

        res_data = {'registration': _("Registration success!")}
        res_data.update(serializer.data)
        context = {'email': request.data['email'], 'password': password}
        text_content = render_to_string('clubs/mail/email.txt', context)
        html_content = render_to_string('clubs/mail/email.html', context)

        email = EmailMultiAlternatives(_('Registration on the Nanofootball website'), text_content)
        email.attach_alternative(html_content, "text/html")
        email.to = [request.data['email']]
        email.send()
        return Response(res_data, status=status.HTTP_201_CREATED, headers=headers)
        # headers = self.get_exception_handler(serializer.data)
        # UserPersonal.objects.get(id=serializer_personal.data.id).delete()
        # res_data = {'registration': _("A user with this Email already exists!")}
        # return Response(res_data, status=status.HTTP_400_BAD_REQUEST, headers=headers)

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
        print(self.request.data)
        if request.user.is_superuser:
            serializer = UserAdminEditSerializer(instance, data=self.request.data, partial=True)
        else:
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
    def change_permission(self, request, pk=None):
        data = request.data

        user_edit = User.objects.get(id=pk)
        print(user_edit.groups.all())
        group = Group.objects.get(id=data['group_id'])
        print(data)
        if group in user_edit.groups.all():
            user_edit.groups.remove(group)
            return Response({'status': 'group_removed'})
        else:
            user_edit.groups.add(group)
            return Response({'status': 'group_added'})

    @action(detail=True, methods=['get'])
    def get_user_group(self, request, pk=None):
        groups = User.objects.get(pk=pk).groups.order_by("customgroup__order")
        print(groups.values())
        serializer = GroupSerializer(groups, many=True)
        #serializer.is_valid()
        if serializer.data:
            response = {
                'status': 'user_group',
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            response = {
                'status': 'user_group',
                'data': ''
            }
            return Response(response, status=status.HTTP_200_OK)
            #return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    @action(detail=True, methods=['post'])
    def send_mail(self, request, pk=None):
        instance = User.objects.get(pk=pk)
        title = request.POST.get('title', '')
        content = request.POST.get('content', '')

        try:
            context = {'title': title, 'content': content}
            text_content = render_to_string('users/mail/mail_info.html', context)
            html_content = render_to_string('users/mail/mail_info.html', context)

            email = EmailMultiAlternatives(title, text_content)
            email.attach_alternative(html_content, "text/html")
            email.to = [instance.email]
            email.send()
            response = {
                'status': 'success',
                'message': _('The message was sent successfully!'),
            }
            return Response(response, status=status.HTTP_200_OK)
        except:
            response = {
                'status': 'error',
                'message': _('Error sending the message!'),
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def send_mail_filtered(self, request):
        instance = User.objects.filter(id__in=request.POST.get('users', '').split(",")).values('email')
        title = request.POST.get('title', '')
        content = request.POST.get('content', '')
        print(instance)
        emails = []
        for user in instance:
            emails.append(user['email'])
        print(emails)

        try:
            context = {'title': title, 'content': content}
            text_content = render_to_string('users/mail/mail_info.html', context)
            html_content = render_to_string('users/mail/mail_info.html', context)

            email = EmailMultiAlternatives(title, text_content)
            email.attach_alternative(html_content, "text/html")
            email.to = emails
            email.send()
            response = {
                'status': 'success',
                'message': _('The message was sent successfully!'),
            }
            return Response(response, status=status.HTTP_200_OK)
        except:
            response = {
                'status': 'error',
                'message': _('Error sending the message!'),
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        serializer.save()

    def get_serializer_class(self):
        return UserManagementSerializer

    def get_queryset(self):
        request = self.request

        #users = User.objects.filter(club_id=request.user.club_id)
        users = User.objects.all().order_by('-date_last_login', 'club_id')
        #users = User.objects.annotate(payment_date='userpaymentinformation__payment_before')
        #User.objects.prefetch_related(Prefetch('notificationuser_set'))

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


class UserGroupListApiView(APIView):
    # authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        queryset = User.objects.exclude(group=None).annotate(groups_count=Count('group')).order_by('group')

        list_groups = [
            {
                'id': user.group,
                'name': user.group,
                'count': user.groups_count
            } for user in queryset
        ]
        print(list_groups)
        groups_count = {}
        for group in list_groups:
            print(group)
            groups_count[group['id']] = groups_count.get(group['id'], {'name': '', 'count': 0})
            groups_count[group['id']]['count'] += group['count']
            groups_count[group['id']]['name'] = group['name']
        print(groups_count)
        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in groups_count.items()]
        list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


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


class ClubsApiViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAdminUser,)

    @action(detail=True, methods=['get'])
    def get_club_group(self, request, pk=None):
        groups = Club.objects.get(pk=pk).groups.order_by("customgroup__order")
        print(groups.values())
        serializer = GroupSerializer(groups, many=True)
        # serializer.is_valid()
        if serializer.data:
            response = {
                'status': 'club_group',
                'data': serializer.data
            }
            return Response(response, status=status.HTTP_200_OK)
        else:
            response = {
                'status': 'club_group',
                'data': ''
            }
            return Response(response, status=status.HTTP_200_OK)
            # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def change_permission(self, request, pk=None):
        data = request.data

        club_edit = Club.objects.get(id=pk)
        print(club_edit.groups.all())
        group = Group.objects.get(id=data['group_id'])
        print(data)
        if group in club_edit.groups.all():
            club_edit.groups.remove(group)
            return Response({'status': 'group_removed'})
        else:
            club_edit.groups.add(group)
            return Response({'status': 'group_added'})

    def create(self, request, *args, **kwargs):
        print(request.data)
        if Club.objects.filter(subdomain=request.data['subdomain']).exists():
            res_data = {'action': _("A club with this subdomain already exists!")}
            return Response(res_data, status=status.HTTP_403_FORBIDDEN)

        print(request.data)

        serializer = ClubSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        res_data = {'action': _("Create club success!")}
        res_data.update(serializer.data)
        return Response(res_data, status=status.HTTP_201_CREATED, headers=headers)

    # def perform_create(self, serializer):
    #     serializer.save(federation_id=self.request.user.federation_id)

    def get_serializer_class(self):
        return ClubSerializer

    def get_queryset(self):
        club = Club.objects.all()
        result = club
        print(result)
        return result


class CountryListApiView(APIView):
    #authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        queryset = User.objects.annotate(countries=Count('personal__country_id')).order_by(
            '-personal__country_id')
        list_countries = [
            {
                'id': user.personal.country_id.code,
                'name': user.personal.country_id.name,
                'flag': user.personal.country_id.flag,
                'count': user.countries
            } for user in queryset
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
        #User.objects.filter(date_joined__gt=date.today()-timedelta(days=3))
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
        #list2.insert(0, {'id': 'all', 'count': '', 'text': _('Not chosen')})
        print(list2)
        return Response(list2)


class ClubListApiView(APIView):
    #authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        queryset = User.objects.exclude(club_id=None).annotate(users=Count('club_id')).order_by(
            'club_id')
        print(queryset.values())
        list_clubs = [
            {
                'id': data.club_id.id,
                'name': data.club_id.name,
                'count': data.users
            } for data in queryset
        ]
        print(list_clubs)
        clubs_count = {}
        for club in list_clubs:
            print(club)
            clubs_count[club['id']] = clubs_count.get(club['id'], {'name': '', 'count': 0})
            clubs_count[club['id']]['count'] += club['count']
            clubs_count[club['id']]['name'] = club['name']
        print(clubs_count)

        list2 = [{'id': id, 'count': data['count'], 'text': data['name']} for id, data in clubs_count.items()]
        list2.insert(0, {'id': '-1', 'count': '', 'text': _('No')})
        print(list2)
        #User.objects.filter(club_id_id__in=)
        return Response(list2)


def profile_req(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'users/base_profile.html', {'ui_elements': get_ui_elements(request)})
