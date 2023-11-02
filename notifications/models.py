from django.db import models
from users.models import User

from django.utils import timezone
from django.utils.translation import gettext_lazy as _


# Create your models here.
class Notification(models.Model):
    users = models.ManyToManyField(
        User,
        blank=True,
        verbose_name=_('users'),
        help_text=_('Users who will receive the notification'),
        through="NotificationUser",
        through_fields=('notification', 'user'),
    )
    date_update = models.DateTimeField(
        verbose_name=_('update date'),
        help_text=_('Notification last updated date'),
        blank=False,
        auto_now=True
    )
    title = models.CharField(
        max_length=255,
        verbose_name=_('notification subject'),
        help_text=_('Notification subject for users')
    )
    content = models.TextField(
        verbose_name=_('notification content'),
        help_text=_('Notification content for users'),
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-date_update']


class NotificationUser(models.Model):
    notification = models.ForeignKey(
        Notification,
        verbose_name=_('notification'),
        help_text=_('Notification that was sent'),
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        verbose_name=_('user'),
        help_text=_('User to whom it was sent'),
        on_delete=models.CASCADE
    )
    date_receiving = models.DateTimeField(
        verbose_name=_('date of receiving'),
        help_text=_('Date when the user will receive the notification'),
        blank=False,
        default=timezone.now
    )
    viewed = models.BooleanField(
        default=False
    )
    favorites = models.BooleanField(
        default=False
    )

    class Meta:
        ordering = ['-date_receiving', '-notification__date_update', 'viewed']