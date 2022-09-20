from rest_framework import serializers
from exercises.models import UserExercise, ExerciseVideo, AdminExercise


# Exercise
class AdminExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    folder = serializers.PrimaryKeyRelatedField(read_only=True)

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
    exercise_nfb = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    class Meta:
        model = ExerciseVideo
        fields = [
            'exercise_nfb'
        ]
