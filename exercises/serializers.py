from rest_framework import serializers
from exercises.models import UserExercise


# Exercise
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
