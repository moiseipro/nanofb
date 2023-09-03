# Generated by Django 4.0.4 on 2023-08-31 14:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medicine', '0005_alter_clubmedicinediagnosis_healthy_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clubmedicinediagnosis',
            name='recovery_period',
            field=models.CharField(blank=True, help_text='Venue of the recovery period.', max_length=10, null=True, verbose_name='recovery period'),
        ),
        migrations.AlterField(
            model_name='usermedicinediagnosis',
            name='recovery_period',
            field=models.CharField(blank=True, help_text='Venue of the recovery period.', max_length=10, null=True, verbose_name='recovery period'),
        ),
    ]
