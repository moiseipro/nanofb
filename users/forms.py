from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Button
from django import forms
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget
from django.utils.translation import gettext_lazy as _

from authorization.forms import NewUserPersonalForm
from users.models import User, UserPersonal


class EditUserPersonalForm(NewUserPersonalForm):
    helper = FormHelper()
    helper.form_method = 'POST'
    helper.form_id = "edit-personal-form"

    job_title = forms.CharField(
        required=False,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Job title'),
            'autocomplete': 'off'
        })
    )
    phone = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'id': 'phone',
            'autocomplete': 'off',
            'type': 'tel'
        }))
    phone_2 = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'id': 'phone_2',
            'autocomplete': 'off',
            'type': 'tel'
        }))
    email_2 = forms.EmailField(
        required=False,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Spare Email'),
            'autocomplete': 'off'
        })
    )
    skype = forms.CharField(
        required=False,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': 'Skype',
            'autocomplete': 'off'
        })
    )

    class Meta:
        model = UserPersonal
        fields = ["last_name", "first_name", "father_name",
                  "date_birthsday", "country_id", "region",
                  "city", "phone", "license"
                  "job_title", "phone_2", "email_2", "skype"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper.layout = Layout(
            Row(
                Column('first_name', css_class='form-group col-md-12 mb-0'),
                Column('last_name', css_class='form-group col-md-12 mb-0'),
                Column('father_name', css_class='form-group col-md-12 mb-0'),
                Column('country_id', css_class='form-group col-md-4 mb-0'),
                Column('region', css_class='form-group col-md-4 mb-0'),
                Column('city', css_class='form-group col-md-4 mb-0'),
                Column('date_birthsday', css_class='form-group col-md-4 mb-0'),
                Column('phone', css_class='form-group col-md-4 mb-0'),
                Column('phone_2', css_class='form-group col-md-4 mb-0'),
                Column('license', css_class='form-group col-md-12 mb-0'),
                css_class='form-row'
            ),

        )

    def save(self, user=None, commit=True):
        personal = super(NewUserPersonalForm, self).save(commit=False)
        personal.user = user
        personal.permissions = {}
        if commit and user:
            personal.save()
        return personal
