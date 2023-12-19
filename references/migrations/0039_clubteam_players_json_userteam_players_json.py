# Generated by Django 4.0.4 on 2023-12-19 09:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0038_userpaymentinformation_clubpaymentinformation'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubteam',
            name='players_json',
            field=models.JSONField(blank=True, help_text='a simple list of players', null=True, verbose_name='players'),
        ),
        migrations.AddField(
            model_name='userteam',
            name='players_json',
            field=models.JSONField(blank=True, help_text='a simple list of players', null=True, verbose_name='players'),
        ),
    ]
