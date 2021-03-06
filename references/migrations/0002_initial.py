# Generated by Django 4.0.4 on 2022-07-12 09:01

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import references.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('references', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('clubs', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userteam',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='userseason',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='clubteam',
            name='ref_team_status',
            field=models.ForeignKey(default=references.models.TeamStatus.get_default_pk, help_text='Team status.', on_delete=django.db.models.deletion.SET_DEFAULT, to='references.teamstatus', verbose_name='team status'),
        ),
        migrations.AddField(
            model_name='clubteam',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clubs.club'),
        ),
        migrations.AddField(
            model_name='clubseason',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clubs.club'),
        ),
    ]
