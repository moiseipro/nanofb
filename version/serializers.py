from django.contrib.auth.models import Group, Permission
from rest_framework import serializers

from version.models import Section, Version, CustomGroup, SectionInformation


class SectionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Section
        fields = (
            'id', 'name', 'translation_name', 'tag'
        )


class VersionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Version
        fields = (
            'id', 'name', 'tag', 'price'
        )


class PermissionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Permission
        fields = [
            'id', 'name'
        ]


class CustomGroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomGroup
        fields = [
            'translation_name', 'parent_group', 'is_admin', 'text_id', 'order'
        ]


class GroupSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    permissions = PermissionSerializer(
        read_only=True,
        many=True
    )

    customgroup = CustomGroupSerializer(
        read_only=True
    )

    class Meta:
        model = Group
        fields = [
            'id', 'name', 'permissions', 'customgroup'
        ]


class SectionInformationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = SectionInformation
        fields = (
            'id', 'name', 'content', 'last_update'
        )