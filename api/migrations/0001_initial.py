# Generated by Django 4.0.4 on 2022-09-08 12:26

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='APIToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(max_length=100, null=True)),
                ('accesses', models.JSONField(blank=True, null=True)),
                ('ip_whitelist', models.JSONField(blank=True, null=True)),
                ('ip_blacklist', models.JSONField(blank=True, null=True)),
                ('date_created', models.DateField(auto_now_add=True)),
                ('date_expired', models.DateField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
