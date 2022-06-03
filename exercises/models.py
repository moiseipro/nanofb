from django.db import models
from users.models import User


class AbstractFolder(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Импортируемое название источника',
        null=True,
        blank=True
    )
    parent = models.IntegerField(
        help_text='Ид папки родителя',
        null=True,
        blank=True
    )
    hide = models.BooleanField(
        help_text='Показывать папку пользователю или нет',
        default=False
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


class AdminFolder(AbstractFolder):
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class UserFolder(AbstractFolder):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['id', 'order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class ClubFolder(AbstractFolder):
    # club_id = models.ForeignKey(Club, on_delete=models.CASCADE)
    objects = models.Manager()
    
    class Meta(AbstractFolder.Meta):
        abstract = False
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"

