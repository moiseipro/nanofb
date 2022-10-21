from django.contrib import admin
from users.models import User, UserPersonal, UserPayment

from django.utils.translation import gettext_lazy as _


class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'personal', 'get_club_name', 'is_active', 'is_staff')
    list_display_links = ('personal',)
    list_editable = ('is_active', 'is_staff')
    search_fields = ('id', 'date_joined')

    def get_club_name(self, object):
        if object.club_id:
            return object.club_id.name

    get_club_name.short_description = _('Club')


admin.site.register(User, UserAdmin)
admin.site.register(UserPersonal)
admin.site.register(UserPayment)
