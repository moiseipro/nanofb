from rest_framework import serializers

from exercises.serializers import UserExerciseSerializer
from trainings.models import UserTraining, UserTrainingExercise


# Training
class UserTrainingExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    exercise_name = serializers.JSONField(
        source="exercise_id.title",
        read_only=True
    )

    class Meta:
        model = UserTrainingExercise
        fields = [
            'id', 'training_id', 'exercise_id', 'exercise_name', 'group', 'duration', 'order'
        ]


class UserTrainingSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source='team_id.name',
        read_only=True
    )
    # exercises = serializers.ManyRelatedField(
    #     #read_only=True,
    #     #source="exercises",
    #     child_relation="",
    #     queryset=UserTrainingExercise.objects.all(),
    #     many=True
    # )
    exercises_info = UserExerciseSerializer(
        read_only=True,
        source="exercises",
        many=True
    )

    class Meta:
        model = UserTraining
        fields = [
            'event_id', 'team_name', 'exercises_info'
        ]
        datatables_always_serialize = ('event_id',)