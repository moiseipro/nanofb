from django import forms
from video.models import Video

text_widget = forms.TextInput(attrs={
    'class': 'form-control form-control-sm',
})

file_widget = forms.FileInput(attrs={
    'class': 'form-control form-control-sm',
})


class CreateVideoForm(forms.ModelForm):
    youtube_link = forms.CharField(
        required=False,
        widget=text_widget,
        label="Ссылка на видео с youtube",
        help_text=None
    )
    file = forms.FileField(
        required=False,
        widget=file_widget,
        label="Файл видео для загрузки на сервер",
        help_text=None
    )

    class Meta:
        model = Video
        exclude = ['links', 'upload_date']
        widgets = {
            'name': text_widget,
        }
        labels = {
            'name': None,
        }
        help_texts = {
            'name': None,
        }
