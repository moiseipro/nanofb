from django import template
from django.template.base import TokenType, render_value_in_context
from django.template.defaulttags import token_kwargs

from references.models import UserSeason

register = template.Library()


@register.simple_tag(name="get_available_seasons")
def do_get_available_seasons(user):
    return UserSeason.objects.filter(user_id=user)
