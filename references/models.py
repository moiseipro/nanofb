from django.db import models
from users.models import User


# Create your models here.
class AbstractReference(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Импортируемое название источника',
        null=True,
        blank=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
    )
    order = models.IntegerField(
        help_text='Индекс сортировки'
    )

    class Meta:
        abstract = True
        ordering = ['order']


class UserReference(AbstractReference):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta(AbstractReference.Meta):
        pass


class VideoSource(AbstractReference):
    link = models.TextField(
        help_text='Ссылка на источник',
        null=True,
        blank=True
    )
