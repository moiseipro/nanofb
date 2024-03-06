# Generated by Django 4.0.4 on 2024-03-06 07:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0052_remove_clubtraining_block_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubtraining',
            name='is_personal',
            field=models.BooleanField(default=False, help_text='Is it a personal training', verbose_name='personal training'),
        ),
        migrations.AddField(
            model_name='litetraining',
            name='is_personal',
            field=models.BooleanField(default=False, help_text='Is it a personal training', verbose_name='personal training'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='is_personal',
            field=models.BooleanField(default=False, help_text='Is it a personal training', verbose_name='personal training'),
        ),
    ]
