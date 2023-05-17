import datetime

from django.contrib.auth.models import Group, Permission
from rest_framework import serializers
from users.models import User, UserPersonal
from django_countries.serializer_fields import CountryField
from django.utils.translation import gettext_lazy as _

from version.serializers import VersionSerializer


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    password2 = serializers.CharField(required=True)


class PermissionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Permission
        fields = [
            'id', 'name'
        ]


class GroupSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    permissions = PermissionSerializer(
        read_only=True,
        many=True
    )

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'permissions'
        ]


class ClubUserEditPermission(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'user_permissions', 'groups'
        ]


class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    full_name = serializers.CharField(
        source='personal.full_name'
    )
    job_title = serializers.CharField(
        source='personal.job_title'
    )
    date_birthsday = serializers.DateField(
        source='personal.date_birthsday'
    )
    groups = GroupSerializer(read_only=True, many=True)

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'job_title', 'date_birthsday', 'days_entered', 'is_active', 'groups'
        ]
        datatables_always_serialize = ('id', 'groups')


class UserEditSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'club_id', 'registration_to', 'is_archive', 'is_demo_mode'
        ]


class UserPersonalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    country_id = CountryField()

    class Meta:
        model = UserPersonal
        fields = [
            'id', 'first_name', 'last_name', 'father_name', 'email_2', 'job_title', 'date_birthsday', 'country_id',
            'region', 'city', 'phone', 'phone_2', 'license', 'license_date', 'skype'
        ]


class UserAllDataSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    personal = UserPersonalSerializer()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'club_id', 'date_last_login', 'date_joined', 'days_entered', 'is_active', 'registration_to',
            'personal', 'is_archive', 'is_demo_mode'
        ]


class CreateUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    personal = UserPersonalSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'club_id', 'email', 'password', 'personal'
        ]


class UserManagementSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    last_name = serializers.CharField(
        source="personal.last_name"
    )
    first_name = serializers.CharField(
        source="personal.first_name"
    )
    job_title = serializers.CharField(
        source="personal.job_title"
    )
    date_birthsday = serializers.DateField(
        source="personal.date_birthsday"
    )
    age = serializers.SerializerMethodField()
    license = serializers.CharField(
        source="personal.license"
    )
    license_date = serializers.DateField(
        source="personal.license_date"
    )
    club_name = serializers.CharField(
        source="club_id.name",
        default="---"
    )
    club_registration_to = serializers.DateField(
        source="club_id.date_registration_to",
        default=""
    )
    p_version = VersionSerializer()
    flag = serializers.CharField(
        source="personal.country_id.flag"
    )

    groups = GroupSerializer(read_only=True, many=True)

    admin_type = serializers.SerializerMethodField()

    activation = serializers.SerializerMethodField()

    def get_admin_type(self, user):
        admin_types = ''
        if user.is_superuser:
            admin_types += _("MA")
        if user.club_id is not None and user.has_perm('clubs.club_admin'):
            admin_types += _("CA")
        return admin_types

    def get_age(self, user):
        today = datetime.date.today()
        birthday = user.personal.date_birthsday
        age = today.year-birthday.year
        if birthday.month >= today.month and birthday.day > today.day:
            age -= 1
        return age

    def get_activation(self, user):
        active_status = {'type': '', 'status': ''}
        if user.is_active:
            active_status['type'] = 'success'
            active_status['status'] = _("Active")
            if user.is_archive == 1:
                active_status['type'] = 'warning'
                active_status['status'] = _("Archive")
            elif user.club_id is not None:
                if user.club_id.date_registration_to < datetime.date.today():
                    active_status['type'] = 'danger'
                    active_status['status'] = _("Club license expired")
            else:
                if user.registration_to < datetime.date.today():
                    active_status['type'] = 'danger'
                    active_status['status'] = _("License expired")

        else:
            active_status['type'] = 'danger'
            active_status['status'] = _("Not active")
        return active_status

    class Meta:
        model = User
        fields = [
            'id', 'email', 'days_entered', 'is_active', 'admin_type', 'p_version', 'registration_to', 'groups',
            'last_name', 'first_name', 'job_title', 'date_birthsday', 'age', 'license', 'license_date', 'flag',
            'activation', 'club_name', 'club_registration_to', 'is_archive', 'date_joined'
        ]
        datatables_always_serialize = ('id', 'groups', 'club_registration_to', 'is_archive')