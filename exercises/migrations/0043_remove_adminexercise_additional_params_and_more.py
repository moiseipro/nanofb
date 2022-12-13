# Generated by Django 4.0.4 on 2022-12-13 13:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0042_alter_exercisetag_lowercase_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='adminexercise',
            name='additional_params',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='additional_params',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='additional_params',
        ),
        migrations.AlterField(
            model_name='exercisetag',
            name='lowercase_name',
            field=models.CharField(help_text='', max_length=255, unique=True, verbose_name='lowercase title'),
        ),
        migrations.CreateModel(
            name='ExerciseAdditionalParamValue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.CharField(blank=True, max_length=255, null=True)),
                ('exercise_club', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.clubexercise')),
                ('exercise_nfb', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.adminexercise')),
                ('exercise_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.userexercise')),
                ('param_club', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='exercises.clubexerciseadditionalparams')),
                ('param_nfb', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='exercises.adminexerciseadditionalparams')),
                ('param_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='exercises.userexerciseadditionalparams')),
            ],
        ),
    ]
