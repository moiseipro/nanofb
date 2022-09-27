from rest_framework import serializers
from references.models import VideoSource, UserTeam, UserSeason, ClubTeam, ClubSeason, TeamStatus, ExsAdditionalData, \
    PlayerProtocolStatus


class ExsAdditionalDataSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ExsAdditionalData
        fields = (
            'id', 'translation_names', 'short_name'
        )


class PlayerProtocolStatusSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = PlayerProtocolStatus
        fields = (
            'id', 'translation_names', 'short_name'
        )


class VideoSourceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoSource
        fields = (
            'id', 'name', 'short_name'
        )


class TeamStatusSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamStatus
        fields = [
            'id', 'name', 'short_name'
        ]


class UserTeamsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    #team_status = serializers.RelatedField(source="ref_team_status", read_only=True)
    team_status_info = TeamStatusSerializer(source='ref_team_status', read_only=True)

    class Meta:
        model = UserTeam
        fields = [
            'id', 'name', 'short_name', 'ref_team_status', 'team_status_info'
        ]
        datatables_always_serialize = ('id',)


class UserSeasonsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserSeason
        fields = [
            'id', 'name', 'short_name', 'date_with', 'date_by'
        ]
        datatables_always_serialize = ('id',)