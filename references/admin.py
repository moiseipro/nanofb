from django.contrib import admin
from references.models import ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad
from references.models import ExsKeyword, ExsStressType, ExsPurpose, ExsCoaching
from references.models import VideoSource, UserSeason, UserTeam

# Register your models here.
admin.site.register([VideoSource])
admin.site.register([ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad])
admin.site.register([ExsKeyword, ExsStressType, ExsPurpose, ExsCoaching])

#For Test
admin.site.register([UserSeason, UserTeam])
