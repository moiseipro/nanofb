# Generated by Django 4.0.4 on 2023-03-16 09:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0037_remove_litetraining_team_name_litetraining_team_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='litetraining',
            name='goalkeepers_count',
            field=models.JSONField(blank=True, help_text='Number of goalkeepers manual entry', null=True, verbose_name='goalkeepers count'),
        ),
        migrations.AddField(
            model_name='litetraining',
            name='players_count',
            field=models.JSONField(blank=True, help_text='Number of players manual entry', null=True, verbose_name='players count'),
        ),
    ]
