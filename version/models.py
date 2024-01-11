from django.contrib.auth.models import Permission, Group
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p
from decimal import Decimal


def get_default_name_json():
    return {"ru": "", "en": ""}


# Create your models here.
class Section(models.Model):
    name = models.CharField(help_text='Section name', max_length=255, verbose_name='title')
    translation_name = models.JSONField(
        verbose_name=_('Section name'),
        help_text=_("Section translated name"),
        default=get_default_name_json,
        null=True,
        blank=True
    )
    tag = models.CharField(
        max_length=100,
        verbose_name=_('tag'),
        help_text=_("Section tag")
    )
    objects = models.Manager()

    @classmethod
    def get_default_pk(cls):
        section, created = cls.objects.get_or_create(
            name='NF', tag=_('Default'))
        return section.pk

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('section')
        verbose_name_plural = _('sections')


class CustomGroup(models.Model):
    group = models.OneToOneField(
        Group,
        unique=True,
        on_delete=models.CASCADE
    )
    price = models.DecimalField(
        verbose_name=_('price'),
        help_text=_("The cost of the Group in the currency"),
        max_digits=8,
        decimal_places=2,
        default=0.00
    )
    translation_name = models.JSONField(
        verbose_name=_('Group name'),
        help_text=_("Group translated name"),
        default=get_default_name_json,
        null=True,
        blank=True
    )
    parent_group = models.IntegerField(
        default=-1,
        null=False,
        blank=False,
        verbose_name=_('Parent group'),
        help_text=_("If it is child access, select parent"),
    )
    is_admin = models.BooleanField(
        default=False,
        null=False,
        blank=False,
    )
    text_id = models.CharField(blank=True, max_length=25, null=True)
    order = models.IntegerField(
        default=0,
        null=False,
        blank=False,
    )

    def __str__(self):
        return self.group.name

    class Meta:
        verbose_name = _('Custom group params')
        ordering = ['order']


class Limitations(models.Model):
    team_limit = models.IntegerField(
        verbose_name=_('number of teams'),
        help_text=_("limit on the number of teams"),
        default=2
    )
    player_limit = models.IntegerField(
        verbose_name=_('number of players'),
        help_text=_("limit on the number of players in a team"),
        default=25
    )

    class Meta:
        abstract = True


class ClubLimitations(Limitations):
    user_limit = models.IntegerField(
        verbose_name=_('number of users'),
        help_text=_("limit on the number of users"),
        default=50
    )

    class Meta(Limitations.Meta):
        abstract = True


class FederationLimitations(models.Model):
    club_limit = models.IntegerField(
        verbose_name=_('number of clubs'),
        help_text=_("limit on the number of clubs"),
        default=10
    )

    class Meta:
        abstract = True


class Version(Limitations):
    name = models.CharField(
        max_length=255,
        verbose_name=_('title'),
        help_text=_("Version name")
    )
    updated_date = models.DateField(
        verbose_name=_('last update'),
        help_text=_("Version update date"),
        auto_now=True
    )
    is_active = models.BooleanField(
        verbose_name=_('active'),
        help_text=_('The version is active for user selection'),
        default=False
    )
    groups = models.ManyToManyField(
        Group,
        verbose_name=_("groups"),
        blank=True,
        help_text=_(
            "The groups this version belongs to. A version will get all permissions "
            "granted to each of their groups."
        ),
    )
    permissions = models.ManyToManyField(
        Permission,
        verbose_name=_("permissions"),
        blank=True,
        help_text=_("Specific permissions for this version."),
    )
    tag = models.CharField(
        max_length=100,
        verbose_name=_('tag'),
        help_text=_("Version tag")
    )
    price = models.DecimalField(
        verbose_name=_('price'),
        help_text=_("The cost of the version in the currency"),
        max_digits=8,
        decimal_places=2,
        default=0.00
    )
    # limits = models.ForeignKey(
    #     Limitations,
    #     verbose_name=_('limits'),
    #     help_text=_("User limits"),
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True
    # )
    objects = models.Manager()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('version')
        verbose_name_plural = _('versions')


class SectionInformation(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_('Note on section'),
        help_text=_("A note on the section indicates the location"),
        null=True,
        blank=True
    )
    content = models.TextField(
        verbose_name=_('Content'),
        help_text=_('Information for the user'),
        null=True,
        blank=True
    )
    last_update = models.DateField(
        verbose_name=_('Last update'),
        help_text=_('Date of last update'),
        auto_now=True
    )
