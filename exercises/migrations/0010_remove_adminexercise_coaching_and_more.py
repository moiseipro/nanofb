# Generated by Django 4.0.4 on 2022-08-01 14:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0009_alter_userexerciseparam_user_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='adminexercise',
            name='coaching',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='condition',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='keyword',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='players_ages',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='players_amount',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='purpose',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='stress_type',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='coaching',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='condition',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='keyword',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='players_ages',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='players_amount',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='purpose',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='stress_type',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='coaching',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='condition',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='keyword',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='players_ages',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='players_amount',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='purpose',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='stress_type',
        ),
        migrations.RemoveField(
            model_name='userexerciseparamteam',
            name='addition',
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='ref_team_category',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='ref_train_part',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='ref_team_category',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='ref_train_part',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='ref_team_category',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='ref_train_part',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='ball_touch',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='group',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='keyword',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='neutral',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='note',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='play_zone',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='player',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='t_pause',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexerciseparamteam',
            name='t_repeat',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
