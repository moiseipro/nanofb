from django import template
import countryflag

register = template.Library()

LANGUAGES_CODES_REPLACES = {
    'en': 'us',
}


@register.filter
def flag_emoji(language_code):
    if not language_code:
        return ''
    if language_code in LANGUAGES_CODES_REPLACES:
        language_code = LANGUAGES_CODES_REPLACES[language_code]
    try:
        return countryflag.getflag(language_code)
    except Exception as e:
        return ''
