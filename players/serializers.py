from rest_framework import serializers

from players.models import UserPlayer, ClubPlayer, PlayerCard
from references.serializers import PlayerPositionSerializer


class PlayerCardSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    ref_position = PlayerPositionSerializer(
        read_only=True
    )

    class Meta:
        model = PlayerCard
        fields = [
            'id', 'ref_position', 'is_goalkeeper', 'is_captain'
        ]


class PlayerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    full_name = serializers.CharField(
        source="get_part_name",
        read_only=True
    )

    card = PlayerCardSerializer(
        read_only=True
    )

    class Meta:
        fields = [
            'id', 'full_name', 'card'
        ]


class UserPlayerSerializer(PlayerSerializer):
    class Meta(PlayerSerializer.Meta):
        model = UserPlayer


class ClubPlayerSerializer(PlayerSerializer):
    class Meta(PlayerSerializer.Meta):
        model = ClubPlayer
