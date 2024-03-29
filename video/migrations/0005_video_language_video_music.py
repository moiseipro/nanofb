# Generated by Django 4.0.4 on 2022-08-03 10:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0004_video_created_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='language',
            field=models.CharField(default='en', help_text='Video voice-over language', max_length=10, verbose_name='language (voice acting)'),
        ),
        migrations.AddField(
            model_name='video',
            name='music',
            field=models.BooleanField(default=False, help_text='Is there music in the video?', verbose_name='music'),
        ),
    ]
