# Generated by Django 4.0.4 on 2023-01-11 09:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0013_video_note'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='favourites',
            field=models.BooleanField(default=False, help_text='Favorite video', verbose_name='favourites'),
        ),
    ]
