# Generated by Django 4.0.4 on 2023-04-17 12:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0078_adminexercise_description_trainer_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminexercise',
            name='date_editing',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='date_editing',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='date_editing',
            field=models.DateField(blank=True, null=True),
        ),
    ]
