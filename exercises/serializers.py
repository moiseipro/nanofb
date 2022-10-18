from rest_framework import serializers
from exercises.models import UserExercise, ExerciseVideo, AdminExercise, AdminFolder
from taggit.serializers import (TagListSerializerField,
                                TaggitSerializer)


# Exercise
from video.models import Video
from video.serializers import VideoSerializer


class AdminFolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminFolder
        fields = '__all__'


class AdminExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    folder = AdminFolderSerializer(read_only=True)

    class Meta:
        model = AdminExercise
        fields = '__all__'



class UserExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExercise
        fields = [
            'user', 'completed', 'title'
        ]


class UserExerciseInTrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExercise
        fields = [
            'user', 'completed', 'title'
        ]


class ExerciseVideoSerializer(serializers.ModelSerializer):
    exercise_nfb = AdminExerciseSerializer(
        read_only=True,
    )

    video = serializers.IntegerField(read_only=True)
    video_name = serializers.CharField(read_only=True)
    #video_tags = TagListSerializerField()
    video_duration = serializers.CharField(read_only=True)
    video_date = serializers.CharField(read_only=True)
    video_source = serializers.CharField(read_only=True)

    class Meta:
        model = ExerciseVideo
        fields = [
            'exercise_nfb', 'video', 'video_name', 'video_duration', 'video_date', 'video_source'
        ]
