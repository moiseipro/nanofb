# Generated by Django 4.0.4 on 2024-08-31 11:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0065_clubtraining_objective_1_clubtraining_objective_2_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clubtraining',
            name='load',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='load',
        ),
        migrations.AddField(
            model_name='clubtraining',
            name='aload',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='trainings.admintrainingload'),
        ),
        migrations.AddField(
            model_name='litetraining',
            name='aload',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='trainings.admintrainingload'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='aload',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='trainings.admintrainingload'),
        ),
    ]
