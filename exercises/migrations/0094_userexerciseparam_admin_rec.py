# Generated by Django 4.0.4 on 2024-06-23 09:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exercises', '0093_rename_copied_exs_id_adminexercise_clone_archive_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userexerciseparam',
            name='admin_rec',
            field=models.BooleanField(default=False),
        ),
    ]
