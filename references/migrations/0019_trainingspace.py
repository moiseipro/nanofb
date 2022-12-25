# Generated by Django 4.0.4 on 2022-12-25 10:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0018_alter_clubteam_users'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainingSpace',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, help_text='Imported source name', max_length=255, null=True, verbose_name='title')),
                ('short_name', models.CharField(default='Empty', help_text='Short name no more than 10 characters', max_length=10, verbose_name='short name')),
                ('order', models.IntegerField(default=0, help_text='Sorting index', verbose_name='order')),
                ('translation_names', models.JSONField(blank=True, help_text='Translations of reference books', null=True, verbose_name='translated title')),
            ],
            options={
                'ordering': ['order'],
                'abstract': False,
            },
        ),
    ]
