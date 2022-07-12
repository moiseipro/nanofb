# Generated by Django 4.0.4 on 2022-07-12 09:01

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Club',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Club title. Maximum length of 100 characters.', max_length=100, verbose_name='title')),
                ('subdomain', models.CharField(help_text='The domain that will be displayed. The maximum length is 10 characters.', max_length=10, verbose_name='subdomain')),
                ('date_registration', models.DateField(auto_now_add=True, help_text='Date of registration of the club in the program.', verbose_name='date registration')),
                ('date_registration_to', models.DateField(default=datetime.date.today, help_text='License expiration date.', verbose_name='License termination')),
                ('block', models.BooleanField(default=False, help_text='Is the club blocked?', verbose_name='block')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this club belongs to. A club will get all permissions granted to each of their groups.', to='auth.group', verbose_name='groups')),
                ('permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this club.', to='auth.permission', verbose_name='permissions')),
            ],
        ),
    ]
