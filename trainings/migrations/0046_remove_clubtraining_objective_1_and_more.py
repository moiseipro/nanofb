# Generated by Django 4.0.4 on 2024-02-01 10:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0041_alter_clubseason_date_by_alter_clubseason_date_with_and_more'),
        ('trainings', '0045_clubtraining_objective_key_clubtraining_objectives_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clubtraining',
            name='objective_1',
        ),
        migrations.RemoveField(
            model_name='clubtraining',
            name='objective_2',
        ),
        migrations.RemoveField(
            model_name='clubtraining',
            name='objective_3',
        ),
        migrations.RemoveField(
            model_name='clubtraining',
            name='objective_key',
        ),
        migrations.RemoveField(
            model_name='litetraining',
            name='objective_1',
        ),
        migrations.RemoveField(
            model_name='litetraining',
            name='objective_2',
        ),
        migrations.RemoveField(
            model_name='litetraining',
            name='objective_3',
        ),
        migrations.RemoveField(
            model_name='litetraining',
            name='objective_key',
        ),
        migrations.RemoveField(
            model_name='litetraining',
            name='objectives',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='objective_1',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='objective_2',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='objective_3',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='objective_key',
        ),
        migrations.RemoveField(
            model_name='clubtraining',
            name='objectives',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='objectives',
        ),
        migrations.CreateModel(
            name='UserTrainingObjectives',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('short_name', models.CharField(blank=True, help_text='The short name of the objective', max_length=30, null=True, verbose_name='Short name')),
                ('name', models.CharField(blank=True, help_text='Objective name', max_length=255, null=True, verbose_name='Title')),
                ('team', models.ForeignKey(blank=True, help_text='User team', null=True, on_delete=django.db.models.deletion.CASCADE, to='references.userteam', verbose_name='User team')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserTrainingObjectiveMany',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.SmallIntegerField(blank=True, help_text='Type of objective for training', null=True, verbose_name='Objective type')),
                ('objective', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='trainings.usertrainingobjectives')),
                ('training', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='trainings.usertraining')),
            ],
            options={
                'ordering': ['type'],
            },
        ),
        migrations.CreateModel(
            name='ClubTrainingObjectives',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('short_name', models.CharField(blank=True, help_text='The short name of the objective', max_length=30, null=True, verbose_name='Short name')),
                ('name', models.CharField(blank=True, help_text='Objective name', max_length=255, null=True, verbose_name='Title')),
                ('team', models.ForeignKey(blank=True, help_text='Club team', null=True, on_delete=django.db.models.deletion.CASCADE, to='references.clubteam', verbose_name='Club team')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ClubTrainingObjectiveMany',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.SmallIntegerField(blank=True, help_text='Type of objective for training', null=True, verbose_name='Objective type')),
                ('objective', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='trainings.clubtrainingobjectives')),
                ('training', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='trainings.clubtraining')),
            ],
            options={
                'ordering': ['type'],
            },
        ),
        migrations.AddField(
            model_name='clubtraining',
            name='objectives',
            field=models.ManyToManyField(blank=True, help_text='Objective in training', through='trainings.ClubTrainingObjectiveMany', to='trainings.clubtrainingobjectives', verbose_name='objective'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='objectives',
            field=models.ManyToManyField(blank=True, help_text='Objective in training', through='trainings.UserTrainingObjectiveMany', to='trainings.usertrainingobjectives', verbose_name='objective'),
        ),
    ]
