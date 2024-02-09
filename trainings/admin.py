from django.contrib import admin

from exercises.models import UserExercise
from trainings.models import UserTraining, UserTrainingExercise, UserTrainingProtocol, ClubTraining, \
    ClubTrainingExercise, ClubTrainingProtocol, LiteTraining, LiteTrainingExercise, LiteTrainingExerciseAdditional, \
    ClubTrainingExerciseAdditional, UserTrainingExerciseAdditional, UserTrainingObjectives, ClubTrainingObjectives

# Register your models here.

# For Test
admin.site.register([UserTraining, UserTrainingExercise, UserTrainingProtocol, UserTrainingExerciseAdditional])
admin.site.register([ClubTraining, ClubTrainingExercise, ClubTrainingProtocol, ClubTrainingExerciseAdditional])
admin.site.register([LiteTraining, LiteTrainingExercise, LiteTrainingExerciseAdditional])
admin.site.register([UserTrainingObjectives, ClubTrainingObjectives])
