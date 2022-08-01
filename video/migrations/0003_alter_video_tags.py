# Generated by Django 4.0.4 on 2022-08-01 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0002_videotags_alter_video_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='video',
            name='tags',
            field=models.ManyToManyField(blank=True, help_text='Tags linked to the video', to='video.videotags', verbose_name='video tags'),
        ),
    ]
