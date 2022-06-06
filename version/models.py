from django.contrib.auth.models import Permission
from django.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.


class Section(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_('Name'),
        help_text=_("Section name")
    )
    tag = models.CharField(
        max_length=100,
        verbose_name=_('Tag'),
        help_text=_("Section tag")
    )
    objects = models.Manager()

    @classmethod
    def get_default_pk(cls):
        section, created = cls.objects.get_or_create(
            name='NF', tag='Default')
        return section.pk

    def __str__(self):
        return self.name


class Version(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_('Name'),
        help_text=_("Version name")
    )
    updated_date = models.DateField(
        verbose_name=_('Last update'),
        help_text=_("Version update date"),
        auto_now=True
    )
    is_active = models.BooleanField(
        verbose_name=_('Active'),
        help_text=_('The version is active for user selection'),
        default=False
    )
    permissions = models.ManyToManyField(
        Permission,
        verbose_name=_("permissions"),
        blank=True,
    )
    tag = models.CharField(
        max_length=100,
        verbose_name=_('Tag'),
        help_text=_("Version tag")
    )
    price = models.DecimalField(
        verbose_name=_('Price'),
        help_text=_("The cost of the version in the currency"),
        max_digits=8,
        decimal_places=2,
        default=0.00
    )
    objects = models.Manager()

    def __str__(self):
        return self.name
