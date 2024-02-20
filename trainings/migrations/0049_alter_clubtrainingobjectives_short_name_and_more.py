# Generated by Django 4.0.4 on 2024-02-16 11:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0048_remove_clubtrainingobjectives_team_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clubtrainingobjectives',
            name='short_name',
            field=models.CharField(blank=True, help_text='Age group of the objective', max_length=30, null=True, verbose_name='Age'),
        ),
        migrations.AlterField(
            model_name='usertrainingobjectives',
            name='short_name',
            field=models.CharField(blank=True, help_text='Age group of the objective', max_length=30, null=True, verbose_name='Age'),
        ),
    ]
