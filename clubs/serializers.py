from django.db import IntegrityError
from rest_framework import serializers

from clubs.models import Club
from users.models import User, UserPersonal
from django.utils.translation import gettext_lazy as _

from version.serializers import PermissionSerializer, GroupSerializer


class ClubSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    groups = GroupSerializer(

        read_only=True,
        many=True
    )
    permissions = PermissionSerializer(

        read_only=True,
        many=True
    )

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'subdomain', 'groups', 'permissions', 'date_registration', 'date_registration_to',
            'team_limit', 'player_limit', 'user_limit'
        ]


class ClubUserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    personal = serializers.PrimaryKeyRelatedField(queryset=UserPersonal.objects.all())
    club_id = serializers.PrimaryKeyRelatedField(queryset=Club.objects.all())

    default_error_messages = {
        "cannot_create_user": _('Unable to create account.')
    }

    class Meta:
        model = User
        fields = ['email', 'password', "personal", "club_id"]

    def perform_create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        user.save()

        return user

    def create(self, validated_data):
        try:
            user = self.perform_create(validated_data)
        except IntegrityError:
            self.fail("cannot_create_user")

        return user