from django import forms
from django.utils.translation import gettext_lazy as _
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Button

from users.models import User, UserPersonal

name_input_widget = forms.TextInput(attrs={
    'class': 'form-control-sm', 'autocomplete': 'off'
})

date_input_widget = forms.DateInput(attrs={
    'class': 'datetimepicker',
    'id': 'datetimepicker-event',
    'data-toggle': 'datetimepicker',
    'autocomplete': 'off'
})
phone_input_widget = forms.TextInput(attrs={
    'class': '',
    'id': 'phone',
    'autocomplete': 'off',
    'type': 'tel'
})


class ClubAddUserForm(forms.ModelForm):
    helper = FormHelper()
    helper.form_method = 'POST'

    date = forms.DateTimeField(
        input_formats=['%d/%m/%Y %H:%M'],
        widget=date_input_widget,
        label=_('Date')
    )

    class Meta:
        model = User
        fields = ['email',]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('email', css_class='form-group col-md-12 mb-0'),
                css_class='form-row'
            ),

        )


class ClubAddPersonalForm(forms.ModelForm):
    helper = FormHelper()
    helper.form_method = 'POST'

    date_birthsday = forms.DateField(
        input_formats=['%d/%m/%Y'],
        widget=date_input_widget,
        label=_('Birthday')
    )
    phone = forms.CharField(
        widget=phone_input_widget
    )

    class Meta:
        model = UserPersonal
        fields = ['first_name', 'last_name', 'father_name', 'job_title', 'country_id', 'region', 'city',
                  'date_birthsday', 'email_2', 'phone']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('first_name', css_class='form-group col-md-4 mb-0'),
                Column('last_name', css_class='form-group col-md-4 mb-0'),
                Column('father_name', css_class='form-group col-md-4 mb-0'),
                Column('job_title', css_class='form-group col-md-12 mb-0'),
                Column('country_id', css_class='form-group col-md-4 mb-0'),
                Column('region', css_class='form-group col-md-4 mb-0'),
                Column('city', css_class='form-group col-md-4 mb-0'),
                Column('date_birthsday', css_class='form-group col-md-4 mb-0'),
                Column('email_2', css_class='form-group col-md-4 mb-0'),
                Column('phone', css_class='form-group col-md-4 mb-0'),
                Column(css_id='event-link',
                    css_class='form-group col-md-12 mb-0'
                ),
                css_class='form-row'
            ),

        )