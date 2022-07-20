from datetime import date
from datetime import timedelta
from django.db import models
from django.utils.translation import gettext_lazy as _

from events.models import UserEvent, ClubEvent
from exercises.models import UserExercise, ClubExercise
from references.models import UserTeam, ClubTeam
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
    objectives = models.JSONField(
        verbose_name=_('purposes'),
        help_text=_('Objectives for training groups'),
        blank=True,
        null=True
    )

    class Meta:
        abstract = True


class UserTraining(models.Model):
    event_id = models.ForeignKey(
        UserEvent,
        on_delete=models.CASCADE
    )
    team_id = models.ForeignKey(
        UserTeam,
        on_delete=models.CASCADE
    )


class ClubTraining(models.Model):
    event_id = models.ForeignKey(
        ClubEvent,
        on_delete=models.CASCADE
    )
    team_id = models.ForeignKey(
        ClubTeam,
        on_delete=models.CASCADE
    )


class AbstractTrainingExercise(models.Model):

    class GroupType(models.IntegerChoices):
        Group_A = 1
        Group_B = 2
        Group_C = 3

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


class UserTrainingExercise(AbstractTrainingExercise):
    training_id = models.ForeignKey(
        UserTraining,
        on_delete=models.CASCADE
    )
    exercise_id = models.ForeignKey(
        UserExercise,
        on_delete=models.CASCADE
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