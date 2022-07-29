from rest_framework import serializers

from exercises.serializers import UserExerciseSerializer
from trainings.models import UserTraining, UserTrainingExercise


# Training
class UserTrainingExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTrainingExercise
        fields = [
            'training_id', 'exercise_id', 'group', 'duration', 'order'
        ]


class UserTrainingSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source='team_id.name',
        read_only=True
    )
    # exercises = serializers.PrimaryKeyRelatedField(
    #     #read_only=True,
    #     #source="exercises",
    #     queryset=UserTrainingExercise.objects.all(),
    #     many=True
    # )
    exercises_info = UserExerciseSerializer(
        # read_only=True,
        source="exercises",
        many=True
    )


    class Meta:
        model = UserTraining
        fields = [
            'event_id', 'team_name', 'exercises', 'exercises_info'
        ]
        datatables_always_serialize = ('event_id',)