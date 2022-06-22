from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p

from clubs.models import Club
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
    )

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
