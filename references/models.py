from datetime import date
from email.policy import default

from django.db import models

from clubs.models import Club
from users.models import User

from django.utils.translation import gettext_lazy as _
from django.utils.translation import gettext as _g


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
        return self.name or 'No name'

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
    club_id = models.ForeignKey(
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
            name=_('NF'))
        return video.pk

    class Meta(AbstractReference.Meta):
        verbose_name = _('Video source')
        verbose_name_plural = _('Video sources')


class TeamStatus(AbstractReference):

    @classmethod
    def get_default_pk(cls):
        team_status, created = cls.objects.get_or_create(
            name=_('None'))
        return team_status.pk

    class Meta(AbstractReference.Meta):
        verbose_name = _('Team status')
        verbose_name_plural = _('Team statuses')


class AbstractTeam(AbstractReference):
    age_key = models.CharField(
        max_length=10,
        verbose_name=_('age key'),
        help_text=_('Age key no more than 10 characters'),
        default=_('Empty')
    )
    u_key = models.CharField(
        max_length=10,
        verbose_name=_('U key'),
        help_text=_('U key no more than 10 characters'),
        default=_('U')
    )
    ref_team_status = models.ForeignKey(
        TeamStatus,
        on_delete=models.SET_DEFAULT,
        verbose_name=_('team status'),
        help_text=_('Team status.'),
        default=TeamStatus.get_default_pk
    )

    class Meta:
        abstract = True


# User Reference
class UserTeam(AbstractTeam, MixUserReference):

    class Meta:
        ordering = ["name"]
        verbose_name = _('User Team')
        verbose_name_plural = _('User Teams')


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

    class Meta:
        verbose_name = _('User Season')
        verbose_name_plural = _('User Seasons')


# Club Reference
class ClubTeam(AbstractTeam, MixClubReference):
    users = models.ManyToManyField(
        User,
        blank=True,
        verbose_name=_('users'),
        help_text=_('Users who have access to the team'),
    )

    class Meta:
        ordering = ["name"]
        verbose_name = _('Club Team')
        verbose_name_plural = _('Club Teams')


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

    class Meta:
        verbose_name = _('Club Season')
        verbose_name_plural = _('Club Seasons')


# --Exercises--
class ExsGoal(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise goal')
        verbose_name_plural = _('Exercise goals')


class ExsBall(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise with a ball')
        verbose_name_plural = _('Exercise with a ball')


class ExsTeamCategory(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise team category')
        verbose_name_plural = _('Exercise team categories')


class ExsAgeCategory(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise age category')
        verbose_name_plural = _('Exercise age categories')


class ExsTrainPart(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise part of the training')
        verbose_name_plural = _('Exercise parts of the training')


class ExsCognitiveLoad(AbstractReference, MixTranslateReference):
    keycode = models.CharField(max_length=10, null=True, blank=True)

    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise cognitive load')
        verbose_name_plural = _('Exercise cognitive loads')
    
    def save(self, *args, **kwargs):
        if self.keycode is not None:
            self.keycode = self.keycode.lower().replace(' ', '')
        return super(ExsCognitiveLoad, self).save(*args, **kwargs)


class ExsKeyword(AbstractReference, MixTranslateReference):
    keycode = models.CharField(max_length=10, null=True, blank=True)

    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise keyword')
        verbose_name_plural = _('Exercise keywords')
    
    def save(self, *args, **kwargs):
        if self.keycode is not None:
            self.keycode = self.keycode.lower().replace(' ', '')
        return super(ExsKeyword, self).save(*args, **kwargs)


class ExsStressType(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise stress type')
        verbose_name_plural = _('Exercise stress types')


class ExsPurpose(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise purpose')
        verbose_name_plural = _('Exercise purposes')


class ExsCoaching(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise coaching')
        verbose_name_plural = _('Exercise coaching')


class ExsCategory(AbstractReference, MixTranslateReference):
    keycode = models.CharField(max_length=10, null=True, blank=True)

    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise category')
        verbose_name_plural = _('Exercise categories')
    
    def save(self, *args, **kwargs):
        if self.keycode is not None:
            self.keycode = self.keycode.lower().replace(' ', '')
        return super(ExsCategory, self).save(*args, **kwargs)


class ExsType(AbstractReference, MixTranslateReference):
    keycode = models.CharField(max_length=10, null=True, blank=True)

    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise types')
        verbose_name_plural = _('Exercise types')
    
    def save(self, *args, **kwargs):
        if self.keycode is not None:
            self.keycode = self.keycode.lower().replace(' ', '')
        return super(ExsType, self).save(*args, **kwargs)


class ExsPhysicalQualities(AbstractReference, MixTranslateReference):
    icon_id = models.CharField(max_length=255, null=True, blank=True)
    keycode = models.CharField(max_length=20, null=True, blank=True)

    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise physical qualities')
        verbose_name_plural = _('Exercise physical qualities')
    
    def save(self, *args, **kwargs):
        if self.keycode is not None:
            self.keycode = self.keycode.lower().replace(' ', '')
        return super(ExsPhysicalQualities, self).save(*args, **kwargs)


class ExsAdditionalData(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise additional data')
        verbose_name_plural = _('Exercise additional data')


class UserExsAdditionalData(ExsAdditionalData, MixUserReference):
    class Meta(ExsAdditionalData.Meta):
        verbose_name = _('User exercise additional data')
        verbose_name_plural = _('User exercise additional data')


class ClubExsAdditionalData(ExsAdditionalData, MixClubReference):
    class Meta(ExsAdditionalData.Meta):
        verbose_name = _('Club exercise additional data')
        verbose_name_plural = _('Club exercise additional data')


class ExsTitleName(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise title name')
        verbose_name_plural = _('Exercise title names')


class ExsDescriptionTemplate(AbstractReference, MixTranslateReference):
    description = models.JSONField(null=True, blank=True)
    
    class Meta(AbstractReference.Meta):
        verbose_name = _('Exercise description template')
        verbose_name_plural = _('Exercise description template')


# --Players--
class PlayerTeamStatus(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Player team status')
        verbose_name_plural = _('Player team statuses')


class PlayerPlayerStatus(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Player status')
        verbose_name_plural = _('Player statuses')


class PlayerLevel(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Player level')
        verbose_name_plural = _('Player levels')


class PlayerPosition(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Player position')
        verbose_name_plural = _('Player positions')


class PlayerFoot(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Player leg')
        verbose_name_plural = _('Player legs')


# --Players-- additional
class PlayerProtocolStatus(AbstractReference, MixTranslateReference):
    tags = models.JSONField(null=True, blank=True)

    class Meta(AbstractReference.Meta):
        verbose_name = _('Player protocol status')
        verbose_name_plural = _('Player protocol statuses')


# --Tags--
class CustomTag(AbstractReference):
    lowercase_name = models.CharField(
        max_length=255,
        verbose_name=_('lowercase title'),
        help_text=_('lowercase title'),
        unique=True,
        null=False
    )

    class Meta(AbstractReference.Meta):
        verbose_name = _('Custom tags')
        verbose_name_plural = _('Custom tags')
        abstract = True


# Trainings
class TrainingSpace(AbstractReference, MixTranslateReference):
    pass


class TrainingAdditionalData(AbstractReference, MixTranslateReference):
    class Meta(AbstractReference.Meta):
        verbose_name = _('Training additional data')
        verbose_name_plural = _('Training additional data')
