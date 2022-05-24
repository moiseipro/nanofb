from rest_framework import serializers

from references.serializers import VideoSourceSerializer
from version.serializers import SectionSerializer
from video.models import Video


class VideoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    videosource_id = VideoSourceSerializer()
    section_id = SectionSerializer()

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'section_id', 'duration', 'links', 'upload_date', 'shared_access'
        )
        datatables_always_serialize = ('id',)