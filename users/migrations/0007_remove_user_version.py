# Generated by Django 4.0.4 on 2022-05-12 14:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_remove_user_version_user_p_version'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='version',
        ),
    ]
