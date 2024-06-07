from datetime import date
from datetime import timedelta
from django.db import models
from django.utils.translation import gettext_lazy as _

from clubs.models import Club
from events.models import UserEvent, ClubEvent, LiteEvent
from exercises.models import UserExercise, ClubExercise
from players.models import UserPlayer, ClubPlayer
from references.models import UserTeam, ClubTeam, ExsAdditionalData, PlayerProtocolStatus, TrainingSpace, \
    UserExsAdditionalData, ClubExsAdditionalData
from users.models import User


# Create your models here.
class AbstractTrainingReferences(models.Model):
    short_name = models.CharField(
        max_length=30,
        verbose_name=_('Age'),
        help_text=_('Age group of the objective'),
        null=True,
        blank=True,
    )
    name = models.CharField(
        max_length=255,
        verbose_name=_('Title'),
        help_text=_('Objective name'),
        null=True,
        blank=True,
    )
    archive = models.BooleanField(
        verbose_name=_('Archive'),
        help_text=_('Is it a archive'),
        default=False
    )

    class Meta:
        abstract = True


class AdminTrainingObjectives(AbstractTrainingReferences):
    variant = models.SmallIntegerField(
        verbose_name=_('Variant'),
        help_text=_('Variant'),
        default=0
    )


class UserTrainingObjectives(AbstractTrainingReferences):
    user = models.ForeignKey(
        User,
        verbose_name=_('User'),
        help_text=_('User'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    team = models.ForeignKey(
        UserTeam,
        verbose_name=_('Team'),
        help_text=_('Team'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class ClubTrainingObjectives(AbstractTrainingReferences):
    club = models.ForeignKey(
        Club,
        verbose_name=_('Club'),
        help_text=_('Club'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    team = models.ForeignKey(
        ClubTeam,
        verbose_name=_('Team'),
        help_text=_('Team'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class AdminTrainingBlocks(AbstractTrainingReferences):
    variant = models.SmallIntegerField(
        verbose_name=_('Variant'),
        help_text=_('Variant'),
        default=0
    )


class UserTrainingBlocks(AbstractTrainingReferences):
    user = models.ForeignKey(
        User,
        verbose_name=_('User'),
        help_text=_('User'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    team = models.ForeignKey(
        ClubTeam,
        verbose_name=_('Team'),
        help_text=_('Team'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class ClubTrainingBlocks(AbstractTrainingReferences):
    club = models.ForeignKey(
        Club,
        verbose_name=_('Club'),
        help_text=_('Club'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    team = models.ForeignKey(
        ClubTeam,
        verbose_name=_('Team'),
        help_text=_('Team'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class UserTrainingLoad(AbstractTrainingReferences):
    user = models.ForeignKey(
        User,
        verbose_name=_('User'),
        help_text=_('User'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class ClubTrainingLoad(AbstractTrainingReferences):
    club = models.ForeignKey(
        Club,
        verbose_name=_('Club'),
        help_text=_('Club'),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )


class AbstractTraining(models.Model):
    trainer_user_id = models.ForeignKey(
        User,
        verbose_name=_('trainer'),
        help_text=_('Coach tied to the training'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    favourites = models.SmallIntegerField(
        verbose_name=_('favourites'),
        help_text=_('Favorites training'),
        default=0
    )
    group = models.SmallIntegerField(
        verbose_name=_('Group'),
        help_text=_('Training group'),
        default=0
    )
    players_count = models.SmallIntegerField(
        verbose_name=_('Players count'),
        help_text=_('Players count'),
        default=0
    )
    goalkeepers_count = models.SmallIntegerField(
        verbose_name=_('Goalkeepers count'),
        help_text=_('Goalkeepers count'),
        default=0
    )
    is_personal = models.BooleanField(
        verbose_name=_('personal training'),
        help_text=_('Is it a personal training'),
        default=False
    )
    video_href = models.CharField(
        max_length=255,
        verbose_name=_('link to the video'),
        help_text=_('Link to the training video'),
        null=True,
        blank=True,
    )
    additional = models.JSONField(
        verbose_name=_('additional'),
        help_text=_('Additional training data'),
        blank=True,
        null=True
    )
    notes = models.JSONField(
        verbose_name=_('notes'),
        help_text=_('Notes for training groups'),
        blank=True,
        null=True
    )
    inventory = models.JSONField(
        verbose_name=_('inventory'),
        help_text=_('Inventory for training'),
        blank=True,
        null=True
    )
    players_json = models.JSONField(
        verbose_name=_('players'),
        help_text=_('Quick list of players'),
        blank=True,
        null=True
    )

    class Meta:
        abstract = True


class UserTraining(AbstractTraining):
    event_id = models.OneToOneField(
        UserEvent,
        on_delete=models.CASCADE,
        primary_key=True
    )
    team_id = models.ForeignKey(
        UserTeam,
        on_delete=models.CASCADE
    )
    load = models.ForeignKey(
        UserTrainingLoad,
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )
    objectives = models.ManyToManyField(
        UserTrainingObjectives,
        verbose_name=_('objective'),
        help_text=_('Objective in training'),
        blank=True,
        through="UserTrainingObjectiveMany",
        through_fields=('training', 'objective')
    )
    blocks = models.ManyToManyField(
        UserTrainingBlocks,
        verbose_name=_('Block'),
        help_text=_('Block in training'),
        blank=True,
        through="UserTrainingBlockMany",
        through_fields=('training', 'block')
    )
    exercises = models.ManyToManyField(
        UserExercise,
        through="UserTrainingExercise",
        through_fields=('training_id', 'exercise_id'),
    )
    protocol = models.ManyToManyField(
        UserPlayer,
        through="UserTrainingProtocol",
        through_fields=('training_id', 'player_id'),
    )
    class Meta:
        abstract = False
        permissions = [
            (
                "analytics_usertraining",
                _('Access to the section "Analytics" for UserTraining')
            ),
            (
                "individual_usertraining",
                _('Access to the individual training mark for the user')
            )
        ]


class ClubTraining(AbstractTraining):
    event_id = models.OneToOneField(
        ClubEvent,
        on_delete=models.CASCADE,
        primary_key=True
    )
    team_id = models.ForeignKey(
        ClubTeam,
        on_delete=models.CASCADE
    )
    load = models.ForeignKey(
        ClubTrainingLoad,
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )
    objectives = models.ManyToManyField(
        ClubTrainingObjectives,
        verbose_name=_('objective'),
        help_text=_('Objective in training'),
        through="ClubTrainingObjectiveMany",
        through_fields=('training', 'objective')
    )
    blocks = models.ManyToManyField(
        ClubTrainingBlocks,
        verbose_name=_('Block'),
        help_text=_('Block in training'),
        through="ClubTrainingBlockMany",
        through_fields=('training', 'block')
    )
    exercises = models.ManyToManyField(
        ClubExercise,
        through="ClubTrainingExercise",
        through_fields=('training_id', 'exercise_id')
    )
    protocol = models.ManyToManyField(
        ClubPlayer,
        through="ClubTrainingProtocol",
        through_fields=('training_id', 'player_id'),
    )
    class Meta:
        abstract = False
        permissions = [
            (
                "analytics_clubtraining",
                _('Access to the section "Analytics" for ClubTraining')
            ),
            (
                "individual_clubtraining",
                _('Access to the individual training mark for the club')
            )
        ]


class LiteTraining(AbstractTraining):
    event_id = models.OneToOneField(
        LiteEvent,
        on_delete=models.CASCADE,
        primary_key=True
    )
    team_id = models.ForeignKey(
        UserTeam,
        on_delete=models.CASCADE
    )
    exercises = models.ManyToManyField(
        UserExercise,
        through="LiteTrainingExercise",
        through_fields=('training_id', 'exercise_id'),
    )
    players_count = models.JSONField(
        verbose_name=_('players count'),
        help_text=_('Number of players manual entry'),
        blank=True,
        null=True
    )
    goalkeepers_count = models.JSONField(
        verbose_name=_('goalkeepers count'),
        help_text=_('Number of goalkeepers manual entry'),
        blank=True,
        null=True
    )

    class Meta(AbstractTraining.Meta):
        pass


class AbstractTrainingExercise(models.Model):

    class GroupType(models.IntegerChoices):
        Group_A = 1
        Group_B = 2
        Group_C = 3
        Group_D = 4

    group = models.PositiveSmallIntegerField(
        verbose_name=_('group'),
        help_text=_('The group to which the exercise belongs'),
        choices=GroupType.choices,
    )
    duration = models.PositiveSmallIntegerField(
        verbose_name=_('duration'),
        help_text=_('Duration of the exercise'),
        null=False,
        default=0,
    )
    description = models.TextField(
        verbose_name=_('description'),
        help_text=_('Description of the exercise inside the training'),
        null=True,
        blank=True
    )
    additional_json = models.JSONField(
        verbose_name=_('additional'),
        help_text=_('Additional training exercise data'),
        blank=True,
        null=True
    )
    order = models.IntegerField(
        verbose_name=_('order'),
        help_text=_('Sorting index'),
        default=0
    )

    class Meta:
        abstract = True
        ordering = ['group', 'order']


class UserTrainingExercise(AbstractTrainingExercise):
    training_id = models.ForeignKey(
        UserTraining,
        on_delete=models.CASCADE
    )
    exercise_id = models.ForeignKey(
        UserExercise,
        on_delete=models.CASCADE
    )
    additional = models.ManyToManyField(
        UserExsAdditionalData,
        through="UserTrainingExerciseAdditional",
        through_fields=('training_exercise_id', 'additional_id')
    )


class ClubTrainingExercise(AbstractTrainingExercise):
    training_id = models.ForeignKey(
        ClubTraining,
        on_delete=models.CASCADE
    )
    exercise_id = models.ForeignKey(
        ClubExercise,
        on_delete=models.CASCADE
    )
    additional = models.ManyToManyField(
        ClubExsAdditionalData,
        through="ClubTrainingExerciseAdditional",
        through_fields=('training_exercise_id', 'additional_id')
    )


class LiteTrainingExercise(AbstractTrainingExercise):
    training_id = models.ForeignKey(
        LiteTraining,
        on_delete=models.CASCADE
    )
    exercise_id = models.ForeignKey(
        UserExercise,
        on_delete=models.CASCADE
    )
    additional = models.ManyToManyField(
        UserExsAdditionalData,
        through="LiteTrainingExerciseAdditional",
        through_fields=('training_exercise_id', 'additional_id')
    )


class AbstractTrainingObjectiveMany(models.Model):
    type = models.SmallIntegerField(
        verbose_name=_('Objective type'),
        help_text=_('Type of objective for training'),
        blank=True,
        null=True
    )

    class Meta:
        abstract = True


class UserTrainingObjectiveMany(AbstractTrainingObjectiveMany):
    training = models.ForeignKey(
        UserTraining,
        on_delete=models.CASCADE
    )
    objective = models.ForeignKey(
        UserTrainingObjectives,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['type']


class ClubTrainingObjectiveMany(AbstractTrainingObjectiveMany):
    training = models.ForeignKey(
        ClubTraining,
        on_delete=models.CASCADE
    )
    objective = models.ForeignKey(
        ClubTrainingObjectives,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['type']


class AbstractTrainingBlockMany(models.Model):
    class Meta:
        abstract = True


class UserTrainingBlockMany(AbstractTrainingBlockMany):
    training = models.ForeignKey(
        UserTraining,
        on_delete=models.CASCADE
    )
    block = models.ForeignKey(
        UserTrainingBlocks,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['block__name']


class ClubTrainingBlockMany(AbstractTrainingBlockMany):
    training = models.ForeignKey(
        ClubTraining,
        on_delete=models.CASCADE
    )
    block = models.ForeignKey(
        ClubTrainingBlocks,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['block__name']


class AbstractTrainingExerciseAdditional(models.Model):
    note = models.CharField(
        max_length=255,
        verbose_name=_('note'),
        help_text=_('Note to the reference book'),
        blank=True,
        null=True
    )

    class Meta:
        abstract = True


class UserTrainingExerciseAdditional(AbstractTrainingExerciseAdditional):
    training_exercise_id = models.ForeignKey(
        UserTrainingExercise,
        on_delete=models.CASCADE
    )
    additional_id = models.ForeignKey(
        UserExsAdditionalData,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['additional_id__order']


class ClubTrainingExerciseAdditional(AbstractTrainingExerciseAdditional):
    training_exercise_id = models.ForeignKey(
        ClubTrainingExercise,
        on_delete=models.CASCADE
    )
    additional_id = models.ForeignKey(
        ClubExsAdditionalData,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['additional_id__order']


class LiteTrainingExerciseAdditional(AbstractTrainingExerciseAdditional):
    training_exercise_id = models.ForeignKey(
        LiteTrainingExercise,
        on_delete=models.CASCADE
    )
    additional_id = models.ForeignKey(
        UserExsAdditionalData,
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['additional_id__order']


# PROTOCOL
class AbstractTrainingProtocol(models.Model):
    class EstimationType(models.IntegerChoices):
        No = 0
        Like = 1
        Dislike = 2

    estimation = models.PositiveSmallIntegerField(
        verbose_name=_('estimation'),
        help_text=_('Player rating like/dislike'),
        choices=EstimationType.choices,
        default=0
    )
    status = models.ForeignKey(
        PlayerProtocolStatus,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        abstract = True


class UserTrainingProtocol(AbstractTrainingProtocol):
    training_id = models.ForeignKey(
        UserTraining,
        on_delete=models.CASCADE
    )
    player_id = models.ForeignKey(
        UserPlayer,
        on_delete=models.CASCADE
    )
    training_exercise_check = models.ManyToManyField(
        UserTrainingExercise,
        blank=True
    )

    class Meta:
        ordering = ['status__order', '-player_id__card__is_goalkeeper', 'player_id__card__ref_position__order']


class ClubTrainingProtocol(AbstractTrainingProtocol):
    training_id = models.ForeignKey(
        ClubTraining,
        on_delete=models.CASCADE
    )
    player_id = models.ForeignKey(
        ClubPlayer,
        on_delete=models.CASCADE
    )
    training_exercise_check = models.ManyToManyField(
        ClubTrainingExercise,
        blank=True
    )

    class Meta:
        ordering = ['status__order', '-player_id__card__is_goalkeeper', 'player_id__card__ref_position__order']
