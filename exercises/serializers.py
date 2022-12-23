from rest_framework import serializers
from exercises.models import UserExercise, ExerciseVideo, AdminExercise, AdminFolder, ClubExercise
from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)

# Exercise
from video.models import Video


# from video.serializers import VideoSerializer


class AdminFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminFolder
        fields = '__all__'


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


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        fields = [
            'user', 'field_task', 'title'
        ]


class UserExerciseSerializer(ExerciseSerializer):
    class Meta(ExerciseSerializer.Meta):
        model = UserExercise


class ClubExerciseSerializer(ExerciseSerializer):
    class Meta(ExerciseSerializer.Meta):
        model = ClubExercise
