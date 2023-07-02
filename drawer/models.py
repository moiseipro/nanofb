from django.db import models
from users.models import User
from clubs.models import Club
from django.core.exceptions import ValidationError



def upload_location(instance, filename):
    filebase, extension = filename.split('.')
    return f"drawer/img/uploads/{instance.name}.{extension}"

def upload_location_field(instance, filename):
    filebase, extension = filename.split('.')
    return f"drawer/img/uploads/fields/{instance.name}.{extension}"


def validate_image(image):
    file_size = image.file.size
    print(file_size)
    limit_mb = 10
    if file_size > limit_mb * 1024 * 1024:
       raise ValidationError("Max size of file is %s MB" % limit_mb)


class AbstractDraw(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Название рисунка (ID)',
        unique=True
    )
    rendered_img = models.ImageField(upload_to=upload_location_field, null=True, blank=True)
    elements = models.JSONField(null=True, blank=True)
    objects = models.Manager()

    class Meta():
        abstract = True
    def save(self, *args, **kwargs):
        try:
            this = AbstractDraw.objects.get(id=self.id)
            if this.rendered_img != self.rendered_img:
                this.rendered_img.delete(save=False)
        except: pass
        super(AbstractDraw, self).save(*args, **kwargs)
    def __str__(self):
        return f"[id: {self.id}] {self.name}"


class AdminDraw(AbstractDraw):
    class Meta(AbstractDraw.Meta):
        abstract = False


class UserDraw(AbstractDraw):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractDraw.Meta):
        abstract = False


class ClubDraw(AbstractDraw):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractDraw.Meta):
        abstract = False


class AbstractBackPicture(models.Model):
    name = models.CharField(
        max_length=255,
        help_text='Название рисунка (ID)',
        unique=True
    )
    img = models.ImageField(upload_to=upload_location, validators=[validate_image])
    objects = models.Manager()

    class Meta():
        abstract = True
    def __str__(self):
        return f"[id: {self.id}] {self.name}"


class AdminBackPicture(AbstractBackPicture):
    class Meta(AbstractBackPicture.Meta):
        abstract = False


class UserBackPicture(AbstractBackPicture):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractBackPicture.Meta):
        abstract = False


class ClubBackPicture(AbstractBackPicture):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta(AbstractBackPicture.Meta):
        abstract = False

