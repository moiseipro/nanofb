from ast import keyword
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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class ClubFolder(AbstractFolder):
    # club = models.ForeignKey(Club, on_delete=models.CASCADE)
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

    title = models.JSONField(null=True, blank=True)
    ref_ball = models.IntegerField(null=True, blank=True)
    ref_goal = models.IntegerField(null=True, blank=True)
    ref_cognitive_load = models.IntegerField(null=True, blank=True)
    keyword = models.JSONField(null=True, blank=True)
    ref_age_category = models.IntegerField(null=True, blank=True)
    players_ages = models.JSONField(null=True, blank=True)
    players_amount = models.JSONField(null=True, blank=True)
    description = models.JSONField(null=True, blank=True)


    condition = models.JSONField(null=True, blank=True)
    stress_type = models.JSONField(null=True, blank=True)
    purpose = models.JSONField(null=True, blank=True)
    coaching = models.JSONField(null=True, blank=True)
    notes = models.JSONField(null=True, blank=True)

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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    folder = models.ForeignKey(UserFolder, on_delete=models.CASCADE)
    class Meta(AbstractExercise.Meta):
        abstract = False


class ClubExercise(AbstractExercise):
    # club = models.ForeignKey(Club, on_delete=models.CASCADE)
    folder = models.ForeignKey(ClubFolder, on_delete=models.CASCADE)
    class Meta(AbstractExercise.Meta):
        abstract = False

