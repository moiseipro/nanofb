# Generated by Django 4.0.4 on 2023-02-17 08:53

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('events', '0012_eventvideolink_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='LiteMicrocycles',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Microcycle', help_text='Name of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='title')),
                ('date_with', models.DateField(help_text='Start date of the microcycle.', verbose_name='start date')),
                ('date_by', models.DateField(help_text='End date of the microcycle.', verbose_name='end date')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['date_with'],
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='LiteEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('short_name', models.CharField(blank=True, help_text='The short name of the event. The maximum length is 4 characters', max_length=4, null=True, verbose_name='short name')),
                ('notes', models.JSONField(blank=True, help_text='Notes to the event.', null=True, verbose_name='notes')),
                ('date', models.DateTimeField(default=django.utils.timezone.now, help_text='Date and time of this event', verbose_name='Date and time')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('video_link', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='events.eventvideolink')),
            ],
            options={
                'ordering': ['-date'],
                'abstract': False,
            },
        ),
    ]
