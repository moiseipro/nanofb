from rest_framework import serializers
from references.models import VideoSource


class VideoSourceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoSource
        fields = (
            'id', 'name', 'short_name'
        )