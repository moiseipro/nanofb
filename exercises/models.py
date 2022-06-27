from django.db import models
from django.core.validators import int_list_validator
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


class AbstractExercise(models.Model):
    date_creation = models.DateField(auto_now_add=True)
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

    ref_ball = models.IntegerField(null=True, blank=True) # models.ForeignKey(RefBall, on_delete=models.CASCADE)
    ref_goal = models.IntegerField(null=True, blank=True) # models.ForeignKey(RefGoal, on_delete=models.CASCADE)
    ref_players_format = models.IntegerField(null=True, blank=True) # models.ForeignKey(RefPlayersFormat, on_delete=models.CASCADE)
    ref_workout_part = models.IntegerField(null=True, blank=True) # models.ForeignKey(RefWorkoutPart, on_delete=models.CASCADE)
    ref_cognitive_load = models.IntegerField(null=True, blank=True) # models.ForeignKey(RefrefCognitiveLoad, on_delete=models.CASCADE)
    ref_category = models.IntegerField(null=True, blank=True) # models.ForeignKey(RefCategory, on_delete=models.CASCADE)
    age = models.CharField(max_length=10, null=True, blank=True, validators=[int_list_validator])
    players_amount = models.CharField(max_length=10, null=True, blank=True, validators=[int_list_validator])
    # пока нет справочников:
    # ref_physical_qualities = models.ManyToManyField(RefPhysicalQuality)
    # ref_physical_stress = models.ManyToManyField(RefPhysicalStress)
    # ref_focuses = models.ManyToManyField(RefFocus)
    # Ниже текстовая инфо-ия представляет собой json структуру, где для каждого текста свой перевод.

    play_zone = models.JSONField(null=True, blank=True)
    neutral = models.JSONField(null=True, blank=True)
    touches_amount = models.JSONField(null=True, blank=True)
    series = models.JSONField(null=True, blank=True)
    pauses = models.JSONField(null=True, blank=True)
    notes = models.JSONField(null=True, blank=True)
    title = models.JSONField(null=True, blank=True)
    description = models.JSONField(null=True, blank=True) # "{'ru':<t>....</t>,'en':<t>....</t>}"
    coaching = models.JSONField(null=True, blank=True)

    scheme_data = models.JSONField(null=True, blank=True) # {'data': ["<svg>...</svg>", "<svg>...</svg>", "<svg>...</svg>", ...]}
    video_data = models.JSONField(null=True, blank=True) # {'data': [{'id': ""}, {'youtubeID': ""},....]}
    animation_data = models.JSONField(null=True, blank=True) # {'custom': "<t>...</t>", default: ["id_1", "id_2"...]}

    objects = models.Manager()

    class Meta():
        abstract = True
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}]"


class AdminExercise(AbstractExercise):
    folder = models.ForeignKey(AdminFolder, on_delete=models.CASCADE)
    class Meta(AbstractExercise.Meta):
        abstract = False


class UserExercise(AbstractExercise):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    folder = models.ForeignKey(UserFolder, on_delete=models.CASCADE)
    class Meta(AbstractExercise.Meta):
        abstract = False


class ClubExercise(AbstractExercise):
    # club_id = models.ForeignKey(Club, on_delete=models.CASCADE)
    folder = models.ForeignKey(ClubFolder, on_delete=models.CASCADE)
    class Meta(AbstractExercise.Meta):
        abstract = False

