from rest_framework import serializers

from trainings.models import UserTraining


# Training
class UserTrainingSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    team_name = serializers.CharField(
        source='team_id.name',
        read_only=True
    )

    class Meta:
        model = UserTraining
        fields = [
            'id', 'team_name',
        ]
        datatables_always_serialize = ('id',)