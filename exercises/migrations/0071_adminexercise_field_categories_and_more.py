# Generated by Django 4.0.4 on 2023-02-09 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0070_adminexercise_field_keywords_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminexercise',
            name='field_categories',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='field_categories',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='field_categories',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
