# Generated by Django 4.0.4 on 2024-07-11 09:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0060_clubtrainingblocks_team_clubtrainingobjectives_team_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubtraining',
            name='field_size',
            field=models.CharField(blank=True, help_text='The size of the field in training', max_length=255, null=True, verbose_name='field size'),
        ),
        migrations.AddField(
            model_name='litetraining',
            name='field_size',
            field=models.CharField(blank=True, help_text='The size of the field in training', max_length=255, null=True, verbose_name='field size'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='field_size',
            field=models.CharField(blank=True, help_text='The size of the field in training', max_length=255, null=True, verbose_name='field size'),
        ),
    ]
