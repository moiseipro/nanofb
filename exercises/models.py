from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p
from users.models import User
from clubs.models import Club
from references.models import UserTeam, ClubTeam, CustomTag
from references.models import ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad, ExsStressType
from references.models import ExsFeatures, UserExsFeatures, ClubExsFeatures
from video.models import Video
from colorfield.fields import ColorField



def upload_location_scheme(instance, filename):
    user_id = "adm"
    try:
        user_id = instance.user.id
    except:
        pass
    filebase, extension = filename.rsplit('.', 1)
    f_name = f"{filebase}__usr_{user_id}"
    return f"exercises/img/uploads/{f_name}.{extension}"


class AbstractFolder(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Импортируемое название папки',
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
    active = models.BooleanField(
        help_text='Показывать папку любому пользователю на релизе, неактивные папки доступны администрации.',
        default=True
    )
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class UserFolder(AbstractFolder):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exercises_userfolder_user')
    team = models.ForeignKey(UserTeam, on_delete=models.CASCADE, null=True, blank=True, related_name='exercises_userfolder_team')
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class ClubFolder(AbstractFolder):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True, related_name='exercises_clubfolder_user')
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE, null=True, blank=True, related_name='exercises_clubfolder_team')
    objects = models.Manager()
    
    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class ExerciseTagCategory(CustomTag):
    is_nfb = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True)
    visible = models.BooleanField(default=True)
    color = ColorField(default='#000000')
    lowercase_name = None

    objects = models.Manager()
    class Meta(CustomTag.Meta):
        abstract = False


class ExerciseTag(CustomTag):
    is_nfb = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    visible = models.BooleanField(default=True)
    category = models.ForeignKey(ExerciseTagCategory, on_delete=models.SET_NULL, null=True, blank=True)

    objects = models.Manager()
    class Meta(CustomTag.Meta):
        abstract = False


class ExerciseFeature(models.Model):
    value = models.CharField(max_length=255, null=True, blank=True)
    ref = models.ForeignKey(ExsFeatures, on_delete=models.CASCADE, null=True, blank=True, related_name='ref_default')
    ref_user = models.ForeignKey(UserExsFeatures, on_delete=models.CASCADE, null=True, blank=True, related_name='ref_user')
    ref_club = models.ForeignKey(ClubExsFeatures, on_delete=models.CASCADE, null=True, blank=True, related_name='ref_club')

    objects = models.Manager()
    class Meta():
        abstract = False


class AdminExerciseAdditionalParams(models.Model):
    field = models.JSONField(null=True, blank=True)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    visible = models.BooleanField(
        help_text='Показывать параметр пользователю или нет',
        default=True
    )
    objects = models.Manager()
    class Meta():
        ordering = ['order']


class UserExerciseAdditionalParams(models.Model):
    param = models.ForeignKey(AdminExerciseAdditionalParams, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    visible = models.BooleanField(
        help_text='Показывать параметр пользователю или нет',
        default=True
    )
    class Meta():
        ordering = ['order']


class ClubExerciseAdditionalParams(models.Model):
    param = models.ForeignKey(AdminExerciseAdditionalParams, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    visible = models.BooleanField(
        help_text='Показывать параметр пользователю или нет',
        default=True
    )
    class Meta():
        ordering = ['order']


class AbstractExercise(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    date_editing = models.DateField(null=True, blank=True)
    date_editing_folder = models.DateField(null=True, blank=True)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    visible = models.BooleanField(
        help_text='Показывать упр-ие пользователю или нет',
        default=True
    )
    visible_demo = models.BooleanField(
        help_text='Показывать упр-ие пользователю или нет в демо-режиме версии',
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
    ref_goal = models.ForeignKey(ExsGoal, on_delete=models.SET_NULL, null=True, blank=True)
    ref_ball = models.ForeignKey(ExsBall, on_delete=models.SET_NULL, null=True, blank=True)
    ref_team_category = models.ForeignKey(ExsTeamCategory, on_delete=models.SET_NULL, null=True, blank=True)
    ref_age_category = models.ForeignKey(ExsAgeCategory, on_delete=models.SET_NULL, null=True, blank=True)
    ref_train_part = models.ForeignKey(ExsTrainPart, on_delete=models.SET_NULL, null=True, blank=True)
    ref_cognitive_load = models.ForeignKey(ExsCognitiveLoad, on_delete=models.SET_NULL, null=True, blank=True)
    ref_stress_type = models.ForeignKey(ExsStressType, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.JSONField(null=True, blank=True)
    description_trainer = models.JSONField(null=True, blank=True)
    field_players = models.JSONField(null=True, blank=True)
    field_goal = models.JSONField(null=True, blank=True)
    field_goalkeeper = models.JSONField(null=True, blank=True)
    field_age = models.JSONField(null=True, blank=True)
    field_task = models.JSONField(null=True, blank=True)
    scheme_data = models.JSONField(null=True, blank=True)
    scheme_1 = models.CharField(max_length=30, null=True, blank=True)
    scheme_2 = models.CharField(max_length=30, null=True, blank=True)
    scheme_img = models.ImageField(upload_to=upload_location_scheme, null=True, blank=True)
    video_data = models.JSONField(null=True, blank=True)
    animation_data = models.JSONField(null=True, blank=True) # {'data': {'custom': "<t>...</t>", default: ["id_1", "id_2"...]}}
    old_id = models.IntegerField(null=True, blank=True) # from old site
    clone_nfb_id = models.IntegerField(null=True, blank=True) # id of admin exs after copy
    clone_archive_id = models.IntegerField(null=True, blank=True)

    video_links = models.JSONField(null=True, blank=True) # [{'link': "", 'name': "", 'note': ""}, ...]

    opt_has_video = models.BooleanField(default=False)
    opt_has_animation = models.BooleanField(default=False)
    opt_has_description = models.BooleanField(default=False)
    opt_has_scheme = models.BooleanField(default=False)

    field_age_a = models.IntegerField(null=True, blank=True)
    field_age_b = models.IntegerField(null=True, blank=True)
    field_players_a = models.IntegerField(null=True, blank=True)
    field_players_b = models.IntegerField(null=True, blank=True)
    field_keyword_a = models.CharField(max_length=30, null=True, blank=True)
    field_keyword_b = models.CharField(max_length=30, null=True, blank=True)
    field_keywords = models.JSONField(null=True, blank=True)
    field_exs_category_a = models.CharField(max_length=30, null=True, blank=True)
    field_exs_category_b = models.CharField(max_length=30, null=True, blank=True)
    field_categories = models.JSONField(null=True, blank=True)
    field_types = models.JSONField(null=True, blank=True)
    field_physical_qualities = models.JSONField(null=True, blank=True)
    field_cognitive_loads = models.JSONField(null=True, blank=True)
    field_fields = models.JSONField(null=True, blank=True)

    tags = models.ManyToManyField(ExerciseTag)
    features = models.ManyToManyField(ExerciseFeature)
    objects = models.Manager()

    class Meta():
        abstract = True
        ordering = ['order']
        permissions = [
            ("view_category_u_big", _("View exercises with category <U>")),
            ("view_category_u_small", _("View exercises with category <u>")),
            ("view_category_u_PRO", _("View exercises with category <PRO>")),
        ]
    def __str__(self):
        return f"[id: {self.id}]"


class AdminExercise(AbstractExercise):
    folder = models.ForeignKey(AdminFolder, on_delete=models.CASCADE)
    videos = models.ManyToManyField(Video, through="ExerciseVideo", through_fields=("exercise_nfb", "video"))
    additional_params = models.ManyToManyField(AdminExerciseAdditionalParams, through="ExerciseAdditionalParamValue", through_fields=("exercise_nfb", "param_nfb"))
    class Meta(AbstractExercise.Meta):
        abstract = False


class UserExercise(AbstractExercise):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    folder = models.ForeignKey(UserFolder, on_delete=models.CASCADE)
    videos = models.ManyToManyField(Video, through="ExerciseVideo", through_fields=("exercise_user", "video"))
    additional_params = models.ManyToManyField(UserExerciseAdditionalParams, through="ExerciseAdditionalParamValue", through_fields=("exercise_user", "param_user"))
    class Meta(AbstractExercise.Meta):
        abstract = False


class ClubExercise(AbstractExercise):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE, null=True, blank=True)
    folder = models.ForeignKey(ClubFolder, on_delete=models.CASCADE)
    videos = models.ManyToManyField(Video, through="ExerciseVideo", through_fields=("exercise_club", "video"))
    additional_params = models.ManyToManyField(ClubExerciseAdditionalParams, through="ExerciseAdditionalParamValue", through_fields=("exercise_club", "param_club"))
    class Meta(AbstractExercise.Meta):
        abstract = False


class TrainerExercise(AbstractExercise):
    user_name = models.CharField(
        null=True,
        blank=True,
        max_length=50,
        verbose_name=_('Surname'),
        help_text=_('Last name')
    )
    user_birthdate = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Birthday'),
        help_text=_('Date of birth')
    )
    exs_ref = models.IntegerField(null=True, blank=True)
    exs_ref_nfb = models.IntegerField(null=True, blank=True)
    videos = models.ManyToManyField(Video, through="ExerciseVideo", through_fields=("exercise_trainer", "video"))
    class Meta(AbstractExercise.Meta):
        abstract = False


class ExerciseAdditionalParamValue(models.Model):
    param_nfb = models.ForeignKey(AdminExerciseAdditionalParams, on_delete=models.SET_NULL, null=True, blank=True)
    param_user = models.ForeignKey(UserExerciseAdditionalParams, on_delete=models.SET_NULL, null=True, blank=True)
    param_club = models.ForeignKey(ClubExerciseAdditionalParams, on_delete=models.SET_NULL, null=True, blank=True)
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    value = models.CharField(max_length=255, null=True, blank=True)


class ExerciseVideo(models.Model):
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_trainer = models.ForeignKey(TrainerExercise, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, null=True, blank=True, related_name="video")
    type = models.IntegerField(
        help_text='1-2 - видео, 3-4 - анимация',
        default=0,
        validators=[
            MaxValueValidator(4),
            MinValueValidator(1)
        ],
    )
    order = models.IntegerField(default=0)
    
    objects = models.Manager()


class UserExerciseParam(models.Model):
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_trainer = models.ForeignKey(TrainerExercise, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    watched = models.BooleanField(default=False)
    favorite = models.BooleanField(default=False)
    like = models.BooleanField(default=False)
    dislike = models.BooleanField(default=False)
    video_1_watched = models.BooleanField(default=False)
    video_2_watched = models.BooleanField(default=False)
    animation_1_watched = models.BooleanField(default=False)
    animation_2_watched = models.BooleanField(default=False)
    note_trainer = models.CharField(max_length=255, default="", null=True, blank=True)
    note_club_admin = models.CharField(max_length=255, default="", null=True, blank=True)
    note_status = models.IntegerField(
        help_text='0 - нет, 1 - красный, 2 - зелёный',
        default=0
    )

    objects = models.Manager()


class UserExerciseParamTeam(models.Model):
    exercise_user = models.ForeignKey(UserExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_club = models.ForeignKey(ClubExercise, on_delete=models.CASCADE, null=True, blank=True)
    exercise_nfb = models.ForeignKey(AdminExercise, on_delete=models.CASCADE, null=True, blank=True)
    team = models.ForeignKey(UserTeam, on_delete=models.SET_NULL, null=True)
    team_club = models.ForeignKey(ClubTeam, on_delete=models.SET_NULL, null=True)

    additional_data = models.JSONField(null=True, blank=True)

    keyword = models.JSONField(null=True, blank=True)
    stress_type = models.JSONField(null=True, blank=True)
    purpose = models.JSONField(null=True, blank=True)
    coaching = models.JSONField(null=True, blank=True)
    note = models.JSONField(null=True, blank=True)

    objects = models.Manager()
