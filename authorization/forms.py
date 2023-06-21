from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Button
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django_countries.fields import CountryField
from django_countries.widgets import CountrySelectWidget
from django.utils.translation import gettext_lazy as _

from users.models import User, UserPersonal, TrainerLicense
from version.models import Version


text_widget = forms.TextInput(attrs={
    'class': 'form-control form-control-sm',
})
password_widget = forms.PasswordInput(attrs={
    'class': 'form-control form-control-sm'
})


class NewUserPersonalForm(forms.Form):
    helper = FormHelper()
    helper.form_method = 'POST'
    helper.form_id = "personal-form"

    last_name = forms.CharField(
        required=True,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Last name'),
            'autocomplete': 'off'
        })
    )
    first_name = forms.CharField(
        required=True,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('First name'),
            'autocomplete': 'off'
        })
    )
    father_name = forms.CharField(
        required=False,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Father name'),
            'autocomplete': 'off'
        })
    )
    date_birthsday = forms.DateField(
        required=True,
        label=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control form-control-sm datetimepicker',
            'type': 'text',
            'id': 'datetimepicker-birth',
            'data-toggle': 'datetimepicker',
            'autocomplete': 'off',
            'placeholder': _('Date of birth'),
        }))
    country_id = CountryField(blank_label=_("Select country")).formfield(
        required=True,
        label=False,
        widget=CountrySelectWidget(attrs={
            'class': 'form-control form-control-sm'
        })
    )
    city = forms.CharField(
        required=True,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('City')
        }))
    region = forms.CharField(
        required=True,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Region')
        }))
    phone = forms.CharField(
        required=True,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            'id': 'phone',
            'autocomplete': 'off',
            'type': 'tel'
        }))
    trainer_license = forms.ModelChoiceField(
        required=False,
        label=False,
        empty_label=_("No"),
        queryset=TrainerLicense.objects.all(),
        widget=forms.Select(attrs={
            'class': 'form-control form-control-sm'
        })
    )
    license = forms.CharField(
        required=False,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-md',
            'placeholder': _('License'),
            'autocomplete': 'off',
        }))
    license_date = forms.DateField(
        required=False,
        label=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control form-control-md datetimepicker',
            'type': 'text',
            'id': 'datetimepicker-license',
            'data-toggle': 'datetimepicker',
            'autocomplete': 'off',
            'placeholder': _('License to'),
        }))

    class Meta:
        model = UserPersonal
        fields = ["last_name", "first_name", "father_name", "date_birthsday", "country_id", "region", "city", "phone",
                  "trainer_license", "license", "license_date"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper.layout = Layout(
            Row(
                Column('last_name', css_class='form-group col-md-12 mb-0'),
                Column('first_name', css_class='form-group col-md-12 mb-0'),
                Column('father_name', css_class='form-group col-md-12 mb-0'),
                Column('country_id', css_class='form-group col-md-12 mb-0'),
                Column('region', css_class='form-group col-md-12 mb-0'),
                Column('city', css_class='form-group col-md-12 mb-0'),
                Column('date_birthsday', css_class='form-group col-md-6 mb-0'),
                Column('phone', css_class='form-group col-md-6 mb-0'),
                Column('trainer_license', css_class='form-group col-md-4 mb-0'),
                Column('license', css_class='form-group col-md-4 mb-0'),
                Column('license_date', css_class='form-group col-md-4 mb-0'),
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


class NewUserForm(UserCreationForm):
    helper = FormHelper()
    helper.form_method = 'POST'
    helper.form_id = "user-form"

    email = forms.EmailField(
        required=True,
        label=False,
        widget=forms.EmailInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Email'),
            'autocomplete': 'off'
        })
    )
    password = forms.CharField(
        required=True,
        label=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Password')
        }))
    password2 = forms.CharField(
        required=True,
        label=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': _('Password Confirmation')
        }))
    p_version = forms.ModelChoiceField(
        required=True,
        label=False,
        empty_label=_("Select the program version"),
        queryset=Version.objects.all(),
        widget=forms.Select(attrs={
            'class': 'form-control form-control-sm'
        }))
    distributor = forms.CharField(
        required=False,
        label=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control form-control-sm',
            #'placeholder': _('Distributor'),
            'autocomplete': 'off',
        }))

    class Meta:
        model = User
        fields = ["p_version", "email", "password", "personal", "distributor"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper.layout = Layout(
            Row(
                Column('p_version', css_class='form-group col-md-12 mb-0'),
                Column('email', css_class='form-group col-md-12 mb-0'),
                Column('password', css_class='form-group col-md-12 mb-0'),
                Column('password2', css_class='form-group col-md-12 mb-0'),
                Column('distributor', css_class='form-group col-md-12 mb-0'),
                css_class='form-row'
            ),

        )

    def save(self, commit=True):
        user = super(NewUserForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        user.permissions = {}
        if commit:
            user.save()
        return user


class NewLoginForm(AuthenticationForm):
    username = forms.EmailField(required=True, widget=text_widget)
    password = forms.CharField(required=True, widget=password_widget, label="Пароль")

