# Generated by Django 4.0.4 on 2022-06-16 10:47

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('exercises', '0006_alter_userfolder_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='Exercises',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_creation', models.DateField(auto_now_add=True)),
                ('order', models.IntegerField(default=0, help_text='Индекс сортировки')),
                ('visible', models.BooleanField(default=True, help_text='Показывать упр-ие пользователю или нет')),
                ('completed', models.BooleanField(default=False, help_text='Упражнение завершено')),
                ('completed_time', models.DateField(help_text='Когда упр-ие было завершено')),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.RemoveField(
            model_name='adminfolder',
            name='hide',
        ),
        migrations.RemoveField(
            model_name='clubfolder',
            name='hide',
        ),
        migrations.RemoveField(
            model_name='userfolder',
            name='hide',
        ),
        migrations.AddField(
            model_name='adminfolder',
            name='visible',
            field=models.BooleanField(default=True, help_text='Показывать папку пользователю или нет'),
        ),
        migrations.AddField(
            model_name='clubfolder',
            name='visible',
            field=models.BooleanField(default=True, help_text='Показывать папку пользователю или нет'),
        ),
        migrations.AddField(
            model_name='userfolder',
            name='visible',
            field=models.BooleanField(default=True, help_text='Показывать папку пользователю или нет'),
        ),
        migrations.CreateModel(
            name='ExercisesVisual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scheme_data', models.JSONField()),
                ('video_data', models.JSONField()),
                ('animation_data', models.JSONField()),
                ('exercise_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.exercises')),
            ],
        ),
        migrations.CreateModel(
            name='ExercisesTranslations',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('language_code', models.CharField(default='en', max_length=6)),
                ('title', models.CharField(blank=True, max_length=255, null=True)),
                ('description', models.CharField(blank=True, max_length=1024, null=True)),
                ('exercise_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.exercises')),
            ],
        ),
        migrations.CreateModel(
            name='ExercisesParams',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ref_age_a', models.IntegerField(blank=True, null=True)),
                ('ref_age_b', models.IntegerField(blank=True, null=True)),
                ('ref_ball', models.IntegerField(blank=True, null=True)),
                ('ref_goal', models.IntegerField(blank=True, null=True)),
                ('ref_cognitive_load', models.IntegerField(blank=True, null=True)),
                ('ref_workout_part', models.IntegerField(blank=True, null=True)),
                ('ref_stress', models.IntegerField(blank=True, null=True)),
                ('ref_focuses', django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(blank=True, null=True), blank=True, null=True, size=None)),
                ('partners', models.BooleanField(default=False)),
                ('opponents', models.BooleanField(default=False)),
                ('player_text', models.CharField(blank=True, max_length=255, null=True)),
                ('zone_text', models.CharField(blank=True, max_length=255, null=True)),
                ('exercise_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.exercises')),
            ],
        ),
        migrations.AddField(
            model_name='exercises',
            name='folder_club_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.clubfolder'),
        ),
        migrations.AddField(
            model_name='exercises',
            name='folder_user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.userfolder'),
        ),
        migrations.AddField(
            model_name='exercises',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
