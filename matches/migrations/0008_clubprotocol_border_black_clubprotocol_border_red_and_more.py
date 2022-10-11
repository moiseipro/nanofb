# Generated by Django 4.0.4 on 2022-10-11 09:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matches', '0007_alter_clubprotocol_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubprotocol',
            name='border_black',
            field=models.SmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='clubprotocol',
            name='border_red',
            field=models.SmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprotocol',
            name='border_black',
            field=models.SmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprotocol',
            name='border_red',
            field=models.SmallIntegerField(default=0),
        ),
    ]
