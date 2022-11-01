from rest_framework import serializers

from clubs.models import Club
from users.models import User
from users.serializers import GroupSerializer, PermissionSerializer


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
            'id', 'name', 'subdomain', 'groups', 'permissions', 'date_registration', 'date_registration_to'
        ]