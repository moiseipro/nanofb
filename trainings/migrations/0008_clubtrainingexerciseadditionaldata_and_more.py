# Generated by Django 4.0.4 on 2022-09-14 10:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0012_playerfoot_playerlevel_playerplayerstatus_and_more'),
        ('trainings', '0007_trainingexerciseadditionaldata_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClubTrainingExerciseAdditionalData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('note', models.CharField(help_text='Note to the reference book', max_length=255, verbose_name='note')),
                ('additional_data_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='references.exsadditionaldata')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserTrainingExerciseAdditionalData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('note', models.CharField(help_text='Note to the reference book', max_length=255, verbose_name='note')),
                ('additional_data_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='references.exsadditionaldata')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterField(
            model_name='clubtrainingexercise',
            name='additional_data',
            field=models.ManyToManyField(through='trainings.ClubTrainingExerciseAdditionalData', to='references.exsadditionaldata'),
        ),
        migrations.AlterField(
            model_name='usertrainingexercise',
            name='additional_data',
            field=models.ManyToManyField(through='trainings.UserTrainingExerciseAdditionalData', to='references.exsadditionaldata'),
        ),
        migrations.DeleteModel(
            name='TrainingExerciseAdditionalData',
        ),
        migrations.AddField(
            model_name='usertrainingexerciseadditionaldata',
            name='training_exercise_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='trainings.usertrainingexercise'),
        ),
        migrations.AddField(
            model_name='clubtrainingexerciseadditionaldata',
            name='training_exercise_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='trainings.clubtrainingexercise'),
        ),
    ]
