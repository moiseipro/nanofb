# Generated by Django 4.0.4 on 2024-07-23 10:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0063_admintrainingmd'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubtraining',
            name='md',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='trainings.admintrainingmd'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='md',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='trainings.admintrainingmd'),
        ),
    ]
