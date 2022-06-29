# Generated by Django 4.0.4 on 2022-06-29 19:05

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0013_exscategory_exscognitiveload_exsgoal_exsworkoutpart'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clubseason',
            name='date_by',
            field=models.DateField(default=datetime.date(2022, 12, 31), help_text='End date of the season.', verbose_name='end date'),
        ),
        migrations.AlterField(
            model_name='clubseason',
            name='date_with',
            field=models.DateField(default=datetime.date(2022, 1, 1), help_text='Start date of the season.', verbose_name='start date'),
        ),
        migrations.AlterField(
            model_name='userseason',
            name='date_by',
            field=models.DateField(default=datetime.date(2022, 12, 31), help_text='End date of the season.', verbose_name='end date'),
        ),
        migrations.AlterField(
            model_name='userseason',
            name='date_with',
            field=models.DateField(default=datetime.date(2022, 1, 1), help_text='Start date of the season.', verbose_name='start date'),
        ),
    ]
