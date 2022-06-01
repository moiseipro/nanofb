from django.db import models


# Create your models here.


class Section(models.Model):
    name = models.CharField(
        max_length=255,
        help_text="Название раздела"
    )
    tag = models.CharField(
        max_length=100,
        help_text="Ключ раздела"
    )
    objects = models.Manager()

    @classmethod
    def get_default_pk(cls):
        section, created = cls.objects.get_or_create(
            name='NF', tag='Default')
        return section.pk

    def __str__(self):
        return self.name


class Access(models.Model):
    name = models.CharField(
        max_length=255,
        help_text="Название доступа"
    )
    section_id = models.ForeignKey(Section, on_delete=models.CASCADE)
    tag = models.CharField(
        max_length=100,
        help_text="Ключ доступа"
    )
    objects = models.Manager()

    def __str__(self):
        return self.name


class Version(models.Model):
    name = models.CharField(
        max_length=255,
        help_text="Название версии"
    )
    updated_date = models.DateField(
        help_text="Дата обновления версии"
    )
    is_active = models.BooleanField(
        default=False
    )
    tag = models.CharField(
        max_length=100,
        help_text="Ключ версии"
    )
    objects = models.Manager()

    def __str__(self):
        return self.name


class VersionAccess(models.Model):
    version_id = models.ForeignKey(Version, on_delete=models.CASCADE, null=True)
    access_id = models.ForeignKey(Access, on_delete=models.CASCADE)
    objects = models.Manager()



