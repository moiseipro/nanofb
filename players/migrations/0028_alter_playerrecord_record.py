# Generated by Django 4.0.4 on 2023-11-08 08:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0027_alter_clubplayer_options_alter_userplayer_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='playerrecord',
            name='record',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]
