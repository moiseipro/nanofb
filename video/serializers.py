from rest_framework import serializers

from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)
from references.serializers import VideoSourceSerializer
from video.models import Video, VideoTags


class VideoTagsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoTags
        fields = ('id', 'name')


class OnlyVideoSerializer(serializers.Serializer):
    links = serializers.JSONField(read_only=True)


class VideoSerializer(TaggitSerializer, serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    videosource_id = VideoSourceSerializer()
    taggit = TagListSerializerField()

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'taggit', 'duration', 'language', 'music', 'links', 'upload_date'
        )
        datatables_always_serialize = ('id', 'taggit')


class VideoUpdateSerializer(TaggitSerializer, serializers.ModelSerializer):
    taggit = TagListSerializerField()

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'taggit', 'duration', 'language', 'music', 'links', 'upload_date'
        )