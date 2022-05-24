from rest_framework import serializers

from version.models import Section


class SectionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Section
        fields = (
            'id', 'name', 'tag'
        )