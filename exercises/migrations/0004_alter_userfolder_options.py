# Generated by Django 4.0.4 on 2022-06-03 12:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0003_alter_userfolder_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='userfolder',
            options={'ordering': ['id', 'order']},
        ),
    ]
