# Generated by Django 4.0.4 on 2022-06-28 11:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0008_userseason_clubseason'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='exsball',
            options={},
        ),
        migrations.AddField(
            model_name='exsball',
            name='translation_names',
            field=models.JSONField(blank=True, help_text='Translations of reference books', null=True, verbose_name='translated title'),
        ),
    ]
