from django.contrib.auth.models import Permission, Group
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p


# Create your models here.

class CustomGroup(models.Model):
    def __str__(self):
        return "{}".format(self.group.name)

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

    def __str__(self):
        return self.group.name


class Section(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_('title'),
        help_text=_("Section name")
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


class Version(models.Model):
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
    objects = models.Manager()

    def __str__(self):
        return self.name
