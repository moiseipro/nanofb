from django.db import models
from users.models import User
from references.models import UserTeam, ClubTeam


class AbstractPlayer(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    surname = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    patronymic = models.CharField(max_length=30, null=True, blank=True)

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


class PlayerCard(models.Model):
    player_user = models.ForeignKey(UserPlayer, on_delete=models.CASCADE, null=True, blank=True)
    player_club = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    citizenship = models.CharField(max_length=30, null=True, blank=True)
    club_from = models.CharField(max_length=30, null=True, blank=True)
    growth = models.IntegerField(null=True, blank=True)
    weight = models.IntegerField(null=True, blank=True)
    game_num = models.IntegerField(null=True, blank=True)
    birthsday = models.DateField(null=True, blank=True)
    ref_team_status = models.IntegerField(null=True, blank=True)
    ref_player_status = models.IntegerField(null=True, blank=True)
    ref_level = models.IntegerField(null=True, blank=True)
    ref_position = models.IntegerField(null=True, blank=True)
    ref_foot = models.IntegerField(null=True, blank=True)
    come = models.DateField(null=True, blank=True)
    leave = models.DateField(null=True, blank=True)
    contacts = models.JSONField(null=True, blank=True)
    notes = models.JSONField(null=True, blank=True)

    objects = models.Manager()


