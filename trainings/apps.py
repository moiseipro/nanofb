from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TrainingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'trainings'
    verbose_name = _("Trainings")
