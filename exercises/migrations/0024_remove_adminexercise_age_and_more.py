# Generated by Django 4.0.4 on 2022-07-06 10:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0023_remove_userexercise_user_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='adminexercise',
            name='age',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='iterations',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='organization',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='pauses',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='play_zone',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='ref_category',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='ref_coaching',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='ref_purpose',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='ref_stress_type',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='series',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='touches_amount',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='age',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='iterations',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='organization',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='pauses',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='play_zone',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='ref_category',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='ref_coaching',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='ref_purpose',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='ref_stress_type',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='series',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='touches_amount',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='age',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='iterations',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='organization',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='pauses',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='play_zone',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='ref_category',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='ref_coaching',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='ref_purpose',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='ref_stress_type',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='series',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='touches_amount',
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='coaching',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='condition',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='keyword',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='purpose',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='ref_age_category',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='ref_source',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='stress_type',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='coaching',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='condition',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='keyword',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='purpose',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='ref_age_category',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='ref_source',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='stress_type',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='coaching',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='condition',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='keyword',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='purpose',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='ref_age_category',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='ref_source',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='stress_type',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
