# Generated by Django 4.0.4 on 2022-12-24 13:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0061_alter_exercisetag_lowercase_name_exercisetagcategory_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exercisetagcategory',
            name='lowercase_name',
        ),
        migrations.AlterField(
            model_name='exercisetag',
            name='lowercase_name',
            field=models.CharField(help_text='', max_length=255, unique=True, verbose_name='lowercase title'),
        ),
    ]
