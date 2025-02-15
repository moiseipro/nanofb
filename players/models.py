from statistics import mode
from django.db import models, transaction, connections
from django.db.models import QuerySet
from django.db.models.signals import pre_save, post_save, post_delete
from django.forms.models import model_to_dict
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p
from django.utils import timezone
from django.core.exceptions import ValidationError
from users.models import User
from clubs.models import Club
from references.models import UserTeam, ClubTeam
from references.models import PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot


def file_size(value):
    limit = 25 * 1024 * 1024
    if value.size > limit:
        raise ValidationError('File too large. Size should not exceed 25 MiB.')


class PlayerManager(models.Manager):
    def fake_data_receiving(self, data):
        data = data if isinstance(data, list) else [data]
        if self.db != 'default':
            return False
        separate_db = None
        try:
            f_elem = data[0].first() if isinstance(data[0], QuerySet) else data[0]
            current_club = Club.objects.filter(pk=f_elem.user.club_id.id).first()
            separate_db = current_club.separate_database
        except Exception as e:
            pass
        fake_data = []
        if separate_db and separate_db != "":
            for elem in data:
                f_elem = elem.first() if isinstance(elem, QuerySet) else elem
                try:
                    fake_data.append(
                        PlayerCard.objects.using(separate_db).filter(pk=f_elem.card.id).first()
                    )
                except Exception as e:
                    pass
        return fake_data

    def get(self, *args, **kwargs):
        instance = super().get(*args, **kwargs)
        self.fake_data_receiving(instance)
        return instance
    
    def filter(self, *args, **kwargs):
        instances = super().filter(*args, **kwargs)
        self.fake_data_receiving(instances)
        return instances


class PlayerRecord(models.Model):
    date = models.DateTimeField(blank=False, default=timezone.now)
    record = models.CharField(max_length=512, null=True, blank=True)
    class Meta:
        ordering = ['date']


class PlayerCard(models.Model):
    surname = models.CharField(max_length=30, default="")
    name = models.CharField(max_length=30, default="")
    patronymic = models.CharField(max_length=30, null=True, blank=True)
    citizenship = models.CharField(max_length=30, null=True, blank=True)
    club_from = models.CharField(max_length=30, null=True, blank=True)
    growth = models.IntegerField(null=True, blank=True)
    weight = models.IntegerField(null=True, blank=True)
    game_num = models.IntegerField(null=True, blank=True)
    birthsday = models.DateField(null=True, blank=True)
    ref_team_status = models.ForeignKey(PlayerTeamStatus, on_delete=models.CASCADE, null=True, blank=True)
    ref_player_status = models.ForeignKey(PlayerPlayerStatus, on_delete=models.CASCADE, null=True, blank=True)
    ref_level = models.ForeignKey(PlayerLevel, on_delete=models.CASCADE, null=True, blank=True)
    ref_position = models.ForeignKey(PlayerPosition, on_delete=models.CASCADE, null=True, blank=True)
    ref_foot = models.ForeignKey(PlayerFoot, on_delete=models.CASCADE, null=True, blank=True)
    come = models.DateField(null=True, blank=True)
    leave = models.DateField(null=True, blank=True)
    contacts = models.JSONField(null=True, blank=True)
    notes = models.JSONField(null=True, blank=True)
    contract_with = models.DateField(null=True, blank=True)
    contract_by = models.DateField(null=True, blank=True)
    email = models.CharField(max_length=30, null=True, blank=True)
    phone = models.CharField(max_length=30, null=True, blank=True)
    phone_2 = models.CharField(max_length=30, null=True, blank=True)
    records = models.ManyToManyField(PlayerRecord)
    is_goalkeeper = models.BooleanField(default=False)
    is_captain = models.BooleanField(default=False)
    is_vice_captain = models.BooleanField(default=False)
    field_labels = models.JSONField(null=True, blank=True)

    objects = models.Manager()

    def save(self, *args, **kwargs):
        self.current_user = kwargs.pop('current_user', None)
        super().save(*args, **kwargs)


@receiver(post_save, sender=PlayerCard)
def sync_to_secondary_db(sender, instance, created, **kwargs):
    separate_db = None
    current_user = getattr(instance, 'current_user', None)
    try:
        current_club = Club.objects.filter(pk=current_user.club_id.id).first()
        separate_db = current_club.separate_database
    except Exception as e:
        pass
    if instance._state.db != 'default':
        return
    if separate_db and separate_db != "":
        with transaction.atomic(using=separate_db):
            instance_data = model_to_dict(instance)
            del instance_data['records']
            del instance_data['ref_team_status']
            del instance_data['ref_player_status']
            PlayerCard.objects.using(separate_db).update_or_create(
                pk=instance.pk,
                defaults=instance_data
            )
@receiver(post_delete, sender=PlayerCard)
def delete_from_secondary_db(sender, instance, **kwargs):
    separate_db = None
    current_user = getattr(instance, 'current_user', None)
    try:
        current_club = Club.objects.filter(pk=current_user.club_id.id).first()
        separate_db = current_club.separate_database
    except Exception as e:
        pass
    if instance._state.db != 'default':
        return
    if separate_db and separate_db != "":
        with transaction.atomic(using=separate_db):
            PlayerCard.objects.using(separate_db).filter(pk=instance.pk).delete()


class AbstractPlayer(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    surname = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    patronymic = models.CharField(max_length=30, null=True, blank=True)
    is_archive = models.BooleanField(default=False)

    photo = models.ImageField(upload_to='players/img/uploads', null=True, blank=True)
    card = models.ForeignKey(PlayerCard, on_delete=models.CASCADE, null=True, blank=True)

    objects = PlayerManager()

    def get_full_name(self):
        return f"{self.card.surname} {self.card.name} {self.card.patronymic}"

    def get_part_name(self):
        return f"{self.card.surname} {self.card.name}"

    class Meta():
        abstract = True
        ordering = ['surname', 'name', 'patronymic']
        permissions = [
            ("view_parents", _("View section <Parents>")),
        ]

    def __str__(self):
        return f"[id: {self.id}] {self.card.surname} {self.card.name} {self.card.patronymic}"


class UserPlayer(AbstractPlayer):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(UserTeam, on_delete=models.CASCADE)
    class Meta(AbstractPlayer.Meta):
        abstract = False


class ClubPlayer(AbstractPlayer):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE)
    class Meta(AbstractPlayer.Meta):
        abstract = False


class CardSection(models.Model):
    title = models.JSONField(null=True, blank=True)
    text_id = models.CharField(max_length=20, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class CardSectionUser(models.Model):
    section = models.ForeignKey(CardSection, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(UserTeam, on_delete=models.CASCADE)


class CardSectionClub(models.Model):
    section = models.ForeignKey(CardSection, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(ClubTeam, on_delete=models.CASCADE)


class PlayersTableColumns(models.Model):
    title = models.JSONField(null=True, blank=True)
    text_id = models.CharField(max_length=50, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class PlayerCharacteristicsRows(models.Model):
    title = models.JSONField(null=True, blank=True)
    is_nfb = models.BooleanField(
        help_text='NFB шаблон для примера',
        default=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class PlayerCharacteristicUser(models.Model):
    characteristics = models.ForeignKey(PlayerCharacteristicsRows, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player = models.ForeignKey(UserPlayer, on_delete=models.CASCADE)
    date_creation = models.DateField(auto_now_add=True)
    value = models.IntegerField(default=0)
    notes = models.CharField(null=True, blank=True, max_length=255)


class PlayerCharacteristicClub(models.Model):
    characteristics = models.ForeignKey(PlayerCharacteristicsRows, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE)
    date_creation = models.DateField(auto_now_add=True)
    value = models.IntegerField(default=0)
    notes = models.CharField(null=True, blank=True, max_length=255)



class PlayerQuestionnairesRows(models.Model):
    title = models.JSONField(null=True, blank=True)
    is_nfb = models.BooleanField(
        help_text='NFB шаблон для примера',
        default=False
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    parent = models.IntegerField(
        help_text='Ид раздела родителя',
        null=True,
        blank=True
    )
    visible = models.BooleanField(
        help_text='Показывать раздел пользователю или нет',
        default=True
    )
    short_name = models.CharField(
        max_length=10,
        help_text='Короткий ключ для поиска',
        null=True,
        blank=True
    )
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )
    objects = models.Manager()
    class Meta:
        ordering = ['order']


class PlayerQuestionnaireUser(models.Model):
    questionnaire = models.ForeignKey(PlayerQuestionnairesRows, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    player = models.ForeignKey(UserPlayer, on_delete=models.CASCADE)
    notes = models.CharField(null=True, blank=True, max_length=255)


class PlayerQuestionnaireClub(models.Model):
    questionnaire = models.ForeignKey(PlayerQuestionnairesRows, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, null=True, blank=True)
    player = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE)
    notes = models.CharField(null=True, blank=True, max_length=255)


class AbstractDocumentType(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=30)
    order = models.IntegerField(
        help_text='Индекс сортировки',
        default=0
    )

    objects = models.Manager()
    class Meta():
        abstract = True
        ordering = ['order']


class UserDocumentType(AbstractDocumentType):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    class Meta(AbstractDocumentType.Meta):
        abstract = False


class ClubDocumentType(AbstractDocumentType):
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    class Meta(AbstractDocumentType.Meta):
        abstract = False


class AbstractPlayerDocument(models.Model):
    date_creation = models.DateField(auto_now_add=True)
    doc_text = models.CharField(
        max_length=255,
        null=True,
        blank=True,
    )
    doc = models.FileField(upload_to='players/docs/uploads', validators=[file_size], null=True, blank=True)

    objects = models.Manager()
    class Meta:
        abstract = True
        ordering = ['date_creation']


class UserPlayerDocument(AbstractPlayerDocument):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    player = models.ForeignKey(UserPlayer, on_delete=models.CASCADE)
    trainer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="trainer")
    type = models.ForeignKey(UserDocumentType, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractPlayerDocument.Meta):
        abstract = False


class ClubPlayerDocument(AbstractPlayerDocument):
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    player = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE)
    trainer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.ForeignKey(ClubDocumentType, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractPlayerDocument.Meta):
        abstract = False

