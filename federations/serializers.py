from rest_framework import serializers

from federations.models import Federation
from version.serializers import GroupSerializer, PermissionSerializer, VersionSerializer


class FederationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    groups = GroupSerializer(
        read_only=True,
        many=True
    )
    permissions = PermissionSerializer(
        read_only=True,
        many=True
    )
    versions = VersionSerializer(
        read_only=True,
        many=True
    )

    class Meta:
        model = Federation
        fields = [
            'id', 'name', 'subdomain', 'groups', 'permissions', 'versions', 'date_registration', 'date_registration_to',
            'club_limit'
        ]