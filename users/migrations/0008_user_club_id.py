# Generated by Django 4.0.4 on 2022-10-20 11:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clubs', '0001_initial'),
        ('users', '0007_remove_user_club_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='club_id',
            field=models.ForeignKey(default=None, help_text='The club the user is a member of', null=True, on_delete=django.db.models.deletion.SET_NULL, to='clubs.club', verbose_name='Club'),
        ),
    ]
