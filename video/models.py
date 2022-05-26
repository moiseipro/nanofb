from datetime import date

from django.db import models
from references.models import VideoSource
from version.models import Section


# Create your models here.
class Video(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Импортируемое название видео',
        null=True,
    )
    videosource_id = models.ForeignKey(
        VideoSource,
        on_delete=models.CASCADE,
        help_text='Источник, к которому привязано видео'
    )
    section_id = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        help_text='Раздел, к которому привязано видео',
        null=True
    )
    upload_date = models.DateField(
        auto_now=True
    )
    duration = models.DurationField(
        help_text='Длительность видео в формате 00:00:00',
        blank=True
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

