# Generated by Django 4.0.4 on 2023-02-06 08:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_alter_user_p_version_alter_user_payment_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='userpersonal',
            name='license',
            field=models.CharField(blank=True, help_text="Trainer's License", max_length=60, null=True, verbose_name='License'),
        ),
    ]
