from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from clubs.models import Club
from .managers import CustomUserManager
from version.models import Version


class UserPersonal(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    father_name = models.CharField(max_length=30, null=True)
    country_id = models.IntegerField(null=True)
    region_id = models.IntegerField(null=True)
    city = models.CharField(max_length=20, null=True)
    date_birthsday = models.DateField(null=True)
    phone = models.CharField(max_length=20, null=True)
    phone_2 = models.CharField(max_length=20, null=True)
    email_2 = models.CharField(max_length=20, null=True)
    skype = models.CharField(max_length=20, null=True)

    @property
    def full_name(self):
        return '%s %s %s' % (self.last_name, self.first_name, self.father_name)

    @classmethod
    def get_default_pk(cls):
        personal = cls(first_name=_('No name'), last_name=_('No last name'))
        personal.save()
        return personal.pk

    def __str__(self):
        return '%s %s %s' % (self.last_name, self.first_name, self.father_name)


class UserPayment(models.Model):
    last_invoice_id = models.IntegerField(null=True)
    autopay_id = models.IntegerField(null=True)
    autopay_version = models.IntegerField(null=True)

    @classmethod
    def get_default_pk(cls):
        payment = cls()
        payment.save()
        return payment.pk


class User(AbstractUser):
    username = None
    last_name = None
    first_name = None
    email = models.EmailField(_("email address"), unique=True)
    p_version = models.ForeignKey(Version, on_delete=models.SET_NULL, null=True)
    club_id = models.ForeignKey(
        Club,
        null=True,
        on_delete=models.SET_NULL,
        default=None,
        verbose_name=_('Club'),
        help_text=_('The club the user is a member of'),
    )
    is_archive = models.BooleanField(default=0)
    is_api_access = models.BooleanField(default=0)
    date_joined = models.DateField(
        auto_now_add=True,
        verbose_name=_('Date of registration'),
        help_text=_('Date of registration'),
    )
    date_last_login = models.DateField(
        auto_now=True,
        verbose_name=_('Last login date'),
        help_text=_('Last login date'),
    )
    days_entered = models.IntegerField(default=0)

    personal = models.OneToOneField(
        UserPersonal,
        on_delete=models.SET_DEFAULT,
        default=UserPersonal.get_default_pk
    )

    payment = models.OneToOneField(
        UserPayment,
        on_delete=models.SET_DEFAULT,
        default=UserPayment.get_default_pk
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.email

