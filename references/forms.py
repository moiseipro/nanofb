from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from django import forms
from django.utils.translation import gettext_lazy as _

from references.models import UserTeam, UserSeason


date_with_input_widget = forms.DateInput(attrs={
    'class': 'form-control-sm',
    'id': 'datetimepicker-with-season',
    'data-toggle': 'datetimepicker',
    'data-target': '#datetimepicker-with-season',
    'autocomplete': 'off'
})
date_by_input_widget = forms.DateInput(attrs={
    'class': 'form-control-sm',
    'id': 'datetimepicker-by-season',
    'data-toggle': 'datetimepicker',
    'data-target': '#datetimepicker-by-season',
    'autocomplete': 'off'
})


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


class CreateSeasonForm(forms.ModelForm):
    helper = FormHelper()
    helper.add_input(Submit('submit', _('Save'), css_class='w-100 btn btn-lg btn-primary save mt-3'))
    helper.form_method = 'POST'

    class Meta:
        model = UserSeason
        fields = ['name', 'short_name', 'date_with', 'date_by']
        widgets = {
            'date_with': date_with_input_widget,
            'date_by': date_by_input_widget
        }
        labels = {
            'name': _('Season title'),
            'short_name': _('Season short name'),
            'date_with': _('Season start date'),
            'date_by': _('End of season date'),
        }
        help_texts = {
            'name': None,
        }