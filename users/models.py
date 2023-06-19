from datetime import date

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django_countries.fields import CountryField
from django.utils.translation import gettext_lazy as _

from clubs.models import Club
from .managers import CustomUserManager
from version.models import Version


def user_directory_path(instance, filename):
    return 'user_{0}/{1}'.format(instance.user.id, filename)


# User References
class TrainerLicense(models.Model):
    name = models.CharField(
        max_length=50,
        verbose_name=_('title'),
        help_text=_('Imported source name'),
        null=True,
        blank=True
    )
    order = models.IntegerField(
        verbose_name=_('order'),
        help_text=_('Sorting index'),
        default=0
    )

    def __str__(self):
        return self.name or 'No name'

    class Meta:
        verbose_name = _('Trainer License')
        verbose_name_plural = _('Trainer\'s licenses')
        ordering = ['order']


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
        max_length=30,
        null=True,
        blank=True,
        verbose_name=_('Job title'),
        help_text=_('User job title')
    )
    club_title = models.CharField(
        max_length=60,
        null=True,
        blank=True,
        verbose_name=_('Club title'),
        help_text=_('User club title')
    )
    trainer_license = models.ForeignKey(
        TrainerLicense,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Trainer license'),
        help_text=_('Trainer user license'),
    )
    license = models.CharField(
        max_length=15,
        null=True,
        blank=True,
        verbose_name=_('License'),
        help_text=_('Trainer License')
    )
    license_date = models.DateField(
        null=True,
        blank=True,
        default=date.today,
        verbose_name=_('License to'),
        help_text=_('License expiration date'),
    )
    country_id = CountryField(
        verbose_name=_('Country'),
        help_text=_('Country of residence')
    )
    region_id = models.IntegerField(null=True, blank=True, default=None)
    region = models.CharField(
        max_length=60,
        null=True,
        #blank=True,
        default=None)
    city = models.CharField(max_length=60, null=True, blank=True, default=None)
    date_birthsday = models.DateField(
        null=True,
        #blank=True,
        default=None,
        verbose_name=_('Birthday'),
        help_text=_('Date of birth'),
    )
    phone = models.CharField(
        max_length=25,
        null=True,
        #blank=True,
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
        max_length=30,
        null=True,
        blank=True,
        default=None,
        verbose_name=_('Skype'),
    )
    avatar = models.ImageField(
        null=True,
        blank=True,
        upload_to=user_directory_path
    )
    my_contacts = models.BooleanField(default=0)

    @property
    def full_name(self):
        return '{} {} {}'.format(self.last_name, self.first_name, "" if self.father_name is None else self.father_name)

    @property
    def get_job_title(self):
        return _('Not specified') if self.job_title is None else self.job_title

    @property
    def get_phone(self):
        return _('Not specified') if self.phone is None else self.phone

    @property
    def get_phone_2(self):
        return _('Not specified') if self.phone_2 is None else self.phone_2

    @property
    def get_email_2(self):
        return _('Not specified') if self.email_2 is None else self.email_2

    @property
    def get_license(self):
        return _('Not specified') if self.license is None else self.license

    @classmethod
    def get_default_pk(cls):
        personal = cls.objects.create(
            first_name=_('No name'), last_name=_('No last name'))
        return personal.pk

    def __str__(self):
        return '{} {} {}'.format(self.last_name, self.first_name, "" if self.father_name is None else self.father_name)

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


class UserPaymentInformation(models.Model):
    payment = models.DecimalField(
        verbose_name=_('Payment'),
        help_text=_("Payment in foreign currency"),
        max_digits=8,
        decimal_places=2,
        default=0.00
    )
    discount = models.PositiveSmallIntegerField(
        verbose_name=_('Discount'),
        help_text=_("Percent discount (0-100%)"),
        default=0,
        validators=[
            MaxValueValidator(100),
            MinValueValidator(0)
        ]
    )
    date = models.DateField(
        verbose_name=_('Date of payment'),
        help_text=_('Date when the user paid'),
    )


class User(AbstractUser):
    username = None
    last_name = None
    first_name = None
    email = models.EmailField(_("email address"), unique=True)
    p_version = models.ForeignKey(
        Version,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Version'),
        help_text=_('User version'),
    )
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
    is_demo_mode = models.BooleanField(default=0)
    date_joined = models.DateField(
        auto_now_add=True,
        verbose_name=_('Date of registration'),
        help_text=_('Date of registration'),
    )
    date_last_login = models.DateField(
        verbose_name=_('Last login date'),
        help_text=_('Last login date'),
        null=True,

    )
    days_entered = models.IntegerField(default=0)
    registration_to = models.DateField(
        default=date.today,
        null=False,
        blank=False,
        verbose_name=_('Expiration version'),
        help_text=_('Version expiration date'),
    )

    personal = models.OneToOneField(
        UserPersonal,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        default=None,
        verbose_name=_('Personal Information'),
        help_text=_('User Personal Information card'),
        unique=True,
    )

    payment_information = models.ManyToManyField(
        UserPaymentInformation,
        verbose_name=_("Payment Information"),
        help_text=_("Payment information for accounting"),
        blank=True
    )

    payment = models.OneToOneField(
        UserPayment,
        null=True,
        blank=True,
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