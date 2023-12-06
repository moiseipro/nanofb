from django.contrib import admin
from events.models import UserMicrocycles, UserEvent, ClubMicrocycles, ClubEvent, LiteMicrocycles, LiteEvent

# Register your models here.
class MicrocycleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'team_id', 'date_with', 'date_by')
    search_fields = ('id', 'name')

# Test
admin.site.register(UserMicrocycles, MicrocycleAdmin)
admin.site.register(ClubMicrocycles, MicrocycleAdmin)
admin.site.register(LiteMicrocycles, MicrocycleAdmin)
admin.site.register(UserEvent)
admin.site.register(ClubEvent)
admin.site.register(LiteEvent)
