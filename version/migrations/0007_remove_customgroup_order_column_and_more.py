# Generated by Django 4.0.4 on 2023-10-02 10:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('version', '0006_section_translation_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customgroup',
            name='order_column',
        ),
        migrations.RemoveField(
            model_name='customgroup',
            name='tree_depth',
        ),
        migrations.AddField(
            model_name='customgroup',
            name='parent_group',
            field=models.IntegerField(default=-1, help_text='If it is child access, select parent', verbose_name='Parent group'),
        ),
    ]
