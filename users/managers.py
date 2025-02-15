from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _
from clubs.models import Club
from django.db.models import QuerySet


class CustomUserManager(BaseUserManager):
    def __init__(self, UserPersonal=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.UserPersonal = UserPersonal

    def fake_data_receiving(self, data):
        data = data if isinstance(data, list) else [data]
        if self.db != 'default':
            return False
        separate_db = None
        try:
            f_elem = data[0].first() if isinstance(data[0], QuerySet) else data[0]
            current_club = Club.objects.filter(pk=f_elem.club_id.id).first()
            separate_db = current_club.separate_database
        except Exception as e:
            pass
        fake_data = []
        if separate_db and separate_db != "":
            for elem in data:
                f_elem = elem.first() if isinstance(elem, QuerySet) else elem
                try:
                    fake_data.append(
                        self.UserPersonal.objects.using(separate_db).filter(pk=f_elem.personal.id).first()
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

    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        extra_fields.setdefault('permissions', {})

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)
