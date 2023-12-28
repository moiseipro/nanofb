from statistics import mode
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p

from clubs.models import Club
from references.models import UserTeam, ClubTeam
from users.models import User
from video.models import Video


class EventVideoLink(models.Model):
    json_link = models.JSONField(null=True, blank=True) # ['link_1', 'link_2', 'link_3']
    video = models.ForeignKey(Video, on_delete=models.SET_NULL, null=True, blank=True) # many to many
    name = models.JSONField(null=True, blank=True)
    description = models.JSONField(null=True, blank=True)
    objects = models.Manager()
    
    class Meta:
        abstract = False


# Create your models here.
class AbstractEvent(models.Model):
    short_name = models.CharField(
        verbose_name=_('short name'),
        help_text=_("The short name of the event. The maximum length is 4 characters"),
        max_length=4,
        blank=True,
        null=True
    )
    notes = models.JSONField(
        verbose_name=_('notes'),
        help_text=_('Notes to the event.'),
        blank=True,
        null=True
    )
    date = models.DateTimeField(
        verbose_name=_('Date and time'),
        help_text=_('Date and time of this event'),
        blank=False,
        default=timezone.now
    )
    video_link = models.ForeignKey(EventVideoLink, on_delete=models.SET_NULL, null=True, blank=True)

    @classmethod
    def get_default_pk(cls):
        event, created = cls.objects.get_or_create(
            name=_('Event'))
        return event.pk

    class Meta:
        abstract = True
        ordering = ['-date']


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


class LiteEvent(AbstractEvent):
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    class Meta(AbstractEvent.Meta):
        pass


class AbstractMicrocycles(models.Model):
    name = models.CharField(
        verbose_name=_('M.C.'),
        help_text=_("Name of the microcycle. The maximum length is 80 characters"),
        max_length=80,
        default="",
        blank=True
    )
    short_key = models.CharField(
        verbose_name=_('Short key'),
        help_text=_("Microcycle short code"),
        max_length=20,
        default="",
        blank=True
    )
    date_with = models.DateField(
        verbose_name=_('start date'),
        help_text=_('Start date of the microcycle.'),
    )
    date_by = models.DateField(
        verbose_name=_('end date'),
        help_text=_('End date of the microcycle.'),
    )

    class Meta:
        ordering = ['-date_with']
        abstract = True


class UserMicrocycles(AbstractMicrocycles):
    team_id = models.ForeignKey(
        UserTeam,
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )

    class Meta(AbstractMicrocycles.Meta):
        pass


class ClubMicrocycles(AbstractMicrocycles):
    team_id = models.ForeignKey(
        ClubTeam,
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )

    class Meta(AbstractMicrocycles.Meta):
        pass


class LiteMicrocycles(AbstractMicrocycles):
    team_id = models.ForeignKey(
        UserTeam,
        on_delete=models.CASCADE,
        null=False,
        blank=False,
    )

    class Meta(AbstractMicrocycles.Meta):
        pass

