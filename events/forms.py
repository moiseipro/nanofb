from django import forms
from django.utils.translation import gettext_lazy as _
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Button

from events.models import UserMicrocycles

name_input_widget = forms.TextInput(attrs={
    'class': 'form-control-sm', 'autocomplete': 'off'
})
date_with_input_widget = forms.DateInput(attrs={
    'class': 'form-control-sm',
    'id': 'datetimepicker-with-microcycle',
    'data-toggle': 'datetimepicker',
    'data-target': '#datetimepicker-with-microcycle',
    'autocomplete': 'off'
})
date_by_input_widget = forms.DateInput(attrs={
    'class': 'form-control-sm',
    'id': 'datetimepicker-by-microcycle',
    'data-toggle': 'datetimepicker',
    'data-target': '#datetimepicker-by-microcycle',
    'autocomplete': 'off'
})


class MicrocycleUserForm(forms.ModelForm):
    class Meta:
        model = UserMicrocycles
        fields = ['name', 'date_with', 'date_by']
        widgets = {
            'name': name_input_widget,
            'date_with': date_with_input_widget,
            'date_by': date_by_input_widget
        }
        help_texts = {
            'name': '',
            'date_with': '',
            'date_by': '',
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('name', css_class='form-group col-md-3 mb-0'),
                Column('date_with', css_class='form-group col-md-3 mb-0'),
                Column('date_by', css_class='form-group col-md-3 mb-0'),
                Column(
                    Submit('submit', _('Save'), css_class='btn-sm btn-block save'),
                    Button('button', _('Cancel'), css_class='btn-sm btn-block btn-secondary cancel'),
                    css_class='form-group col-md-3 mb-0'
                ),
                css_class='form-row'
            ),

        )