# Generated by Django 4.0.4 on 2022-11-24 09:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clubs', '0003_alter_club_options'),
        ('players', '0018_playercharacteristicsrows_club'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerquestionnairesrows',
            name='club',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clubs.club'),
        ),
    ]
