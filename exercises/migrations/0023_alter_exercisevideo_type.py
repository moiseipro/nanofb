# Generated by Django 4.0.4 on 2022-10-22 07:09

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0022_adminexercise_videos_clubexercise_videos_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercisevideo',
            name='type',
            field=models.IntegerField(default=0, help_text='1-2 - видео, 3-4 - анимация', validators=[django.core.validators.MaxValueValidator(4), django.core.validators.MinValueValidator(1)]),
        ),
    ]
