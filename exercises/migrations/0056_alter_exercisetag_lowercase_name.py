# Generated by Django 4.0.4 on 2022-12-21 09:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0055_adminexercise_field_age_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exercisetag',
            name='lowercase_name',
            field=models.CharField(help_text='', max_length=255, unique=True, verbose_name='lowercase title'),
        ),
    ]
