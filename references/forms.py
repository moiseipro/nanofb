from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from django import forms
from django.utils.translation import gettext_lazy as _

from references.models import UserTeam


class CreateTeamForm(forms.ModelForm):
    helper = FormHelper()
    helper.add_input(Submit('submit', _('Save'), css_class='w-100 btn btn-lg btn-primary save mt-3'))
    helper.form_method = 'POST'

    class Meta:
        model = UserTeam
        fields = ['name', 'short_name', 'ref_team_status']
        labels = {
            'name': _('Team title'),
            'short_name': _('Team short name'),
            'ref_team_status': _('Team status'),
        }
        help_texts = {
            'name': None,
        }