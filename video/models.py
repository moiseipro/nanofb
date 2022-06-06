from datetime import timedelta

from django.db import models
from django.utils.datetime_safe import datetime

from references.models import VideoSource
from version.models import Section


# Create your models here.
class Video(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Импортируемое название видео',
    )
    videosource_id = models.ForeignKey(
        VideoSource,
        on_delete=models.SET_DEFAULT,
        help_text='Источник, к которому привязано видео',
        default=VideoSource.get_default_pk
    )
    section_id = models.ForeignKey(
        Section,
        on_delete=models.SET_DEFAULT,
        help_text='Раздел, к которому привязано видео',
        default=Section.get_default_pk
    )
    upload_date = models.DateField(
        auto_now=True
    )
    duration = models.DurationField(
        help_text='Длительность видео в формате 00:00:00',
        null=False,
        default=timedelta(seconds=0),
    )
    links = models.JSONField(
        help_text='Ссылки на видео с разных источников'
    )
    shared_access = models.BooleanField(
        help_text='Доступно всем пользователям?',
        default=False
    )
    old_id = models.IntegerField(
        help_text='ID упражнения, к которому было привязано видео',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['videosource_id', 'section_id']
        permissions = (
            ("uploading_files", "Can upload files to videos"),
        )

