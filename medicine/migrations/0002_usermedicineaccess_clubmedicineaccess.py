# Generated by Django 4.0.4 on 2023-08-27 09:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0035_medicineaccesstype'),
        ('players', '0026_clubplayer_is_archive_userplayer_is_archive'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('medicine', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserMedicineAccess',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicineaccesstype')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.userplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ClubMedicineAccess',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicineaccesstype')),
                ('doctor_user_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='doctor')),
                ('player', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='players.clubplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
