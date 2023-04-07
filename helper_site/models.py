from django.db import models
from users.models import User
from clubs.models import Club


class AbstractFolder(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Название папки',
        null=True,
        blank=True
    )
    translations_name = models.JSONField(null=True, blank=True)
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
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class UserFolder(AbstractFolder):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='helper_site_userfolder_user')
    objects = models.Manager()

    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class ClubFolder(AbstractFolder):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True, related_name='helper_site_clubfolder_club')
    objects = models.Manager()
    
    class Meta(AbstractFolder.Meta):
        abstract = False
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}] {self.short_name}. {self.name}"


class AbstractArticle(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    visible = models.BooleanField(
        help_text='Показывать статью пользователю или нет',
        default=True
    )
    completed = models.BooleanField(
        help_text='Статья завершена',
        default=False
    )
    drafted = models.BooleanField(
        help_text='Статья в черновике',
        default=False
    )
    title = models.JSONField(null=True, blank=True)
    content = models.JSONField(null=True, blank=True)
    objects = models.Manager()

    class Meta():
        abstract = True
        ordering = ['order']
    def __str__(self):
        return f"[id: {self.id}]"


class AdminArticle(AbstractArticle):
    folder = models.ForeignKey(AdminFolder, on_delete=models.CASCADE)

    class Meta(AbstractArticle.Meta):
        abstract = False


class UserArticle(AbstractArticle):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='helper_site_userarticle_user')
    folder = models.ForeignKey(UserFolder, on_delete=models.CASCADE)

    class Meta(AbstractArticle.Meta):
        abstract = False


class ClubArticle(AbstractArticle):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='helper_site_clubarticle_user')
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True, related_name='helper_site_clubarticle_club')
    folder = models.ForeignKey(ClubFolder, on_delete=models.CASCADE)

    class Meta(AbstractArticle.Meta):
        abstract = False


class UserArticleParam(models.Model):
    article_user = models.ForeignKey(UserArticle, on_delete=models.CASCADE, null=True, blank=True)
    article_club = models.ForeignKey(ClubArticle, on_delete=models.CASCADE, null=True, blank=True)
    article_nfb = models.ForeignKey(AdminArticle, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='helper_site_userarticleparam_user')
    favorite = models.BooleanField(default=False)

    objects = models.Manager()

