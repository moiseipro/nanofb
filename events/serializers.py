from rest_framework import serializers

from events.models import UserMicrocycles, UserEvent, ClubMicrocycles, ClubEvent

# Microcycles
from matches.serializers import UserMatchSerializer, ClubMatchSerializer
from trainings.serializers import UserTrainingSerializer, ClubTrainingSerializer


class UserMicrocyclesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserMicrocycles
        fields = (
            'id', 'name', 'date_with', 'date_by'
        )
        datatables_always_serialize = ('id',)


class ClubMicrocyclesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClubMicrocycles
        fields = (
            'id', 'name', 'date_with', 'date_by'
        )
        datatables_always_serialize = ('id',)


class UserMicrocyclesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMicrocycles
        fields = (
            'name', 'date_with', 'date_by'
        )


class ClubMicrocyclesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubMicrocycles
        fields = (
            'name', 'date_with', 'date_by'
        )


class UserMicrocycleDaySerializer(serializers.Serializer):
    day = serializers.IntegerField()


# Event
class EventEditSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        fields = (
            'id', 'short_name', 'date'
        )


class UserEventEditSerializer(EventEditSerializer):
    class Meta(EventEditSerializer.Meta):
        model = UserEvent


class ClubEventEditSerializer(EventEditSerializer):
    class Meta(EventEditSerializer.Meta):
        model = ClubEvent


class EventSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    only_date = serializers.DateTimeField(
        format='%d/%m/%Y',
        source='date',
        read_only=True
    )
    time = serializers.DateTimeField(
        format='%H:%M',
        source='date',
        read_only=True
    )

    class Meta:
        fields = (
            'id', 'short_name', 'date', 'only_date', 'time'
        )
        datatables_always_serialize = ('id', 'short_name', 'only_date', 'time')


class UserEventSerializer(EventSerializer):
    training = UserTrainingSerializer(
        source='usertraining',
        read_only=True
    )

    match = UserMatchSerializer(
        source='usermatch',
        read_only=True
    )

    class Meta(EventSerializer.Meta):
        model = UserEvent

    Meta.fields += ('training', 'match')
    Meta.datatables_always_serialize += ('training', 'match')


class ClubEventSerializer(EventSerializer):
    training = ClubTrainingSerializer(
        source='clubtraining',
        read_only=True
    )

    match = ClubMatchSerializer(
        source='clubmatch',
        read_only=True
    )

    class Meta(EventSerializer.Meta):
        model = ClubEvent

    Meta.fields += ('training', 'match')
    Meta.datatables_always_serialize += ('training', 'match')
