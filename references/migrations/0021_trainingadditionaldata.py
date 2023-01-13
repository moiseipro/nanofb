# Generated by Django 4.0.4 on 2023-01-13 11:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0020_alter_clubseason_date_by_alter_clubseason_date_with_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainingAdditionalData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, help_text='Imported source name', max_length=255, null=True, verbose_name='title')),
                ('short_name', models.CharField(default='Empty', help_text='Short name no more than 10 characters', max_length=10, verbose_name='short name')),
                ('order', models.IntegerField(default=0, help_text='Sorting index', verbose_name='order')),
                ('translation_names', models.JSONField(blank=True, help_text='Translations of reference books', null=True, verbose_name='translated title')),
            ],
            options={
                'verbose_name': 'Training additional data',
                'verbose_name_plural': 'Training additional data',
                'ordering': ['order'],
                'abstract': False,
            },
        ),
    ]
