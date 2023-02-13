from django.contrib.auth.models import Group, Permission
from rest_framework import serializers
from users.models import User, UserPersonal


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


class UserPersonalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserPersonal
        fields = [
            'id', 'first_name', 'last_name', 'father_name', 'email_2', 'job_title', 'date_birthsday', 'country_id',
            'region', 'city', 'phone', 'phone_2', 'license', 'skype'
        ]


class CreateUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    personal = UserPersonalSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'club_id', 'email', 'password', 'personal'
        ]