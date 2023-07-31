# Generated by Django 4.0.4 on 2023-07-31 10:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0040_user_federation_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='distributor',
            field=models.CharField(blank=True, help_text='User distributor', max_length=20, null=True, verbose_name='Distributor'),
        ),
    ]
