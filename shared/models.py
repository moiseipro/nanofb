from django.db import models
from django.utils import timezone
from users.models import User
from clubs.models import Club
from exercises.models import AdminExercise, UserExercise, ClubExercise
from trainings.models import UserTraining, ClubTraining, LiteTraining
from matches.models import UserMatch, ClubMatch, LiteMatch



class SharedLink(models.Model):
    link = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    options = models.JSONField(null=True, blank=True)
    expiration_date = models.DateTimeField(blank=False, default=timezone.now)
    language = models.CharField(max_length=10, default='en')
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    training_user = models.ForeignKey(UserTraining, on_delete=models.CASCADE, null=True, blank=True)
    training_club = models.ForeignKey(ClubTraining, on_delete=models.CASCADE, null=True, blank=True)
    training_lite = models.ForeignKey(LiteTraining, on_delete=models.CASCADE, null=True, blank=True)
    match_user = models.ForeignKey(UserMatch, on_delete=models.CASCADE, null=True, blank=True)
    match_club = models.ForeignKey(ClubMatch, on_delete=models.CASCADE, null=True, blank=True)
    match_lite = models.ForeignKey(LiteMatch, on_delete=models.CASCADE, null=True, blank=True)
    analytics = models.JSONField(null=True, blank=True)

    objects = models.Manager()
