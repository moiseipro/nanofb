from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from clubs.models import Club


# Register your models here.
class ClubAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'subdomain', 'date_registration', 'date_registration_to', 'block')
    list_display_links = ('name',)
    list_editable = ('block',)
    search_fields = ('id', 'name', 'date_registration')
    filter_horizontal = ('groups', 'permissions')


admin.site.register(Club, ClubAdmin)
