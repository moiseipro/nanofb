# Generated by Django 4.0.4 on 2023-05-17 08:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0029_user_is_demo_mode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_demo_mode',
            field=models.BooleanField(default=0),
        ),
    ]
