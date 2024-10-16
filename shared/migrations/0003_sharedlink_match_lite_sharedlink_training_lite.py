# Generated by Django 4.0.4 on 2023-04-19 12:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('matches', '0019_clubmatch_field_labels_opponent_and_more'),
        ('trainings', '0041_clubtrainingexercise_additional_json_and_more'),
        ('shared', '0002_sharedlink_language'),
    ]

    operations = [
        migrations.AddField(
            model_name='sharedlink',
            name='match_lite',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='matches.litematch'),
        ),
        migrations.AddField(
            model_name='sharedlink',
            name='training_lite',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='trainings.litetraining'),
        ),
    ]
