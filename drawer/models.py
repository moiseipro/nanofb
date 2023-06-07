from django.db import models
from users.models import User
from clubs.models import Club



class AbstractDraw(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Название рисунка (ID)',
        unique=True
    )
    elements = models.JSONField(null=True, blank=True)
    objects = models.Manager()

    class Meta():
        abstract = True
    def __str__(self):
        return f"[id: {self.id}] {self.name}"


class AdminDraw(AbstractDraw):
    class Meta(AbstractDraw.Meta):
        abstract = False


class UserDraw(AbstractDraw):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractDraw.Meta):
        abstract = False


class ClubDraw(AbstractDraw):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractDraw.Meta):
        abstract = False

