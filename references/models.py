from django.db import models
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