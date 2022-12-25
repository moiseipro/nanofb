from django.contrib import admin
from references.models import ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad, \
    PlayerProtocolStatus, ClubSeason, ClubTeam, TrainingSpace
from references.models import ExsKeyword, ExsStressType, ExsPurpose, ExsCoaching
from references.models import ExsCategory, ExsAdditionalData, ExsTitleName
from references.models import VideoSource, UserSeason, UserTeam
from references.models import PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot


# Register your models here.
class ClubTeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'short_name')
    list_display_links = ('name',)
    search_fields = ('id', 'name')
    filter_horizontal = ('users',)


admin.site.register([VideoSource])
admin.site.register([ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad])
admin.site.register([ExsKeyword, ExsStressType, ExsPurpose, ExsCoaching])
admin.site.register([ExsCategory, ExsAdditionalData, ExsTitleName])
admin.site.register([TrainingSpace])

admin.site.register([PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot, PlayerProtocolStatus])


#For Test
admin.site.register([UserSeason, UserTeam, ClubSeason])
admin.site.register(ClubTeam, ClubTeamAdmin)
