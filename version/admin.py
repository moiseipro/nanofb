from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group

from .models import Section, Version, CustomGroup
from django.utils.translation import gettext_lazy as _


# Register your models here.


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    pass


@admin.register(Version)
class VersionAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "updated_date")


class GroupInline(admin.StackedInline):
    model = CustomGroup
    can_delete = False
    verbose_name_plural = _('custom groups')


class GroupAdmin(BaseGroupAdmin):
    inlines = (GroupInline, )


# Re-register GroupAdmin
admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)