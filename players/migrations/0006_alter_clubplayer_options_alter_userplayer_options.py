# Generated by Django 4.0.4 on 2022-09-01 14:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0005_alter_clubplayer_photo_alter_userplayer_photo'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='clubplayer',
            options={'ordering': ['surname', 'name', 'patronymic']},
        ),
        migrations.AlterModelOptions(
            name='userplayer',
            options={'ordering': ['surname', 'name', 'patronymic']},
        ),
    ]
