from django import forms
from video.models import Video

time_widgets = forms.TimeInput(attrs={
    'class': 'datetimepicker'
})


class CreateVideoForm(forms.ModelForm):
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
        exclude = ['links', 'upload_date']
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
        widgets ={
            'duration': time_widgets
        }
