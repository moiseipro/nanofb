from rest_framework import serializers

from references.serializers import VideoSourceSerializer
from version.serializers import SectionSerializer
from video.models import Video, VideoTags


class VideoTagsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoTags
        fields = ('id', 'name')


class VideoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    videosource_id = VideoSourceSerializer()
    tags = VideoTagsSerializer(
        many=True
    )

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'tags', 'duration', 'language', 'music', 'links', 'upload_date', 'shared_access'
        )
        datatables_always_serialize = ('id', 'tags')


class VideoUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'tags', 'duration', 'language', 'music', 'links', 'upload_date', 'shared_access'
        )