from django.contrib.auth.models import Group
from django.core.validators import validate_email
from django.http import QueryDict
from django.template import Context
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.response import Response
from rest_framework_datatables.django_filters.backends import DatatablesFilterBackend
from django.utils.translation import gettext_lazy as _

from clubs.forms import ClubAddUserForm, ClubAddPersonalForm
from clubs.models import Club
from clubs.serializers import ClubSerializer, ClubUserCreateSerializer
from users.models import User, UserPersonal
from users.serializers import UserSerializer, UserPersonalSerializer, CreateUserSerializer


class ClubPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['clubs.club_admin'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['clubs.club_admin'],
        'PUT': ['clubs.club_admin'],
        'PATCH': ['clubs.club_admin'],
        'DELETE': ['clubs.club_admin'],
    }


# Create your views here.
class BaseClubView(LoginRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'clubs/admin_panel.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['add_user_form'] = ClubAddUserForm()
        context['add_personal_form'] = ClubAddPersonalForm()
        return context


class ClubUsersViewSet(viewsets.ModelViewSet):
    filter_backends = (DatatablesFilterBackend,)
    filterset_fields = '__all__'
    # filterset_class = VideoGlobalFilter

    def create(self, request, *args, **kwargs):
        print(request.data)
        users = User.objects.filter(club_id=self.request.user.club_id)
        if len(users) < self.request.user.club_id.user_limit:
            print(request.data)
            try:
                validate_email(request.data['email'])
            except ValidationError as e:
                res_data = {'registration': _("A user with this Email already exists!")}
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
                club_id=self.request.user.club_id.id
            )
            query_dict = QueryDict('', mutable=True)
            query_dict.update(userDict)
            print(query_dict)
            serializer = ClubUserCreateSerializer(data=userDict)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
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
        else:
            return Response({'limit': 'user_limit'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'])
    def change_permission(self, request, pk=None):
        data = request.data

        user_edit = User.objects.get(id=pk, club_id=request.user.club_id)
        print(user_edit.groups.all())
        group = Group.objects.get(id=data['group_id'])
        print(data)
        if group in user_edit.groups.all():
            user_edit.groups.remove(group)
            return Response({'status': 'group_removed'})
        else:
            user_edit.groups.add(group)
            return Response({'status': 'group_added'})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_permissions(self):
        permission_classes = [ClubPermissions]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return UserSerializer

    def get_queryset(self):
        users = User.objects.filter(club_id=self.request.user.club_id)
        result = users
        print(result)
        return result


class ClubViewSet(viewsets.ModelViewSet):
    # filter_backends = (DatatablesFilterBackend,)
    # filterset_class = VideoGlobalFilter

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_permissions(self):
        permission_classes = [ClubPermissions]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return ClubSerializer

    def get_queryset(self):
        club = Club.objects.filter(id=self.request.user.club_id.id)
        result = club
        print(result)
        return result