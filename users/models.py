from django.db import models
from django.contrib.auth.models import AbstractUser
from django_countries.fields import CountryField
from django.utils.translation import gettext_lazy as _

from clubs.models import Club
from .managers import CustomUserManager
from version.models import Version


class UserPersonal(models.Model):
    first_name = models.CharField(
        max_length=50,
        verbose_name=_('Name'),
        help_text=_('First name')
    )
    last_name = models.CharField(
        max_length=50,
        verbose_name=_('Surname'),
        help_text=_('Last name')
    )
    father_name = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Patronymic'),
        help_text=_('Father name')
    )
    job_title = models.CharField(
        max_length=60,
        null=True,
        blank=True,
        verbose_name=_('Job title'),
        help_text=_('User job title')
    )
    country_id = CountryField(
        verbose_name=_('Country'),
        help_text=_('Country of residence')
    )
    region_id = models.IntegerField(null=True, blank=True, default=None)
    city = models.CharField(max_length=20, null=True, blank=True, default=None)
    date_birthsday = models.DateField(
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Birthday'),
        help_text=_('Date of birth')
    )
    phone = models.CharField(
        max_length=25,
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Phone'),
        help_text=_('Phone number')
    )
    phone_2 = models.CharField(
        max_length=25,
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Spare phone'),
        help_text=_('Spare phone number')
    )
    email_2 = models.CharField(
        max_length=60,
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Spare email'),
        help_text=_('Spare email')
    )
    skype = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Skype'),
    )

    @property
    def full_name(self):
        return '%s %s %s' % (self.last_name, self.first_name, self.father_name)

    @classmethod
    def get_default_pk(cls):
        personal = cls.objects.create(
            first_name=_('No name'), last_name=_('No last name'))
        return personal.pk

    def __str__(self):
        return '%s %s %s' % (self.last_name, self.first_name, self.father_name)

    class Meta:
        verbose_name = _('Personal information')


class UserPayment(models.Model):
    last_invoice_id = models.IntegerField(null=True, blank=True, default=None)
    autopay_id = models.IntegerField(null=True, blank=True, default=None)
    autopay_version = models.IntegerField(null=True, blank=True, default=None)

    @classmethod
    def get_default_pk(cls):
        payment = cls.objects.create()
        return payment.pk

    class Meta:
        verbose_name = _('Payment information')


class User(AbstractUser):
    username = None
    last_name = None
    first_name = None
    email = models.EmailField(_("email address"), unique=True)
    p_version = models.ForeignKey(Version, on_delete=models.SET_NULL, null=True)
    club_id = models.ForeignKey(
        Club,
        null=True,
        blank=True,
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
        null=True,
        on_delete=models.SET_NULL,
        default=None,
        verbose_name=_('Personal Information'),
        help_text=_('User Personal Information card'),
        unique=True,
    )

    payment = models.OneToOneField(
        UserPayment,
        null=True,
        on_delete=models.SET_NULL,
        default=None,
        verbose_name=_('Payment Information'),
        help_text=_('User Payment Information card'),
        unique=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if not self.personal:
            self.personal = UserPersonal.objects.create(first_name=_('No name'), last_name=_('No last name'))
        if not self.payment:
            self.payment = UserPayment.objects.create()

        super(User, self).save(*args, **kwargs)
