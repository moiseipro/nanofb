from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p
from users.models import User
from players.models import UserPlayer, ClubPlayer


class Test(models.Model):
    name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    created_by = models.ForeignKey(
        User,
        verbose_name=_('trainer'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(
        verbose_name=_('Date and time'),
        help_text=_('Date and time of this test'),
        auto_now_add=True
    )
    parameters = models.JSONField(default=list)

    objects = models.Manager()
    class Meta:
        abstract = False
        ordering = ['-created_at']


class AbstractPlayerResult(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='%(class)s_results')
    date = models.DateField()
    values = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()
    markers = GenericRelation(
        'UserTestResultMarker', 
        content_type_field='content_type', 
        object_id_field='object_id'
    )
    class Meta:
        abstract = True
        ordering = ['date']


class UserPlayerResult(AbstractPlayerResult):
    player = models.ForeignKey(UserPlayer, on_delete=models.CASCADE, related_name='test_results')
    class Meta:
        unique_together = [['test', 'player', 'date']]
        abstract = False


class ClubPlayerResult(AbstractPlayerResult):
    player = models.ForeignKey(ClubPlayer, on_delete=models.CASCADE, related_name='test_results')
    class Meta:
        unique_together = [['test', 'player', 'date']]
        abstract = False


class UserTestResultMarker(models.Model):
    content_type = models.ForeignKey(
        ContentType, 
        on_delete=models.CASCADE, 
        verbose_name="Тип результата"
    )
    object_id = models.PositiveIntegerField(verbose_name="ID результата")
    result = GenericForeignKey('content_type', 'object_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    values = models.JSONField(default=dict)

    objects = models.Manager()
    class Meta:
        abstract = False
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]
