# Generated by Django 4.0.4 on 2022-08-04 15:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0005_video_language_video_music'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='language',
            field=models.CharField(default='none', help_text='Video voice-over language', max_length=10, verbose_name='language (voice acting)'),
        ),
    ]
