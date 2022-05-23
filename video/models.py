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
        help_text='ID источника'
    )
    section_id = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        help_text='ID раздела, к которому привязано видео',
        null=True
    )
    upload_date = models.DateField()
    duration = models.TimeField(
        help_text='Длительность видео',
        blank=True
    )
    links = models.JSONField(
        help_text='Ссылки на видео с разных источников'
    )
    shared_access = models.BooleanField(
        help_text='Есть ли доступ у всех пользователей',
        default=False
    )

    def __str__(self):
        return self.name

