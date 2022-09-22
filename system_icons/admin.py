from django.contrib import admin
from system_icons.models import IconsList, UIElement


class WithIconsList(admin.ModelAdmin):
    list_display = ('id', 'name', 'color', 'icon_preview', 'icon_color_preview', )
    search_fields = ('name',)
    readonly_fields = ('id', 'icon_preview', 'icon_color_preview', )

    def icon_preview(self, obj):
        return obj.icon_preview
    icon_preview.short_description = 'Icon Preview'
    icon_preview.allow_tags = True


class WithUIElement(admin.ModelAdmin):
    list_display = ('id', 'category', 'name', 'text_id', 'icon', )
    search_fields = ('category', 'name', )
    readonly_fields = ('id', )


admin.site.register(IconsList, WithIconsList)
admin.site.register(UIElement, WithUIElement)
