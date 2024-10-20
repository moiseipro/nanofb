# Generated by Django 4.0.4 on 2023-03-31 12:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0076_adminexercise_field_fields_clubexercise_field_fields_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminexercise',
            name='visible_demo',
            field=models.BooleanField(default=True, help_text='Показывать упр-ие пользователю или нет в демо-режиме версии'),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='visible_demo',
            field=models.BooleanField(default=True, help_text='Показывать упр-ие пользователю или нет в демо-режиме версии'),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='visible_demo',
            field=models.BooleanField(default=True, help_text='Показывать упр-ие пользователю или нет в демо-режиме версии'),
        ),
    ]
