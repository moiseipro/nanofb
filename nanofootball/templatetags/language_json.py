from django import template
from django.utils import translation

register = template.Library()


@register.simple_tag
def get_translation(json_translation):
    title_arr = json_translation
    title = title_arr[translation.get_language()]
    return title
