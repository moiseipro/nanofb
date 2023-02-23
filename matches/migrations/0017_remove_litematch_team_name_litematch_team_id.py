# Generated by Django 4.0.4 on 2023-02-22 13:38

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0028_alter_exsphysicalqualities_options_and_more'),
        ('matches', '0016_litematch_duration_litematch_estimation_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='litematch',
            name='team_name',
        ),
        migrations.AddField(
            model_name='litematch',
            name='team_id',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='references.userteam'),
            preserve_default=False,
        ),
    ]
