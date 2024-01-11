# Generated by Django 4.0.4 on 2023-12-28 11:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('version', '0010_alter_customgroup_options'),
    ]

    operations = [
        migrations.CreateModel(
            name='SectionInformation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(blank=True, help_text='Information for the user', null=True, verbose_name='Content')),
                ('last_update', models.DateField(auto_now=True, help_text='Date of last update', verbose_name='Last update')),
            ],
        ),
    ]
