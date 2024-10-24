# Generated by Django 4.0.4 on 2022-09-09 07:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0012_alter_video_taggit'),
        ('exercises', '0020_exercisevideo'),
    ]

    operations = [
        migrations.AddField(
            model_name='exercisevideo',
            name='animation_1',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='animation_1', to='video.video'),
        ),
        migrations.AddField(
            model_name='exercisevideo',
            name='animation_2',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='animation_2', to='video.video'),
        ),
        migrations.AddField(
            model_name='exercisevideo',
            name='video_2',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='video_2', to='video.video'),
        ),
        migrations.AlterField(
            model_name='exercisevideo',
            name='video_1',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='video_1', to='video.video'),
        ),
    ]
