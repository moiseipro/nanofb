# Generated by Django 4.0.4 on 2022-12-20 08:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0048_alter_exercisetag_lowercase_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminexercise',
            name='field_players',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='field_players',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='field_players',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='exercisetag',
            name='lowercase_name',
            field=models.CharField(help_text='', max_length=255, unique=True, verbose_name='lowercase title'),
        ),
    ]
