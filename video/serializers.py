from rest_framework import serializers

from references.serializers import VideoSourceSerializer
from version.serializers import SectionSerializer
from video.models import Video


class VideoSerializer(serializers.ModelSerializer):
    videosource_id = VideoSourceSerializer()
    section_id = SectionSerializer()

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'section_id', 'duration'
        )