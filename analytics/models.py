from django.db import models
from users.models import User
from clubs.models import Club
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason



class AbstractTableMarkers(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    table_default = models.TextField(default="", null=True, blank=True)
    table_blocks = models.TextField(default="", null=True, blank=True)
    table_teams_folders = models.TextField(default="", null=True, blank=True)
    objects = models.Manager()
    class Meta():
        abstract = True
    def __str__(self):
        return f"[id: {self.id}]"


class UserTableMarkers(AbstractTableMarkers):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(UserTeam, on_delete=models.CASCADE, null=True, blank=True)
    season = models.ForeignKey(UserSeason, on_delete=models.CASCADE, null=True, blank=True)
    season_type = models.IntegerField(null=True, blank=True)
    class Meta(AbstractTableMarkers.Meta):
        abstract = False


class ClubTableMarkers(AbstractTableMarkers):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE, null=True, blank=True)
    season = models.ForeignKey(ClubSeason, on_delete=models.CASCADE, null=True, blank=True)
    season_type = models.IntegerField(null=True, blank=True)
    class Meta(AbstractTableMarkers.Meta):
        abstract = False

