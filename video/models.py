from datetime import timedelta

from django.db import models
from django.utils.datetime_safe import datetime
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p
from taggit.managers import TaggableManager

from references.models import VideoSource
from version.models import Section


# Create your models here.
class VideoTags(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name=_('title'),
        help_text=_('Tag title'),
    )

    def __str__(self):
        return self.name


class Video(models.Model):
    name = models.CharField(
        max_length=255,
        verbose_name=_('title'),
        help_text=_('Imported video title'),
    )
    videosource_id = models.ForeignKey(
        VideoSource,
        on_delete=models.SET_DEFAULT,
        verbose_name=_('video source'),
        help_text=_('The source to which the video is linked'),
        default=VideoSource.get_default_pk
    )
    upload_date = models.DateField(
        verbose_name=_('upload date'),
        help_text=_('Date the video was uploaded or updated'),
        auto_now=True
    )
    created_date = models.DateField(
        verbose_name=_('created date'),
        help_text=_('Date the video was created'),
        auto_now_add=True
    )
    duration = models.DurationField(
        verbose_name=_('duration video'),
        help_text=_('The duration of the video in the format 00:00:00'),
        null=False,
        default=timedelta(seconds=0),
    )
    language = models.CharField(
        max_length=10,
        verbose_name=_('language (voice acting)'),
        help_text=_('Video voice-over language'),
        default='none'
    )
    music = models.BooleanField(
        verbose_name=_('music'),
        help_text=_('Is there music in the video?'),
        default=False
    )
    links = models.JSONField(
        verbose_name=_('video links'),
        help_text=_('Links to videos from various sources')
    )
    screensaver = models.CharField(
        max_length=255,
        verbose_name=_('screensaver'),
        help_text=_('Splash screen on the start screen of the video'),
        null=True,
        blank=True
    )
    old_id = models.IntegerField(
        verbose_name=_('old id'),
        help_text=_('ID of the exercise that the video was linked to'),
        null=True,
        blank=True
    )
    taggit = TaggableManager()

    def get_string_tags(self):
        return ', '.join(self.taggit.values_list('name', flat=True))

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['videosource_id']
        permissions = (
            ("uploading_files", "Can upload files to videos"),
            ("uploading_screensaver", "Can upload screensaver to videos"),
            ("parsing_video", "Can parse video"),
        )

