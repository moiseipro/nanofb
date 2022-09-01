from operator import mod
from django.db import models
from users.models import User
from references.models import UserTeam, ClubTeam


class AbstractPlayer(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    surname = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    patronymic = models.CharField(max_length=30, null=True, blank=True)
    citizenship = models.CharField(max_length=30)

    photo = models.ImageField(upload_to='players/img/uploads', null=True, blank=True)

    objects = models.Manager()
    class Meta():
        abstract = True
        ordering = ['surname', 'name', 'patronymic']
    def __str__(self):
        return f"[id: {self.id}] {self.surname} {self.name} {self.patronymic}"


class UserPlayer(AbstractPlayer):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(UserTeam, on_delete=models.CASCADE)
    class Meta(AbstractPlayer.Meta):
        abstract = False


class ClubPlayer(AbstractPlayer):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE)
    class Meta(AbstractPlayer.Meta):
        abstract = False

