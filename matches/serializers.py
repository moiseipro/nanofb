from rest_framework import serializers

from matches.models import UserMatch, ClubMatch, LiteMatch


class MatchSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        fields = (
            'event_id', 'team_id', 'm_type', 'duration', 'opponent'
        )
        datatables_always_serialize = ('event_id', 'm_type')


class UserMatchSerializer(MatchSerializer):
    class Meta(MatchSerializer.Meta):
        model = UserMatch


class ClubMatchSerializer(MatchSerializer):
    class Meta(MatchSerializer.Meta):
        model = ClubMatch


class LiteMatchSerializer(MatchSerializer):
    class Meta(MatchSerializer.Meta):
        model = LiteMatch
