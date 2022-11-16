from django.contrib import admin
from events.models import UserMicrocycles, UserEvent, ClubMicrocycles, ClubEvent

# Register your models here.


# Test
admin.site.register([UserMicrocycles, UserEvent])
admin.site.register([ClubMicrocycles, ClubEvent])
