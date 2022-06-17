from django.contrib import admin
from exercises.models import AdminFolder, UserFolder, ClubFolder, Exercise


admin.site.register(AdminFolder)
admin.site.register(UserFolder)
admin.site.register(ClubFolder)

admin.site.register(Exercise)
