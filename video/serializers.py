from rest_framework import serializers
import re
from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)
from exercises.serializers import AdminExerciseSerializer
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

    exercises = AdminExerciseSerializer(
        source='adminexercise_set',
        read_only=True,
        many=True
    )
    note = serializers.JSONField()

    taggit = TagListSerializerField()
    size = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = (
            'id', 'user', 'club', 'videosource_id', 'name', 'duration', 'language', 'music', 'links', 'upload_date', 'taggit',
            'videosource_name', 'exercises', 'size', 'note', 'favourites'
        )
        datatables_always_serialize = ('id', 'taggit', 'exercises')
    
    def get_size(self, obj):
        if not obj.size:
            return 0.0
        try:
            size_str = str(obj.size).strip()
            match = re.search(r'(\d+\.?\d*)', size_str)
            return float(match.group(1)) if match else 0.0
        except:
            return 0.0


class VideoUpdateSerializer(TaggitSerializer, serializers.ModelSerializer):
    taggit = TagListSerializerField()

    note = serializers.JSONField()

    class Meta:
        model = Video
        fields = (
            'id', 'user', 'club', 'videosource_id', 'name', 'taggit', 'duration', 'language', 'music', 'links', 'upload_date', 'size', 'note'
        )
