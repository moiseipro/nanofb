# Generated by Django 4.0.4 on 2022-07-12 09:01

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('exercises', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userfolder',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='folder',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.userfolder'),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='folder',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.clubfolder'),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='folder',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='exercises.adminfolder'),
        ),
    ]
