# Generated by Django 4.0.4 on 2022-06-29 11:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0020_remove_adminexercise_coaching_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='adminexercise',
            name='players_amount',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='players_amount',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='players_amount',
        ),
    ]
