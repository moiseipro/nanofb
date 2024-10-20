# Generated by Django 4.0.4 on 2022-12-25 10:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0019_trainingspace'),
        ('trainings', '0025_alter_clubtraining_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubtraining',
            name='space',
            field=models.ForeignKey(blank=True, help_text='Training space', null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.trainingspace', verbose_name='space'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='space',
            field=models.ForeignKey(blank=True, help_text='Training space', null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.trainingspace', verbose_name='space'),
        ),
    ]
