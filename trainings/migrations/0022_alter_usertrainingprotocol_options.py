# Generated by Django 4.0.4 on 2022-10-14 11:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0021_alter_usertrainingprotocol_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='usertrainingprotocol',
            options={'ordering': ['status__order', 'player_id__card__ref_position']},
        ),
    ]
