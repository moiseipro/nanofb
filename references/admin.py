from django.contrib import admin
from references.models import ExsBall, ExsGoal, ExsWorkoutPart, ExsCognitiveLoad, ExsAgeCategory, ExsSource
from references.models import VideoSource, UserSeason, UserTeam

# Register your models here.
admin.site.register([VideoSource])
admin.site.register([ExsBall, ExsGoal, ExsWorkoutPart, ExsCognitiveLoad, ExsAgeCategory, ExsSource])

#For Test
admin.site.register([UserSeason, UserTeam])
