# Generated by Django 4.0.4 on 2022-10-21 10:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_alter_userpersonal_city_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userpayment',
            name='autopay_id',
            field=models.IntegerField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='userpayment',
            name='autopay_version',
            field=models.IntegerField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='userpayment',
            name='last_invoice_id',
            field=models.IntegerField(blank=True, default=None, null=True),
        ),
    ]
