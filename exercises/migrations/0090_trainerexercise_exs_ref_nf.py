# Generated by Django 4.0.4 on 2024-02-21 08:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0089_adminexercise_date_editing_folder_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='trainerexercise',
            name='exs_ref_nf',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
