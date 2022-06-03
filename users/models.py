from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager
from version.models import Version


class User(AbstractUser):
    username = None
    last_name = None
    first_name = None
    email = models.EmailField(_("email address"), unique=True)
    p_version = models.ForeignKey(Version, on_delete=models.CASCADE, null=True)
    club_id = models.IntegerField(default=0)
    is_archive = models.BooleanField(default=0)
    date_joined = models.DateField(auto_now_add=True)
    date_last_login = models.DateField(auto_now=True)
    days_entered = models.IntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        return self.email


class UserPersonal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
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
    objects = models.Manager()

    @property
    def full_name(self):
        return '%s %s %s' % (self.last_name, self.first_name, self.father_name)

    def __str__(self):
        return self.user.email


class UserPayment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    last_invoice_id = models.IntegerField(null=True)
    autopay_id = models.IntegerField(null=True)
    autopay_version = models.IntegerField(null=True)
    objects = models.Manager()

