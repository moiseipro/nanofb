# Generated by Django 4.0.4 on 2022-10-14 10:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0013_playerprotocolstatus'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerprotocolstatus',
            name='tags',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
