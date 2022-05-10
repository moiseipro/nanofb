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

    def __str__(self):
        return self.name


class VersionAccess(models.Model):
    version_id = models.ForeignKey(Version, on_delete=models.CASCADE)
    access_id = models.ForeignKey(Access, on_delete=models.CASCADE)



