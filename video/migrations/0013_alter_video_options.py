# Generated by Django 4.0.4 on 2022-06-06 13:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0012_alter_video_duration'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='video',
            options={'ordering': ['videosource_id', 'section_id'], 'permissions': (('uploading_files', 'Can upload files to videos'),)},
        ),
    ]
