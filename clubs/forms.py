from django import forms
from django.utils.translation import gettext_lazy as _
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Button
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget

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
    helper.form_id = "user-form"

    class Meta:
        model = User
        fields = ['email',]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper.layout = Layout(
            Row(
                Column('email', css_class='form-group col-md-12 mb-0'),
                css_class='form-row'
            ),

        )


class ClubAddPersonalForm(forms.ModelForm):
    helper = FormHelper()
    helper.form_method = 'POST'
    helper.form_id = "personal-form"

    last_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'autocomplete': 'off'
        })
    )
    first_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'autocomplete': 'off'
        })
    )
    father_name = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'autocomplete': 'off'
        })
    )
    date_birthsday = forms.DateField(
        required=True,
        widget=forms.DateInput(attrs={
            'class': 'form-control datetimepicker',
            'type': 'text',
            'id': 'datetimepicker-birth',
            'data-toggle': 'datetimepicker',
            'autocomplete': 'off',
        }))
    country_id = CountryField(blank_label=_("Select country")).formfield(
        required=True,
        label=_("Country"),
        widget=CountrySelectWidget(attrs={
            'class': 'form-control'
        })
    )
    city = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
        }))
    region = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
        }))
    phone = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'id': 'phone',
            'autocomplete': 'off',
            'type': 'tel'
        }))
    license = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'autocomplete': 'off',
        }))
    license_date = forms.DateField(
        required=True,
        widget=forms.DateInput(attrs={
            'class': 'form-control datetimepicker',
            'type': 'text',
            'id': 'datetimepicker-license',
            'data-toggle': 'datetimepicker',
            'autocomplete': 'off',
        }))

    class Meta:
        model = UserPersonal
        fields = ['first_name', 'last_name', 'father_name', 'job_title', 'country_id', 'region', 'city',
                  'date_birthsday', 'email_2', 'phone', 'license', 'license_date']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper.layout = Layout(
            Row(
                Column('first_name', css_class='form-group col-md-4 mb-0'),
                Column('last_name', css_class='form-group col-md-4 mb-0'),
                Column('father_name', css_class='form-group col-md-4 mb-0'),
                Column('job_title', css_class='form-group col-md-12 mb-0'),
                Column('license', css_class='form-group col-md-6 mb-0'),
                Column('license_date', css_class='form-group col-md-6 mb-0'),
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