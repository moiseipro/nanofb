# Generated by Django 4.0.4 on 2023-08-31 09:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0041_alter_user_distributor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='date_last_login',
            field=models.DateTimeField(help_text='Last login date', null=True, verbose_name='Last login date'),
        ),
    ]
