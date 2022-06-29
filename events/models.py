from datetime import date

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p

from clubs.models import Club
from references.models import UserTeam, ClubTeam
from users.models import User


# Create your models here.
class AbstractEvent(models.Model):
    name = models.CharField(
        verbose_name=_('name'),
        help_text=_("The name of the event. The maximum length is 80 characters"),
        max_length=80,
        blank=False,
    )
    short_name = models.CharField(
        verbose_name=_('short name'),
        help_text=_("The short name of the event. The maximum length is 10 characters"),
        max_length=10,
        blank=False,
    )
    notes = models.JSONField(
        verbose_name=_('notes'),
        help_text=_('Notes to the event.')
    )
    date = models.DateTimeField(
        verbose_name=_('date'),
        help_text=_('Date and time of this event'),
        blank=False,
        default=timezone.now
    )

    @classmethod
    def get_default_pk(cls):
        event, created = cls.objects.get_or_create(
            name=_('Event'))
        return event.pk

    class Meta:
        abstract = True
        ordering = ['date']


class UserEvent(AbstractEvent):
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    class Meta(AbstractEvent.Meta):
        pass


class ClubEvent(AbstractEvent):
    user_id = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    club_id = models.ForeignKey(
        Club,
        on_delete=models.CASCADE
    )

    class Meta(AbstractEvent.Meta):
        pass


class UserMicrocycles(models.Model):
    team_id = models.ForeignKey(
        UserTeam,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    name = models.CharField(
        verbose_name=_('title'),
        help_text=_("Name of the microcycle. The maximum length is 60 characters"),
        max_length=60,
        null=True,
        blank=True,
    )
    date_with = models.DateField(
        verbose_name=_('start date'),
        help_text=_('Start date of the microcycle.'),
    )
    date_by = models.DateField(
        verbose_name=_('end date'),
        help_text=_('End date of the microcycle.'),
    )
