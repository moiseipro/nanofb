# Generated by Django 4.0.4 on 2023-03-06 11:27

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0027_alter_userpersonal_email_2_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpersonal',
            name='license_date',
            field=models.DateField(default=datetime.date.today, help_text='License expiration date', null=True, verbose_name='License date'),
        ),
    ]
