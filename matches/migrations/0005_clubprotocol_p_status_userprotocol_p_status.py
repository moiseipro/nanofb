# Generated by Django 4.0.4 on 2022-10-10 09:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0013_playerprotocolstatus'),
        ('matches', '0004_clubprotocol_is_opponent_userprotocol_is_opponent'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubprotocol',
            name='p_status',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.playerprotocolstatus'),
        ),
        migrations.AddField(
            model_name='userprotocol',
            name='p_status',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.playerprotocolstatus'),
        ),
    ]
