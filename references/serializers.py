from rest_framework import serializers
from references.models import VideoSource, UserTeam, UserSeason, ClubTeam, ClubSeason, TeamStatus, ExsAdditionalData, \
    PlayerProtocolStatus, PlayerPosition, TrainingSpace, TrainingAdditionalData, UserExsAdditionalData, \
    ClubExsAdditionalData, UserPaymentInformation, PaymentInformation, ClubPaymentInformation


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
            'id', 'translation_names', 'short_name', 'order'
        )


class UserExsAdditionalDataSerializer(ExsAdditionalDataSerializer):
    class Meta(ExsAdditionalDataSerializer.Meta):
        model = UserExsAdditionalData

    #Meta.fields += ('user_id',)


class ClubExsAdditionalDataSerializer(ExsAdditionalDataSerializer):
    class Meta(ExsAdditionalDataSerializer.Meta):
        model = ClubExsAdditionalData

    #Meta.fields += ('club_id',)


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
            'id', 'name', 'short_name', 'age_key', 'u_key', 'ref_team_status', 'team_status_info', 'players_json'
        ]
        datatables_always_serialize = ('id',)


class ClubTeamsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    team_status_info = TeamStatusSerializer(source='ref_team_status', read_only=True)

    class Meta:
        model = ClubTeam
        fields = [
            'id', 'name', 'short_name', 'age_key', 'u_key', 'ref_team_status', 'team_status_info', 'users', 'players_json'
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


class PaymentInformationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = PaymentInformation
        fields = [
            'id', 'payment', 'date', 'payment_before'
        ]
        datatables_always_serialize = ('id',)


class UserPaymentInformationSerializer(PaymentInformationSerializer):
    class Meta(PaymentInformationSerializer.Meta):
        model = UserPaymentInformation
        fields = [
            'id', 'payment', 'user_id', 'date', 'payment_before'
        ]


class ClubPaymentInformationSerializer(PaymentInformationSerializer):
    class Meta(PaymentInformationSerializer.Meta):
        model = ClubPaymentInformation
        fields = [
            'id', 'payment', 'club_id', 'date', 'payment_before'
        ]
