from django.contrib import admin
from references.models import VideoSource
from references.models import ExsBall, ExsGoal, ExsWorkoutPart, ExsCognitiveLoad, ExsCategory
from references.models import ExsPurpose, ExsStressType, ExsCoaching

# Register your models here.
admin.site.register(VideoSource)

admin.site.register(ExsBall)
admin.site.register(ExsGoal)
admin.site.register(ExsWorkoutPart)
admin.site.register(ExsCognitiveLoad)
admin.site.register(ExsCategory)

admin.site.register(ExsPurpose)
admin.site.register(ExsStressType)
admin.site.register(ExsCoaching)

