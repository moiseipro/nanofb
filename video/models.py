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
        on_delete=models.CASCADE,
        help_text='ID раздела, к которому привязано видео',
        null=True
    )
    upload_date = models.DateField()
    duration = models.TimeField()
    links = models.JSONField()

