from django.contrib import admin
from references.models import ExsBall, ExsGoal, ExsCognitiveLoad, ExsAgeCategory
from references.models import ExsAddition, ExsPurpose, ExsStressType, ExsCoaching
from references.models import VideoSource, UserSeason, UserTeam

# Register your models here.
admin.site.register([VideoSource])
admin.site.register([ExsBall, ExsGoal, ExsCognitiveLoad, ExsAgeCategory])
admin.site.register([ExsAddition, ExsPurpose, ExsStressType, ExsCoaching])

#For Test
admin.site.register([UserSeason, UserTeam])
