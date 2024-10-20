from datetime import date

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p

from django.contrib.auth.models import Permission, Group

from federations.models import Federation
from version.models import ClubLimitations


# Create your models here.
class Club(ClubLimitations):
    name = models.CharField(
        max_length=100,
        verbose_name=_('title'),
        help_text=_('Club title. Maximum length of 100 characters.'),
    )
    subdomain = models.CharField(
        max_length=10,
        verbose_name=_('subdomain'),
        help_text=_('The domain that will be displayed. The maximum length is 10 characters.'),
    )
    image = models.ImageField(
        upload_to='clubs_logo/',
        blank=True,
        verbose_name=_('logo'),
        help_text=_('Club logo'),
    )
    federation_id = models.ForeignKey(
        Federation,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        default=None,
        verbose_name=_('Federation'),
        help_text=_('The federation the club is a member of'),
    )
    groups = models.ManyToManyField(
        Group,
        verbose_name=_("groups"),
        blank=True,
        help_text=_(
            "The groups this club belongs to. A club will get all permissions "
            "granted to each of their groups."
        ),
    )
    permissions = models.ManyToManyField(
        Permission,
        verbose_name=_("permissions"),
        blank=True,
        help_text=_("Specific permissions for this club."),
    )
    date_registration = models.DateField(
        auto_now_add=True,
        verbose_name=_('date registration'),
        help_text=_('Date of registration of the club in the program.'),
    )
    date_registration_to = models.DateField(
        default=date.today,
        verbose_name=_('License termination'),
        help_text=_('License expiration date.'),
        null=False,
        blank=False,
    )
    block = models.BooleanField(
        default=False,
        verbose_name=_('block'),
        help_text=_('Is the club blocked?'),
        null=False,
        blank=False,
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Club card')
        verbose_name_plural = _('Club cards')
        permissions = [
            (
                "club_admin",
                _('Access to the club admin panel')
            )
        ]
