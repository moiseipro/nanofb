from datetime import date
from datetime import timedelta
from django.db import models
from django.utils.translation import gettext_lazy as _

from events.models import UserEvent, ClubEvent
from exercises.models import UserExercise, ClubExercise
from players.models import UserPlayer
from references.models import UserTeam, ClubTeam, ExsAdditionalData, PlayerProtocolStatus
from users.models import User


# Create your models here.
class AbstractTraining(models.Model):
    trainer_user_id = models.ForeignKey(
        User,
        verbose_name=_('trainer'),
        help_text=_('Coach tied to the training'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    favourites = models.BooleanField(
        verbose_name=_('favourites'),
        help_text=_('Favorites training'),
        default=False
    )
    objectives = models.JSONField(
        verbose_name=_('purposes'),
        help_text=_('Objectives for training groups'),
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
    exercises = models.ManyToManyField(
        ClubExercise,
        through="ClubTrainingExercise",
        through_fields=('training_id', 'exercise_id')
    )


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
        ExsAdditionalData,
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
        ExsAdditionalData,
        through="ClubTrainingExerciseAdditional",
        through_fields=('training_exercise_id', 'additional_id')
    )


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
        ExsAdditionalData,
        on_delete=models.CASCADE,
    )


class ClubTrainingExerciseAdditional(AbstractTrainingExerciseAdditional):
    training_exercise_id = models.ForeignKey(
        ClubTrainingExercise,
        on_delete=models.CASCADE
    )
    additional_id = models.ForeignKey(
        ExsAdditionalData,
        on_delete=models.CASCADE,
    )


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
        ordering = ['status__order', 'player_id__card__ref_position__order']