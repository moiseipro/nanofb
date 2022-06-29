from django.template import Library, Node, TemplateSyntaxError, Variable
from django.template.base import TokenType, render_value_in_context
from django.template.defaulttags import token_kwargs

from references.models import UserSeason

register = Library()


class GetAvailableSeasons(Node):
    def __init__(self, variable):
        self.variable = variable

    def render(self, context):
        context[self.variable] = [
            season.name for season in UserSeason
        ]
        return ""


@register.tag("get_available_seasons")
def do_get_available_seasons(parser, token):
    args = token.contents.split()
    if len(args) != 3 or args[1] != "as":
        raise TemplateSyntaxError(
            "'get_available_seasons' requires 'as variable' (got %r)" % args
        )
    return GetAvailableSeasons(args[2])