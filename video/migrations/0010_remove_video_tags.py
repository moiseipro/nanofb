# Generated by Django 4.0.4 on 2022-08-30 10:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0009_video_taggit'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='video',
            name='tags',
        ),
    ]
