# Generated by Django 4.0.4 on 2022-07-12 09:01

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('events', '0003_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('video', '0001_initial'),
        ('references', '0002_initial'),
        ('matches', '0003_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usermatch',
            name='video_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='video.video'),
        ),
        migrations.AddField(
            model_name='clubmatch',
            name='event_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='events.clubevent'),
        ),
        migrations.AddField(
            model_name='clubmatch',
            name='team_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='references.clubteam'),
        ),
        migrations.AddField(
            model_name='clubmatch',
            name='trainer_user_id',
            field=models.ForeignKey(blank=True, help_text='Coach tied to the match', null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='trainer'),
        ),
        migrations.AddField(
            model_name='clubmatch',
            name='video_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='video.video'),
        ),
    ]
