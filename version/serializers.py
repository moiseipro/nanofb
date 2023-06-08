from rest_framework import serializers

from version.models import Section, Version


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


