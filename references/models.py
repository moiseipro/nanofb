from datetime import date

from django.db import models

from clubs.models import Club
from users.models import User

from django.utils.translation import gettext_lazy as _


# Create your models here.
class AbstractReference(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_('title'),
        help_text=_('Imported source name'),
        null=True,
        blank=True
    )
    short_name = models.CharField(
        max_length=10,
        verbose_name=_('short name'),
        help_text=_('Short name no more than 10 characters'),
        default=_('Empty')
    )
    order = models.IntegerField(
        verbose_name=_('order'),
        help_text=_('Sorting index'),
        default=0
    )

    def __str__(self):
        return self.name

    class Meta:
        abstract = True
        ordering = ['order']


class MixUserReference(models.Model):
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    class Meta:
        abstract = True


class MixClubReference(models.Model):
    user_id = models.ForeignKey(
        Club,
        on_delete=models.CASCADE
    )

    class Meta:
        abstract = True


class MixTranslateReference(models.Model):
    translation_names = models.JSONField(
        verbose_name=_('translated title'),
        help_text=_('Translations of reference books'),
        null=True,
        blank=True
    )

    class Meta:
        abstract = True


# Admin Reference
class VideoSource(AbstractReference):
    link = models.TextField(
        verbose_name=_('link'),
        help_text=_('Link to the source'),
        null=True,
        blank=True
    )

    @classmethod
    def get_default_pk(cls):
        video, created = cls.objects.get_or_create(
            name=_('NFTV'))
        return video.pk

    class Meta(AbstractReference.Meta):
        pass


class TeamStatus(AbstractReference):

    @classmethod
    def get_default_pk(cls):
        team_status, created = cls.objects.get_or_create(
            name=_('None'))
        return team_status.pk

    class Meta(AbstractReference.Meta):
        pass


# User Reference
class UserTeam(AbstractReference, MixUserReference):
    ref_team_status = models.ForeignKey(
        TeamStatus,
        on_delete=models.SET_DEFAULT,
        verbose_name=_('team status'),
        help_text=_('Team status.'),
        default=TeamStatus.get_default_pk
    )


class UserSeason(AbstractReference, MixUserReference):
    date_with = models.DateField(
        verbose_name=_('start date'),
        help_text=_('Start date of the season.'),
        default=date(date.today().year, 1, 1)
    )
    date_by = models.DateField(
        verbose_name=_('end date'),
        help_text=_('End date of the season.'),
        default=date(date.today().year, 12, 31)
    )


# Club Reference
class ClubTeam(AbstractReference, MixClubReference):
    ref_team_status = models.ForeignKey(
        TeamStatus,
        on_delete=models.SET_DEFAULT,
        verbose_name=_('team status'),
        help_text=_('Team status.'),
        default=TeamStatus.get_default_pk
    )


class ClubSeason(AbstractReference, MixClubReference):
    date_with = models.DateField(
        verbose_name=_('start date'),
        help_text=_('Start date of the season.'),
        default=date(date.today().year, 1, 1)
    )
    date_by = models.DateField(
        verbose_name=_('end date'),
        help_text=_('End date of the season.'),
        default=date(date.today().year, 12, 31)
    )


class ExsBall(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass


class ExsGoal(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass


class ExsCognitiveLoad(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass


class ExsAgeCategory(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass



class ExsAddition(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass


class ExsPurpose(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass


class ExsStressType(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass


class ExsCoaching(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        pass


