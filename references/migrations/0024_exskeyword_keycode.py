# Generated by Django 4.0.4 on 2023-02-08 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0023_clubteam_age_key_clubteam_u_key_userteam_age_key_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='exskeyword',
            name='keycode',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
