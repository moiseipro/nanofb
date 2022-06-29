from django.contrib import admin
from references.models import VideoSource
from references.models import ExsBall, ExsGoal, ExsWorkoutPart, ExsCognitiveLoad, ExsCategory
from references.models import ExsPurpose, ExsStressType, ExsCoaching
from references.models import VideoSource, UserSeason

# Register your models here.
admin.site.register([VideoSource])
admin.site.register([ExsBall, ExsGoal, ExsWorkoutPart, ExsCognitiveLoad, ExsCategory])
admin.site.register([ExsPurpose, ExsStressType, ExsCoaching])

#For Test
admin.site.register([UserSeason])
