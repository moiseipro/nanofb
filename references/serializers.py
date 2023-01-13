from rest_framework import serializers
from references.models import VideoSource, UserTeam, UserSeason, ClubTeam, ClubSeason, TeamStatus, ExsAdditionalData, \
    PlayerProtocolStatus, PlayerPosition, TrainingSpace, TrainingAdditionalData


class PlayerPositionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = PlayerPosition
        fields = (
            'id', 'translation_names', 'short_name', 'name'
        )


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
            'id', 'translation_names', 'short_name', 'tags'
        )


class VideoSourceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = VideoSource
        fields = (
            'id', 'name', 'short_name'
        )


class TrainingSpaceSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = TrainingSpace
        fields = (
            'id', 'translation_names', 'name', 'short_name'
        )


class TrainingAdditionalDataSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = TrainingAdditionalData
        fields = (
            'id', 'translation_names', 'name', 'short_name'
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
    team_status_info = TeamStatusSerializer(source='ref_team_status', read_only=True)

    class Meta:
        model = UserTeam
        fields = [
            'id', 'name', 'short_name', 'ref_team_status', 'team_status_info'
        ]
        datatables_always_serialize = ('id',)


class ClubTeamsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    team_status_info = TeamStatusSerializer(source='ref_team_status', read_only=True)

    class Meta:
        model = ClubTeam
        fields = [
            'id', 'name', 'short_name', 'ref_team_status', 'team_status_info', 'users'
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


class ClubSeasonsSerializer(UserSeasonsSerializer):
    class Meta(UserSeasonsSerializer.Meta):
        model = ClubSeason
