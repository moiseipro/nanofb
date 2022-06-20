from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from django import forms
from django.utils.translation import gettext_lazy as _
from video.models import Video

from pytube import extract

time_widgets = forms.TimeInput(attrs={
    'class': 'datetimepicker'
})


class CreateVideoForm(forms.ModelForm):
    helper = FormHelper()
    helper.add_input(Submit('submit', _('Save'), css_class='w-100 btn btn-lg btn-primary mt-3'))
    helper.form_method = 'POST'

    youtube_link = forms.CharField(
        required=False,
        label="Ссылка на видео с youtube",
        help_text=None
    )
    file = forms.FileField(
        required=False,
        label="Файл видео для загрузки на сервер",
        help_text=None
    )

    class Meta:
        model = Video
        fields = ['name', 'videosource_id', 'section_id', 'duration', 'shared_access']
        labels = {
            'name': 'Название видео',
            'videosource_id': 'Выберите источник',
            'section_id': 'Выберите раздел',
            'duration': 'Длительность видео',
            'shared_access': 'Отображать пользователям',
        }
        help_texts = {
            'name': None,
        }
        widgets = {
            'duration': time_widgets
        }


class UpdateVideoForm(forms.ModelForm):
    helper = FormHelper()
    helper.add_input(Submit('submit', _('Save'), css_class='w-100 btn btn-lg btn-success mt-3'))

    youtube_link = forms.CharField(
        required=False,
        label="Ссылка на видео с youtube",
        help_text=None
    )

    class Meta(CreateVideoForm.Meta):
        pass
