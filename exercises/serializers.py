from rest_framework import serializers
from exercises.models import UserExercise, ExerciseVideo, AdminExercise, AdminFolder, ClubExercise, UserFolder, \
    ClubFolder
from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)



# Exercise
from video.models import Video


class AdminFolderSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = AdminFolder
        fields = '__all__'


class UserFolderSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserFolder
        fields = ['id', 'short_name', 'name']


class ClubFolderSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClubFolder
        fields = ['id', 'short_name', 'name']


class AdminExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    folder = AdminFolderSerializer(read_only=True)
    title = serializers.JSONField(read_only=True)

    # video = ExerciseVideoSerializer(
    #     read_only=True,
    #     source="exercisevideo_set",
    #     many=True
    # )

    class Meta:
        model = AdminExercise
        fields = [
            'id', 'folder', 'title', 'videos'
        ]


class ExerciseVideoSerializer(serializers.ModelSerializer):
    # video = VideoSerializer(
    #     read_only=True
    # )

    class Meta:
        model = ExerciseVideo
        fields = [
            'video', 'type'
        ]


class BaseVideoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    note = serializers.JSONField()

    class Meta:
        model = Video
        fields = (
            'id', 'name', 'duration', 'language', 'music', 'links', 'upload_date', 'note'
        )
        datatables_always_serialize = ('id', 'taggit', 'exercises')


class ExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    videos = BaseVideoSerializer(read_only=True, many=True)


    class Meta:
        fields = [
            'id', 'user', 'field_task', 'title', 'videos', 'description'
        ]


class UserExerciseSerializer(ExerciseSerializer):
    folder = UserFolderSerializer(read_only=True)

    class Meta(ExerciseSerializer.Meta):
        model = UserExercise

    Meta.fields += ('folder',)


class ClubExerciseSerializer(ExerciseSerializer):
    folder = ClubFolderSerializer(read_only=True)

    class Meta(ExerciseSerializer.Meta):
        model = ClubExercise

    Meta.fields += ('folder',)
