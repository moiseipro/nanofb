from django.contrib import admin

from exercises.models import UserExercise
from trainings.models import UserTraining, UserTrainingExercise


# Register your models here.

# For Test
admin.site.register([UserTraining, UserTrainingExercise])