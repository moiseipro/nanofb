from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class FederationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'federations'
    verbose_name = _('Federations')
