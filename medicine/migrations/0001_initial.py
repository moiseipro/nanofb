# Generated by Django 4.0.4 on 2023-08-26 10:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('players', '0026_clubplayer_is_archive_userplayer_is_archive'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('references', '0034_medicinediagnosistype_medicinenotetype_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserMedicineTreatment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('treatment', models.CharField(blank=True, help_text='Venue of the treatment.', max_length=255, null=True, verbose_name='treatment')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.userplayer')),
                ('treatment_type', models.ManyToManyField(blank=True, to='references.medicinetreatmenttype')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserMedicineNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('note', models.CharField(blank=True, help_text='Venue of the note.', max_length=255, null=True, verbose_name='note')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('note_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinenotetype')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.userplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserMedicineDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('doc_text', models.CharField(blank=True, help_text='Venue of the treatment.', max_length=255, null=True, verbose_name='treatment')),
                ('doc', models.FileField(blank=True, null=True, upload_to='medicine/img/uploads/docs')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.userplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserMedicineDiagnosis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('diagnosis', models.CharField(blank=True, help_text='Venue of the diagnosis.', max_length=255, null=True, verbose_name='diagnosis')),
                ('recovery_period', models.CharField(blank=True, help_text='Venue of the recovery period.', max_length=5, null=True, verbose_name='recovery period')),
                ('healthy_status', models.BooleanField(default=False)),
                ('healthy_date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of healthy status', verbose_name='Date and time')),
                ('diagnosis_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinediagnosistype')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.userplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ClubMedicineTreatment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('treatment', models.CharField(blank=True, help_text='Venue of the treatment.', max_length=255, null=True, verbose_name='treatment')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.clubplayer')),
                ('treatment_type', models.ManyToManyField(blank=True, to='references.medicinetreatmenttype')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ClubMedicineNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('note', models.CharField(blank=True, help_text='Venue of the note.', max_length=255, null=True, verbose_name='note')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('note_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinenotetype')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.clubplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ClubMedicineDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('doc_text', models.CharField(blank=True, help_text='Venue of the treatment.', max_length=255, null=True, verbose_name='treatment')),
                ('doc', models.FileField(blank=True, null=True, upload_to='medicine/img/uploads/docs')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.clubplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ClubMedicineDiagnosis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this medicine', verbose_name='Date and time')),
                ('diagnosis', models.CharField(blank=True, help_text='Venue of the diagnosis.', max_length=255, null=True, verbose_name='diagnosis')),
                ('recovery_period', models.CharField(blank=True, help_text='Venue of the recovery period.', max_length=5, null=True, verbose_name='recovery period')),
                ('healthy_status', models.BooleanField(default=False)),
                ('healthy_date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of healthy status', verbose_name='Date and time')),
                ('diagnosis_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinediagnosistype')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.clubplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
