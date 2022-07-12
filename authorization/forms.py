from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from users.models import User, UserPersonal
from version.models import Version


text_widget = forms.TextInput(attrs={
    'class': 'form-control form-control-sm',
})
password_widget = forms.PasswordInput(attrs={
    'class': 'form-control form-control-sm'
})


class NewUserForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=text_widget, label="Почтовый ящик")
    password1 = forms.CharField(required=True, widget=password_widget, label="Пароль")
    password2 = forms.CharField(required=True, widget=password_widget, label="Подтверждение пароля")
    p_version = forms.ModelChoiceField(required=True, queryset=Version.objects.all(), label="Версия программы", empty_label="Выберите версию программы")
    class Meta:
        model = User
        fields = ["p_version", "email"]
    def save(self, commit=True):
        user = super(NewUserForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        user.permissions = {}
        if commit:
            user.save()
        return user


class NewUserPersonalForm(forms.ModelForm):
    last_name = forms.CharField(required=True, widget=text_widget, label="Фамилия")
    first_name = forms.CharField(required=True, widget=text_widget, label="Имя")
    date_birthsday = forms.DateField(required=False, 
        widget=forms.DateInput(attrs={
            'class': 'form-control form-control-sm',
            'type': 'date'
        }),
        label="Дата рождения")
    city = forms.CharField(required=False, widget=text_widget, label="Город")
    phone = forms.CharField(required=False, widget=text_widget, label="Телефон")
    class Meta:
        model = UserPersonal
        fields = ["last_name", "first_name", "city", "date_birthsday", "phone"]
    def save(self, user=None, commit=True):
        personal = super(NewUserPersonalForm, self).save(commit=False)
        personal.user = user
        personal.permissions = {}
        if commit and user:
            personal.save()
        return personal


class NewLoginForm(AuthenticationForm):
    username = forms.EmailField(required = True, widget=text_widget)
    password = forms.CharField(required=True, widget=password_widget, label="Пароль")

