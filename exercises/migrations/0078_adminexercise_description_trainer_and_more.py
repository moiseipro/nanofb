# Generated by Django 4.0.4 on 2023-04-17 07:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0077_adminexercise_visible_demo_clubexercise_visible_demo_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminexercise',
            name='description_trainer',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='description_trainer',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='description_trainer',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
