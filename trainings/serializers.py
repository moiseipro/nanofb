from rest_framework import serializers

from exercises.serializers import UserExerciseSerializer
from trainings.models import UserTraining, UserTrainingExercise, TrainingExerciseAdditionalData


# Training
class TrainingExerciseAdditionalDataSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = TrainingExerciseAdditionalData
        fields = [
            'id', 'additional_data_id', 'note'
        ]


class UserTrainingExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    exercise_name = serializers.JSONField(
        source="exercise_id.title",
        read_only=True
    )
    exercise_scheme = serializers.JSONField(
        source="exercise_id.scheme_data",
        read_only=True
    )

    class Meta:
        model = UserTrainingExercise
        fields = [
            'id', 'training_id', 'exercise_id', 'exercise_name', 'exercise_scheme', 'group', 'duration', 'order'
        ]


class UserTrainingSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(read_only=True)
    team_name = serializers.CharField(
        source='team_id.name',
        read_only=True
    )
    exercises_info = UserTrainingExerciseSerializer(
        read_only=True,
        source="usertrainingexercise_set",
        many=True
    )

    class Meta:
        model = UserTraining
        fields = [
            'event_id', 'favourites', 'team_name', 'exercises_info'
        ]
        datatables_always_serialize = ('event_id',)