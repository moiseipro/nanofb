from rest_framework import serializers

from exercises.serializers import UserExerciseSerializer
from players.serializers import UserPlayerSerializer
from references.serializers import PlayerProtocolStatusSerializer, TrainingSpaceSerializer, \
    UserTeamsSerializer, ClubTeamsSerializer, TrainingAdditionalDataSerializer
from trainings.models import UserTraining, UserTrainingExercise, UserTrainingExerciseAdditional, UserTrainingProtocol, \
    ClubTrainingProtocol, ClubTrainingExercise, LiteTrainingExerciseAdditional, LiteTraining, LiteTrainingExercise, \
    ClubTrainingExerciseAdditional, UserTrainingObjectives, ClubTrainingObjectives, UserTrainingObjectiveMany, \
    ClubTrainingObjectiveMany

# Training
from users.serializers import UserSerializer


class TrainingObjectiveSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        fields = (
            'id', 'short_name', 'name'
        )


class UserTrainingObjectiveSerializer(TrainingObjectiveSerializer):
    class Meta(TrainingObjectiveSerializer.Meta):
        model = UserTrainingObjectives

    Meta.fields += ('team',)


class ClubTrainingObjectiveSerializer(TrainingObjectiveSerializer):
    class Meta(TrainingObjectiveSerializer.Meta):
        model = ClubTrainingObjectives

    Meta.fields += ('team',)


class UserTrainingObjectiveManySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserTrainingObjectiveMany
        fields = (
            'id', 'objective', 'training', 'type'
        )


class UserTrainingObjectiveManySerializerView(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    objective = UserTrainingObjectiveSerializer()

    class Meta:
        model = UserTrainingObjectiveMany
        fields = (
            'id', 'objective', 'type'
        )


class ClubTrainingObjectiveManySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClubTrainingObjectiveMany
        fields = (
            'id', 'objective', 'training', 'type'
        )


class ClubTrainingObjectiveManySerializerView(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    objective = ClubTrainingObjectiveSerializer()

    class Meta:
        model = ClubTrainingObjectiveMany
        fields = (
            'id', 'objective', 'type'
        )


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

    is_goalkeeper = serializers.BooleanField(
        source='player_id.card.is_goalkeeper',
        read_only=True
    )

    status_info = PlayerProtocolStatusSerializer(
        source='status',
        read_only=True
    )

    class Meta:
        fields = (
            'id', 'training_id', 'player_id', 'full_name', 'estimation', 'is_goalkeeper', 'status', 'status_info', 'training_exercise_check', 'position'
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
        model = ClubTrainingExerciseAdditional


class LiteTrainingExerciseAdditionalSerializer(TrainingExerciseAdditionalSerializer):
    class Meta(TrainingExerciseAdditionalSerializer.Meta):
        model = LiteTrainingExerciseAdditional


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
    scheme_1 = serializers.CharField(
        source="exercise_id.scheme_1",
        read_only=True
    )
    scheme_2 = serializers.CharField(
        source="exercise_id.scheme_2",
        read_only=True
    )
    scheme_img = serializers.ImageField(
        source="exercise_id.scheme_img",
        read_only=True
    )

    class Meta:
        fields = (
            'id', 'training_id', 'exercise_id', 'exercise_name', 'exercise_scheme', 'scheme_1', 'scheme_2', 'group',
            'duration', 'order', 'description', 'additional_json', 'scheme_img'
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


class LiteTrainingExerciseSerializer(TrainingExerciseSerializer):
    exercise_data = UserExerciseSerializer(
        source='exercise_id',
        read_only=True
    )
    additional = LiteTrainingExerciseAdditionalSerializer(
        read_only=True,
        source="litetrainingexerciseadditional_set",
        many=True
    )

    class Meta(TrainingExerciseSerializer.Meta):
        model = LiteTrainingExercise

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
    # additional = TrainingAdditionalDataSerializer(
    #     read_only=True
    # )
    trainer = UserSerializer(
        source='trainer_user_id',
        read_only=True
    )

    class Meta:
        fields = (
            'event_id', 'event_date', 'event_time', 'favourites', 'trainer', 'additional', 'notes', 'field_size',
            'load_type', 'video_href', 'inventory', 'players_json'
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
    objectives = UserTrainingObjectiveManySerializerView(
        read_only=True,
        source="usertrainingobjectivemany_set",
        many=True
    )

    class Meta(TrainingSerializer.Meta):
        model = UserTraining

    Meta.fields += ('exercises_info', 'protocol_info', 'team_info', 'objectives')


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
    objectives = ClubTrainingObjectiveManySerializerView(
        read_only=True,
        source="clubtrainingobjectivemany_set",
        many=True
    )

    class Meta(TrainingSerializer.Meta):
        model = UserTraining

    Meta.fields += ('exercises_info', 'protocol_info', 'team_info', 'objectives')


class LiteTrainingSerializer(TrainingSerializer):
    team_info = UserTeamsSerializer(
        read_only=True,
        source="team_id",
    )
    exercises_info = LiteTrainingExerciseSerializer(
        read_only=True,
        source="litetrainingexercise_set",
        many=True
    )

    class Meta(TrainingSerializer.Meta):
        model = LiteTraining

    Meta.fields += ('exercises_info', 'team_info', 'players_count', 'goalkeepers_count')