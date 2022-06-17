from django.db import models
from django.contrib.postgres.fields import ArrayField
from users.models import User


class AbstractFolder(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Импортируемое название источника',
        null=True,
        blank=True
    )
    parent = models.IntegerField(
        help_text='Ид папки родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать папку пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )

    class Meta:
        abstract = True
        ordering = ['order']


class AdminFolder(AbstractFolder):
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class UserFolder(AbstractFolder):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class ClubFolder(AbstractFolder):
    # club_id = models.ForeignKey(Club, on_delete=models.CASCADE)
    objects = models.Manager()
    
    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class Exercise(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    # club_id = models.ForeignKey(Club, on_delete=models.CASCADE)
    date_creation = models.DateField(auto_now_add=True)
    folder_user_id = models.ForeignKey(UserFolder, on_delete=models.CASCADE, blank=True, null=True)
    folder_club_id = models.ForeignKey(ClubFolder, on_delete=models.CASCADE, blank=True, null=True)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    visible = models.BooleanField(
        help_text='Показывать упр-ие пользователю или нет',
        default=True
    )
    completed = models.BooleanField(
        help_text='Упражнение завершено',
        default=False
    )
    completed_time = models.DateField(
        help_text='Когда упр-ие было завершено',
        blank=True, null=True
    )
    objects = models.Manager()

    class Meta():
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}]"


class ExerciseParams(models.Model):
    exercise_id = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    ref_exs_type = models.IntegerField(null=True, blank=True) # связать со справочником "Тип упражнения"
    ref_folders = models.IntegerField(null=True, blank=True) # связать со справочником "Папки"
    ref_age = models.IntegerField(null=True, blank=True) # связать со справочником "Возраст"
    ref_category = models.IntegerField(null=True, blank=True) # связать со справочником "Категория"
    ref_ball = models.IntegerField(null=True, blank=True) # связать со справочником "Мяч"
    ref_goal = models.IntegerField(null=True, blank=True) # связать со справочником "Ворота"
    ref_cognitive_load = models.IntegerField(null=True, blank=True) # связать со справочником "Когнитивная нагрузка"
    ref_infrastructure = models.IntegerField(null=True, blank=True) # связать со справочником "Инфраструктура"
    ref_stress = models.IntegerField(null=True, blank=True) # связать со справочником "Тип нагрузки"
    ref_focuses = models.IntegerField(null=True, blank=True) # связать со справочником "Задачи / Направленность"
    ref_workout_part = models.IntegerField(null=True, blank=True) # связать со справочником "Части тренировки"
    ref_players_format = models.IntegerField(null=True, blank=True) # связать со справочником "Формат (игроки)"
    players_amount = models.CharField( max_length=255, null=True, blank=True)
    play_zone = models.CharField( max_length=255, null=True, blank=True)
    neutral = models.CharField( max_length=255, null=True, blank=True)
    touches_amount = models.CharField( max_length=255, null=True, blank=True)
    pauses = models.CharField( max_length=255, null=True, blank=True)


class ExerciseVisual(models.Model):
    exercise_id = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    scheme_data = models.JSONField() # {'data': ["<svg>...</svg>", "<svg>...</svg>", "<svg>...</svg>", ...]}
    video_data = models.JSONField() # {'data': [{'id': ""}, {'youtubeID': ""},....]}
    animation_data = models.JSONField() # {'custom': "<t>...</t>", default: ["id_1", "id_2"...]}


class ExerciseTranslations(models.Model):
    exercise_id = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    language_code = models.CharField( max_length=6, default="en")
    title = models.CharField( max_length=255, null=True, blank=True)
    description = models.CharField( max_length=1024, null=True, blank=True) # "<t>....</t>"


