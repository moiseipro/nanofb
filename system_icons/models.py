from unicodedata import category
from wsgiref.validate import validator
from django.db import models
from django.utils.html import mark_safe
from django.core.exceptions import ValidationError
from colorfield.fields import ColorField



def validate_image(image):
    file_size = image.file.size
    limit_mb = 1
    if file_size > limit_mb * 1024 * 1024:
       raise ValidationError(f"Max size of file is {limit_mb} MB")



class IconsList(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Название иконки',
        null=True,
        blank=True
    )
    color = ColorField(default='#000000')
    icon = models.ImageField(upload_to='system_icons/icons', null=True, blank=True, validators=[validate_image])

    @property
    def icon_preview(self):
        if self.icon:
            return mark_safe(f'<img src="{self.icon.url}" width="24" height="24" />')
        return ""
    def icon_color_preview(self, title=""):
        if self.icon:
            mask_str = f"-webkit-mask:url({self.icon.url}) center/contain; mask:url({self.icon.url}) center/contain;"
            return mark_safe(f'<div class="" style="width:24px; height:24px; display:inline-block; background:{self.color}; {mask_str}" title="{title}"></div>')
        return ""
    icon_color_preview.short_description = "Icon With Color Preview"

    class Meta():
        ordering = ['id']
    def __str__(self):
        return f"[id: {self.id}] {self.name}"


class UIElement(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Название UI элемента',
        null=True,
        blank=True
    )
    text_id = models.CharField(
        max_length=255,
        help_text='Текст.ID для идентификации элемента на сайте',
        null=True,
        blank=True
    )
    hint = models.JSONField(
        help_text='JSON Obj. format: {"en": "hint", "ru": "подсказка"}',
        null=True,
        blank=True
    )
    icon = models.ForeignKey(IconsList, on_delete=models.SET_NULL, null=True)
    category = models.CharField(
        max_length=255,
        help_text='категория UI элемента, для упрощенного поиска.',
        null=True,
        blank=True
    )
    
    class Meta():
        ordering = ['id']


