from rest_framework import serializers

from trainings.models import UserTraining


# Training
class UserTrainingSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source='team_id.name',
        read_only=True
    )

    class Meta:
        model = UserTraining
        fields = [
            'event_id', 'team_name'
        ]
        datatables_always_serialize = ('event_id',)