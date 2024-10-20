# Generated by Django 4.0.4 on 2024-02-27 11:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0049_alter_clubtrainingobjectives_short_name_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='clubtraining',
            name='field_size',
        ),
        migrations.RemoveField(
            model_name='clubtraining',
            name='load_type',
        ),
        migrations.RemoveField(
            model_name='litetraining',
            name='field_size',
        ),
        migrations.RemoveField(
            model_name='litetraining',
            name='load_type',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='field_size',
        ),
        migrations.RemoveField(
            model_name='usertraining',
            name='load_type',
        ),
        migrations.AddField(
            model_name='clubtraining',
            name='block',
            field=models.CharField(blank=True, help_text='Training block', max_length=255, null=True, verbose_name='Block'),
        ),
        migrations.AddField(
            model_name='clubtraining',
            name='block_short_key',
            field=models.CharField(blank=True, help_text='The short key of the training block', max_length=30, null=True, verbose_name='Block short key'),
        ),
        migrations.AddField(
            model_name='litetraining',
            name='block',
            field=models.CharField(blank=True, help_text='Training block', max_length=255, null=True, verbose_name='Block'),
        ),
        migrations.AddField(
            model_name='litetraining',
            name='block_short_key',
            field=models.CharField(blank=True, help_text='The short key of the training block', max_length=30, null=True, verbose_name='Block short key'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='block',
            field=models.CharField(blank=True, help_text='Training block', max_length=255, null=True, verbose_name='Block'),
        ),
        migrations.AddField(
            model_name='usertraining',
            name='block_short_key',
            field=models.CharField(blank=True, help_text='The short key of the training block', max_length=30, null=True, verbose_name='Block short key'),
        ),
    ]
