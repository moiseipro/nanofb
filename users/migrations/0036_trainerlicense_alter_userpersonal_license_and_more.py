# Generated by Django 4.0.4 on 2023-06-19 09:51

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0035_alter_user_date_last_login'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainerLicense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, help_text='Imported source name', max_length=50, null=True, verbose_name='title')),
                ('order', models.IntegerField(default=0, help_text='Sorting index', verbose_name='order')),
            ],
            options={
                'verbose_name': 'Trainer License',
                'verbose_name_plural': "Trainer's licenses",
                'ordering': ['order'],
            },
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='license',
            field=models.CharField(blank=True, help_text="Trainer's License", max_length=15, null=True, verbose_name='License'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='license_date',
            field=models.DateField(blank=True, default=datetime.date.today, help_text='License expiration date', null=True, verbose_name='License to'),
        ),
        migrations.AddField(
            model_name='userpersonal',
            name='trainer_license',
            field=models.ForeignKey(blank=True, help_text='Trainer user license', null=True, on_delete=django.db.models.deletion.SET_NULL, to='users.trainerlicense', verbose_name='Trainer license'),
        ),
    ]
