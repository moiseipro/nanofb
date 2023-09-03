# Generated by Django 4.0.4 on 2023-08-31 14:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medicine', '0004_clubmedicinediagnosis_disease_nonspecific_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clubmedicinediagnosis',
            name='healthy_date',
            field=models.DateTimeField(blank=True, help_text='Date and time of healthy status', null=True, verbose_name='Date and time'),
        ),
        migrations.AlterField(
            model_name='usermedicinediagnosis',
            name='healthy_date',
            field=models.DateTimeField(blank=True, help_text='Date and time of healthy status', null=True, verbose_name='Date and time'),
        ),
    ]
