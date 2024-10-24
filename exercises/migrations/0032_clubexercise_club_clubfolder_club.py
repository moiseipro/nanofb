# Generated by Django 4.0.4 on 2022-11-23 09:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clubs', '0003_alter_club_options'),
        ('exercises', '0031_adminexercise_videos_clubexercise_videos_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubexercise',
            name='club',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clubs.club'),
        ),
        migrations.AddField(
            model_name='clubfolder',
            name='club',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clubs.club'),
        ),
    ]
