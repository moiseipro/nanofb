# Generated by Django 4.0.4 on 2024-01-16 14:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0044_remove_user_payment_information_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='group',
            field=models.CharField(blank=True, help_text="User's group", max_length=30, null=True, verbose_name='Group'),
        ),
    ]
