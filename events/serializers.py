from rest_framework import serializers

from events.models import UserMicrocycles, UserEvent


# Microcycles
from trainings.serializers import UserTrainingSerializer


class UserMicrocyclesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserMicrocycles
        fields = [
            'id', 'name', 'date_with', 'date_by'
        ]
        datatables_always_serialize = ('id',)


class UserMicrocyclesUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserMicrocycles
        fields = [
            'name', 'date_with', 'date_by'
        ]


# Event
class UserEventSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    training = UserTrainingSerializer(
        source='usertraining',
        read_only=True
    )

    class Meta:
        model = UserEvent
        fields = [
            'id', 'short_name', 'date', 'training'
        ]
        datatables_always_serialize = ('id', 'training',)