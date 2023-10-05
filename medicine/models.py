from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils.translation import pgettext_lazy as _p
from users.models import User
from players.models import UserPlayer, ClubPlayer
from references.models import MedicineDiagnosisType, MedicineDiseaseSpecific, MedicineDiseaseNonSpecific
from references.models import MedicineDiseaseSpecificUser, MedicineDiseaseSpecificClub, MedicineDiseaseNonSpecificUser, MedicineDiseaseNonSpecificClub
from references.models import MedicineTreatmentType, MedicineNoteType, MedicineAccessType
from django.utils import timezone



class AbstractMedicineDiagnosis(models.Model):
    doctor_user_id = models.ForeignKey(
        User,
        verbose_name=_('doctor'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    date = models.DateTimeField(
        verbose_name=_('Date and time'),
        help_text=_('Date and time of this medicine'),
        blank=False,
        default=timezone.now
    )
    diagnosis_type = models.ForeignKey(MedicineDiagnosisType, on_delete=models.SET_NULL, null=True, blank=True)
    # disease_specific = models.ForeignKey(MedicineDiseaseSpecific, on_delete=models.SET_NULL, null=True, blank=True)
    # disease_nonspecific = models.ForeignKey(MedicineDiseaseNonSpecific, on_delete=models.SET_NULL, null=True, blank=True)
    diagnosis = models.CharField(
        max_length=255,
        verbose_name=_('diagnosis'),
        help_text=_('Venue of the diagnosis.'),
        null=True,
        blank=True,
    )
    recovery_period = models.CharField(
        max_length=10,
        verbose_name=_('recovery period'),
        help_text=_('Venue of the recovery period.'),
        null=True,
        blank=True,
    )
    healthy_status = models.BooleanField(default=False)
    healthy_date = models.DateTimeField(
        verbose_name=_('Date and time'),
        help_text=_('Date and time of healthy status'),
        null=True,
        blank=True,
    )
    
    objects = models.Manager()
    class Meta:
        abstract = True
        ordering = ['date']


class UserMedicineDiagnosis(AbstractMedicineDiagnosis):
    player = models.ForeignKey(UserPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    disease_specific = models.ForeignKey(MedicineDiseaseSpecificUser, on_delete=models.SET_NULL, null=True, blank=True)
    disease_nonspecific = models.ForeignKey(MedicineDiseaseNonSpecificUser, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class ClubMedicineDiagnosis(AbstractMedicineDiagnosis):
    player = models.ForeignKey(ClubPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    disease_specific = models.ForeignKey(MedicineDiseaseSpecificClub, on_delete=models.SET_NULL, null=True, blank=True)
    disease_nonspecific = models.ForeignKey(MedicineDiseaseNonSpecificClub, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class AbstractMedicineTreatment(models.Model):
    doctor_user_id = models.ForeignKey(
        User,
        verbose_name=_('doctor'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    date = models.DateTimeField(
        verbose_name=_('Date and time'),
        help_text=_('Date and time of this medicine'),
        blank=False,
        default=timezone.now
    )
    treatment_type = models.ManyToManyField(MedicineTreatmentType, blank=True)
    treatment = models.CharField(
        max_length=255,
        verbose_name=_('treatment'),
        help_text=_('Venue of the treatment.'),
        null=True,
        blank=True,
    )

    objects = models.Manager()
    class Meta:
        abstract = True
        ordering = ['date']


class UserMedicineTreatment(AbstractMedicineTreatment):
    player = models.ForeignKey(UserPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class ClubMedicineTreatment(AbstractMedicineTreatment):
    player = models.ForeignKey(ClubPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class AbstractMedicineDocument(models.Model):
    doctor_user_id = models.ForeignKey(
        User,
        verbose_name=_('doctor'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    date = models.DateTimeField(
        verbose_name=_('Date and time'),
        help_text=_('Date and time of this medicine'),
        blank=False,
        default=timezone.now
    )
    doc_text = models.CharField(
        max_length=255,
        verbose_name=_('treatment'),
        help_text=_('Venue of the treatment.'),
        null=True,
        blank=True,
    )
    doc = models.FileField(upload_to='medicine/docs/uploads', null=True, blank=True)

    objects = models.Manager()
    class Meta:
        abstract = True
        ordering = ['date']


class UserMedicineDocument(AbstractMedicineDocument):
    player = models.ForeignKey(UserPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class ClubMedicineDocument(AbstractMedicineDocument):
    player = models.ForeignKey(ClubPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class AbstractMedicineNote(models.Model):
    doctor_user_id = models.ForeignKey(
        User,
        verbose_name=_('doctor'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    date = models.DateTimeField(
        verbose_name=_('Date and time'),
        help_text=_('Date and time of this medicine'),
        blank=False,
        default=timezone.now
    )
    note_type = models.ForeignKey(MedicineNoteType, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.CharField(
        max_length=255,
        verbose_name=_('note'),
        help_text=_('Venue of the note.'),
        null=True,
        blank=True,
    )

    objects = models.Manager()
    class Meta:
        abstract = True
        ordering = ['date']


class UserMedicineNote(AbstractMedicineNote):
    player = models.ForeignKey(UserPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class ClubMedicineNote(AbstractMedicineNote):
    player = models.ForeignKey(ClubPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class AbstractMedicineAccess(models.Model):
    doctor_user_id = models.ForeignKey(
        User,
        verbose_name=_('doctor'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    access = models.ForeignKey(MedicineAccessType, on_delete=models.SET_NULL, null=True, blank=True)

    objects = models.Manager()
    class Meta:
        abstract = True


class UserMedicineAccess(AbstractMedicineAccess):
    player = models.ForeignKey(UserPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False


class ClubMedicineAccess(AbstractMedicineAccess):
    player = models.ForeignKey(ClubPlayer, on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = False

