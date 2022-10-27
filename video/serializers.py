from rest_framework import serializers

from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)

from exercises.serializers import ExerciseVideoSerializer
from references.serializers import VideoSourceSerializer
from video.models import Video, VideoTags


class VideoTagsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoTags
        fields = ('id', 'name')


class OnlyVideoSerializer(serializers.Serializer):
    links = serializers.JSONField(read_only=True)


class StringTagsField(serializers.ListField):
    child = serializers.CharField()

    def to_representation(self, data):
        return map(str, data.values_list('name', flat=True))


class VideoSerializer(TaggitSerializer, serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    videosource_id = VideoSourceSerializer(read_only=True)
    videosource_name = serializers.ReadOnlyField(
        source="videosource_id.name",
        read_only=True
    )

    taggit = TagListSerializerField()

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'duration', 'language', 'music', 'links', 'upload_date', 'taggit',
            'videosource_name'
        )
        datatables_always_serialize = ('id', 'taggit')


class VideoUpdateSerializer(TaggitSerializer, serializers.ModelSerializer):
    taggit = TagListSerializerField()

    class Meta:
        model = Video
        fields = (
            'id', 'videosource_id', 'name', 'taggit', 'duration', 'language', 'music', 'links', 'upload_date'
        )