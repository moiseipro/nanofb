# Generated by Django 4.0.4 on 2023-02-10 11:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_userpersonal_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpersonal',
            name='date_birthsday',
            field=models.DateField(default=None, help_text='Date of birth', null=True, verbose_name='Birthday'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='email_2',
            field=models.CharField(default=None, help_text='Spare email', max_length=60, null=True, verbose_name='Spare email'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='father_name',
            field=models.CharField(default=None, help_text='Father name', max_length=50, null=True, verbose_name='Patronymic'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='job_title',
            field=models.CharField(help_text='User job title', max_length=60, null=True, verbose_name='Job title'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='license',
            field=models.CharField(help_text="Trainer's License", max_length=60, null=True, verbose_name='License'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='phone',
            field=models.CharField(default=None, help_text='Phone number', max_length=25, null=True, verbose_name='Phone'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='phone_2',
            field=models.CharField(default=None, help_text='Spare phone number', max_length=25, null=True, verbose_name='Spare phone'),
        ),
        migrations.AlterField(
            model_name='userpersonal',
            name='skype',
            field=models.CharField(default=None, max_length=20, null=True, verbose_name='Skype'),
        ),
    ]
