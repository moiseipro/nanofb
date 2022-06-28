from django.contrib import admin
from references.models import VideoSource, ExsBall, UserSeason

# Register your models here.
admin.site.register([VideoSource, ExsBall])

#For Test
admin.site.register([UserSeason])
