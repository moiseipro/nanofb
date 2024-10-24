# Generated by Django 4.0.4 on 2023-01-22 09:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0066_adminexercise_field_age_a_adminexercise_field_age_b_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='adminexercise',
            name='field_keyword_a',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='adminexercise',
            name='field_keyword_b',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='field_keyword_a',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='clubexercise',
            name='field_keyword_b',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='field_keyword_a',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
        migrations.AddField(
            model_name='userexercise',
            name='field_keyword_b',
            field=models.CharField(blank=True, max_length=30, null=True),
        ),
    ]
