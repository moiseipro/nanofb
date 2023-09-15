from django import forms
from django.utils.translation import gettext_lazy as _
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Button

from events.models import UserMicrocycles, UserEvent

name_input_widget = forms.TextInput(attrs={
    'class': 'form-control-sm',
    'autocomplete': 'off',
    'placeholder': _('M.C.')+" 1"
})
goal_input_widget = forms.TextInput(attrs={
    'class': 'form-control-sm',
    'autocomplete': 'off',
    'placeholder': _('M.C.')+" 2"
})
date_with_input_widget = forms.DateInput(attrs={
    'class': 'form-control-sm',
    'id': 'datetimepicker-with-microcycle',
    #'data-toggle': 'datetimepicker',
    #'data-target': '#datetimepicker-with-microcycle',
    'type': 'date',
    'autocomplete': 'off'
})
date_by_input_widget = forms.DateInput(attrs={
    'class': 'form-control-sm',
    'id': 'datetimepicker-by-microcycle',
    #'data-toggle': 'datetimepicker',
    #'data-target': '#datetimepicker-by-microcycle',
    'type': 'date',
    'autocomplete': 'off'
})
date_event_input_widget = forms.DateTimeInput(attrs={
    #'class': 'datepicker-event',
    'id': 'datetimepicker-event',
    #'data-toggle': 'datetimepicker',
    #'data-target': '#datetimepicker-event',
    'type': 'date',
    'autocomplete': 'off'
})
time_event_input_widget = forms.TimeInput(attrs={
    #'class': 'timepicker',
    'id': 'timepicker-event',
    #'data-toggle': 'datetimepicker',
    #'data-target': '#timepicker-event',
    'type': 'time',
    'autocomplete': 'off'
})

EVENT_TYPES =(
    ("", '---'),
    ("1", _('Training')),
    ("2", _('Unofficial match')),
    ("3", _('Official match')),

)


class MicrocycleUserForm(forms.ModelForm):
    class Meta:
        model = UserMicrocycles
        fields = ['name', 'goal', 'date_with', 'date_by']
        widgets = {
            'name': name_input_widget,
            'goal': goal_input_widget,
            'date_with': date_with_input_widget,
            'date_by': date_by_input_widget
        }
        help_texts = {
            'name': '',
            'goal': '',
            'date_with': '',
            'date_by': '',
        }
        labels = {
            'name': "",
            'goal': "",
            'date_with': _("Date with"),
            'date_by': _("Date by")
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column(
                    Row(
                        Column('name', css_class='form-div col-12 mb-0'),
                        Column('goal', css_class='form-div col-12 mb-0'),
                        ),
                    css_class='col-md-6'),
                Column('date_with', css_class='form-div col-md-2 mb-0'),
                Column('date_by', css_class='form-div col-md-2 mb-0'),
                Column(
                    Submit('submit', _('Save'), css_class='btn-sm btn-block btn-success save'),
                    Button('button', _('Cancel'), css_class='btn-sm btn-block btn-secondary cancel'),
                    css_class='form-div col-md-2 mb-0'
                ),
            ),

        )


class EventUserForm(forms.ModelForm):
    helper = FormHelper()
    helper.add_input(Submit('submit', _('Save'), css_class='w-100 btn btn-lg btn-primary save mt-3'))
    helper.form_method = 'POST'

    event_type = forms.ChoiceField(
        choices=EVENT_TYPES,
        label=_('Event type')
    )

    date = forms.DateTimeField(
        input_formats=['%d/%m/%Y %H:%M'],
        widget=date_event_input_widget,
        label=_('Date')
    )

    time = forms.TimeField(
        input_formats=['%H:%M'],
        widget=time_event_input_widget,
        label=_('Time')
    )

    class Meta:
        model = UserEvent
        fields = ['short_name', 'event_type', 'date', 'time']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('short_name', css_class='form-group col-md-6 mb-0'),
                Column('event_type', css_class='form-group col-md-6 mb-0'),
                Column('date', css_class='form-group col-md-6 mb-0'),
                Column('time', css_class='form-group col-md-6 mb-0'),
                Column(
                    Submit('submit', _('Save'), css_class='btn-block save'),
                    css_class='form-group col-md-12 mb-0'
                ),
                Column(css_id='event-link',
                    css_class='form-group col-md-12 mb-0'
                ),
                css_class='form-row'
            ),

        )


class EventEditUserForm(forms.ModelForm):
    helper = FormHelper()
    helper.add_input(Submit('submit', _('Save'), css_class='w-100 btn btn-lg btn-primary save mt-3'))
    helper.form_method = 'POST'

    date = forms.DateTimeField(
        input_formats=['%d/%m/%Y'],
        widget=date_event_input_widget
    )

    time = forms.TimeField(
        input_formats=['%H:%M'],
        widget=time_event_input_widget,
        label=_('Time')
    )

    class Meta:
        model = UserEvent
        fields = ['short_name', 'date', 'time']
        help_texts = {
            'short_name': None,
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('short_name', css_class='form-group col-md-4 mb-0'),
                Column('date', css_class='form-group col-md-4 mb-0'),
                Column('time', css_class='form-group col-md-4 mb-0'),
                Column(
                    Submit('submit', _('Save'), css_class='btn-block save'),
                    css_class='form-group col-md-12 mb-0'
                ),
                Column(css_id='event-edit-link',
                       css_class='form-group col-md-12 mb-0'),
                css_class='form-row'
            ),

        )