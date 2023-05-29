# Generated by Django 4.0.4 on 2023-05-24 09:24

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0030_alter_user_is_demo_mode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpersonal',
            name='job_title',
            field=models.CharField(blank=True, help_text='User job title', max_length=30, null=True, verbose_name='Job title'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='license',
            field=models.CharField(blank=True, help_text="Trainer's License", max_length=30, null=True, verbose_name='License'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='license_date',
            field=models.DateField(blank=True, default=datetime.date.today, help_text='License expiration date', null=True, verbose_name='License date'),
        ),
    ]
