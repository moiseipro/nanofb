# Generated by Django 4.0.4 on 2023-02-13 10:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0071_adminexercise_field_categories_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='adminexercise',
            name='field_keyword_c',
        ),
        migrations.RemoveField(
            model_name='adminexercise',
            name='field_keyword_d',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='field_keyword_c',
        ),
        migrations.RemoveField(
            model_name='clubexercise',
            name='field_keyword_d',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='field_keyword_c',
        ),
        migrations.RemoveField(
            model_name='userexercise',
            name='field_keyword_d',
        ),
    ]
