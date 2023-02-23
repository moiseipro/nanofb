from rest_framework import serializers

from events.models import UserMicrocycles, UserEvent, ClubMicrocycles, ClubEvent, LiteMicrocycles, LiteEvent

# Microcycles
from matches.serializers import UserMatchSerializer, ClubMatchSerializer, LiteMatchSerializer
from trainings.serializers import UserTrainingSerializer, ClubTrainingSerializer, LiteTrainingSerializer


class AbstractMicrocyclesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        fields = (
            'id', 'name', 'date_with', 'date_by'
        )
        datatables_always_serialize = ('id',)


class UserMicrocyclesSerializer(AbstractMicrocyclesSerializer):
    class Meta(AbstractMicrocyclesSerializer.Meta):
        model = UserMicrocycles


class ClubMicrocyclesSerializer(AbstractMicrocyclesSerializer):
    class Meta(AbstractMicrocyclesSerializer.Meta):
        model = ClubMicrocycles


class LiteMicrocyclesSerializer(AbstractMicrocyclesSerializer):
    class Meta(AbstractMicrocyclesSerializer.Meta):
        model = LiteMicrocycles


class AbstractMicrocyclesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'name', 'date_with', 'date_by'
        )


class UserMicrocyclesUpdateSerializer(AbstractMicrocyclesUpdateSerializer):
    class Meta(AbstractMicrocyclesUpdateSerializer.Meta):
        model = UserMicrocycles


class ClubMicrocyclesUpdateSerializer(AbstractMicrocyclesUpdateSerializer):
    class Meta(AbstractMicrocyclesUpdateSerializer.Meta):
        model = ClubMicrocycles


class LiteMicrocyclesUpdateSerializer(AbstractMicrocyclesUpdateSerializer):
    class Meta(AbstractMicrocyclesUpdateSerializer.Meta):
        model = LiteMicrocycles


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
    training = UserTrainingSerializer(
        source='usertraining',
        read_only=True
    )

    match = UserMatchSerializer(
        source='usermatch',
        read_only=True
    )

    class Meta(EventEditSerializer.Meta):
        model = UserEvent

    Meta.fields += ('training', 'match')


class ClubEventEditSerializer(EventEditSerializer):
    training = ClubTrainingSerializer(
        source='clubtraining',
        read_only=True
    )

    match = ClubMatchSerializer(
        source='clubmatch',
        read_only=True
    )

    class Meta(EventEditSerializer.Meta):
        model = ClubEvent

    Meta.fields += ('training', 'match')


class LiteEventEditSerializer(EventEditSerializer):
    training = LiteTrainingSerializer(
        source='litetraining',
        read_only=True
    )

    match = LiteMatchSerializer(
        source='litematch',
        read_only=True
    )

    class Meta(EventEditSerializer.Meta):
        model = LiteEvent

    Meta.fields += ('training', 'match')


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


class LiteEventSerializer(EventSerializer):
    training = LiteTrainingSerializer(
        source='litetraining',
        read_only=True
    )

    match = LiteMatchSerializer(
        source='litematch',
        read_only=True
    )

    class Meta(EventSerializer.Meta):
        model = LiteEvent

    Meta.fields += ('training', 'match')
    Meta.datatables_always_serialize += ('training', 'match')