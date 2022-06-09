from decimal import Decimal

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

    def save_related(self, request, form, formsets, change):
        super(VersionAdmin, self).save_related(request, form, formsets, change)
        groups = form.instance.groups.all()
        new_price = Decimal("0.00")
        for group in groups:
            print(group)
            new_price += group.customgroup.price
        form.instance.price = new_price
        form.instance.save()




class GroupInline(admin.StackedInline):
    model = CustomGroup
    can_delete = False
    verbose_name_plural = _('custom groups')


class GroupAdmin(BaseGroupAdmin):
    inlines = (GroupInline, )


# Re-register GroupAdmin
admin.site.unregister(Group)
admin.site.register(Group, GroupAdmin)