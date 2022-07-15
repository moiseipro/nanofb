from rest_framework import serializers
from references.models import VideoSource, UserTeam, UserSeason, ClubTeam, ClubSeason


class VideoSourceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoSource
        fields = (
            'id', 'name', 'short_name'
        )


class TeamStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTeam
        fields = [
            'id', 'name', 'short_name'
        ]


class UserTeamsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    ref_team_status = TeamStatusSerializer()

    class Meta:
        model = UserTeam
        fields = [
            'id', 'name', 'short_name', 'ref_team_status'
        ]
        datatables_always_serialize = ('id',)