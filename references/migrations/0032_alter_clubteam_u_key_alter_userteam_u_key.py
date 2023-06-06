# Generated by Django 4.0.4 on 2023-06-06 10:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0031_alter_clubteam_options_alter_userteam_options'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clubteam',
            name='u_key',
            field=models.CharField(blank=True, help_text='U key no more than 10 characters', max_length=10, null=True, verbose_name='U key'),
        ),
        migrations.AlterField(
            model_name='userteam',
            name='u_key',
            field=models.CharField(blank=True, help_text='U key no more than 10 characters', max_length=10, null=True, verbose_name='U key'),
        ),
    ]
