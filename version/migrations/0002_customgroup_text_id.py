# Generated by Django 4.0.4 on 2022-11-24 11:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('version', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customgroup',
            name='text_id',
            field=models.CharField(blank=True, max_length=25, null=True),
        ),
    ]
