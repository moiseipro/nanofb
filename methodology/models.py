from django.db import models


class AbstractFolder(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Импортируемое название папки',
        null=True,
        blank=True
    )
    parent = models.IntegerField(
        help_text='Ид папки родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать папку пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )

    class Meta:
        abstract = True
        ordering = ['order']

