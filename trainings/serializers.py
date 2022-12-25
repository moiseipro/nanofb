from rest_framework import serializers

from exercises.serializers import UserExerciseSerializer
from players.serializers import UserPlayerSerializer
from references.serializers import PlayerProtocolStatusSerializer, TrainingSpaceSerializer, \
    UserTeamsSerializer, ClubTeamsSerializer
from trainings.models import UserTraining, UserTrainingExercise, UserTrainingExerciseAdditional, UserTrainingProtocol, \
    ClubTrainingProtocol, ClubTrainingExercise


# Training
from users.serializers import UserSerializer


class TrainingProtocolSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    full_name = serializers.CharField(
        source="player_id.get_part_name",
        read_only=True
    )

    position = serializers.CharField(
        source='player_id.card.ref_position.short_name',
        read_only=True
    )

    status_info = PlayerProtocolStatusSerializer(
        source='status',
        read_only=True
    )

    class Meta:
        fields = (
            'id', 'training_id', 'player_id', 'full_name', 'estimation', 'status', 'status_info', 'training_exercise_check', 'position'
        )


class UserTrainingProtocolSerializer(TrainingProtocolSerializer):
    def __init__(self, *args, **kwargs):
        many = kwargs.pop('many', True)
        super(UserTrainingProtocolSerializer, self).__init__(many=many, *args, **kwargs)

    player_info = UserPlayerSerializer(
        read_only=True,
        source='player_id'
    )

    class Meta(TrainingProtocolSerializer.Meta):
        model = UserTrainingProtocol

    Meta.fields += ('player_info',)


class ClubTrainingProtocolSerializer(TrainingProtocolSerializer):
    def __init__(self, *args, **kwargs):
        many = kwargs.pop('many', True)
        super(ClubTrainingProtocolSerializer, self).__init__(many=many, *args, **kwargs)

    player_info = UserPlayerSerializer(
        read_only=True,
        source='player_id'
    )

    class Meta(TrainingProtocolSerializer.Meta):
        model = ClubTrainingProtocol

    Meta.fields += ('player_info',)


class TrainingExerciseAdditionalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    additional_name = serializers.JSONField(
        source="additional_id.translation_names",
        read_only=True
    )

    class Meta:
        fields = (
            'id', 'additional_name', 'training_exercise_id', 'additional_id', 'note'
        )


class UserTrainingExerciseAdditionalSerializer(TrainingExerciseAdditionalSerializer):
    class Meta(TrainingExerciseAdditionalSerializer.Meta):
        model = UserTrainingExerciseAdditional


class ClubTrainingExerciseAdditionalSerializer(TrainingExerciseAdditionalSerializer):
    class Meta(TrainingExerciseAdditionalSerializer.Meta):
        model = UserTrainingExerciseAdditional


class TrainingExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    exercise_name = serializers.JSONField(
        source="exercise_id.title",
        read_only=True
    )
    exercise_scheme = serializers.JSONField(
        source="exercise_id.scheme_data",
        read_only=True
    )

    class Meta:
        fields = (
            'id', 'training_id', 'exercise_id', 'exercise_name', 'exercise_scheme', 'group', 'duration', 'order',
            'description'
        )


class UserTrainingExerciseSerializer(TrainingExerciseSerializer):
    exercise_data = UserExerciseSerializer(
        source='exercise_id',
        read_only=True
    )
    additional = UserTrainingExerciseAdditionalSerializer(
        read_only=True,
        source="usertrainingexerciseadditional_set",
        many=True
    )

    class Meta(TrainingExerciseSerializer.Meta):
        model = UserTrainingExercise

    Meta.fields += ('additional', 'exercise_data')


class ClubTrainingExerciseSerializer(TrainingExerciseSerializer):
    exercise_data = UserExerciseSerializer(
        source='exercise_id',
        read_only=True
    )
    additional = ClubTrainingExerciseAdditionalSerializer(
        read_only=True,
        source="clubtrainingexerciseadditional_set",
        many=True
    )

    class Meta(TrainingExerciseSerializer.Meta):
        model = ClubTrainingExercise

    Meta.fields += ('additional', 'exercise_data')


class TrainingSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(read_only=True)
    event_date = serializers.DateTimeField(
        format='%d/%m/%Y',
        source='event_id.date',
        read_only=True
    )
    event_time = serializers.DateTimeField(
        format='%H:%M',
        source='event_id.date',
        read_only=True
    )
    space_info = TrainingSpaceSerializer(
        source='space',
        read_only=True
    )
    trainer = UserSerializer(
        source='trainer_user_id',
        read_only=True
    )

    class Meta:
        fields = (
            'event_id', 'event_date', 'event_time', 'favourites', 'trainer', 'space', 'space_info', 'objectives'
        )
        datatables_always_serialize = ('event_id',)


class UserTrainingSerializer(TrainingSerializer):
    team_info = UserTeamsSerializer(
        read_only=True,
        source="team_id",
    )
    exercises_info = UserTrainingExerciseSerializer(
        read_only=True,
        source="usertrainingexercise_set",
        many=True
    )
    protocol_info = UserTrainingProtocolSerializer(
        read_only=True,
        source="usertrainingprotocol_set",
        many=True
    )

    class Meta(TrainingSerializer.Meta):
        model = UserTraining

    Meta.fields += ('exercises_info', 'protocol_info', 'team_info')


class ClubTrainingSerializer(TrainingSerializer):
    team_info = ClubTeamsSerializer(
        read_only=True,
        source="team_id",
    )
    exercises_info = ClubTrainingExerciseSerializer(
        read_only=True,
        source="clubtrainingexercise_set",
        many=True
    )
    protocol_info = ClubTrainingProtocolSerializer(
        read_only=True,
        source="clubtrainingprotocol_set",
        many=True
    )

    class Meta(TrainingSerializer.Meta):
        model = UserTraining

    Meta.fields += ('exercises_info', 'protocol_info', 'team_info')