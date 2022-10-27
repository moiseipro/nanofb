from django.contrib import admin
from django.utils.safestring import mark_safe

from users.models import User, UserPersonal, UserPayment

from django.utils.translation import gettext_lazy as _


class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'personal', 'get_club_name', 'get_personal_country', 'p_version', 'is_active', 'is_staff')
    list_display_links = ('personal',)
    list_editable = ('is_active', 'is_staff')
    search_fields = ('id', 'date_joined')
    filter_horizontal = ('groups', 'user_permissions')

    def get_club_name(self, object):
        if object.club_id:
            return object.club_id.name

    def get_personal_country(self, object):
        return mark_safe(f'<img src="{object.personal.country_id.flag}" width="20">')

    get_club_name.short_description = _('Club')
    get_personal_country.short_description = _('Country')


admin.site.register(User, UserAdmin)
admin.site.register(UserPersonal)
admin.site.register(UserPayment)
