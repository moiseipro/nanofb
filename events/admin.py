from django.contrib import admin
from events.models import UserMicrocycles, UserEvent

# Register your models here.


# Test
admin.site.register([UserMicrocycles, UserEvent])
