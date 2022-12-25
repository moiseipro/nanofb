# Generated by Django 4.0.4 on 2022-12-25 13:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0026_clubtraining_space_usertraining_space'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubtrainingexercise',
            name='description',
            field=models.TextField(blank=True, help_text='Description of the exercise inside the training', null=True, verbose_name='description'),
        ),
        migrations.AddField(
            model_name='usertrainingexercise',
            name='description',
            field=models.TextField(blank=True, help_text='Description of the exercise inside the training', null=True, verbose_name='description'),
        ),
    ]
