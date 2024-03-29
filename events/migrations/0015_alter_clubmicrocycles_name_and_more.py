# Generated by Django 4.0.4 on 2023-06-06 10:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0014_remove_litemicrocycles_user_id_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clubmicrocycles',
            name='name',
            field=models.CharField(blank=True, default='Microcycle', help_text='Name of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='title'),
        ),
        migrations.AlterField(
            model_name='litemicrocycles',
            name='name',
            field=models.CharField(blank=True, default='Microcycle', help_text='Name of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='title'),
        ),
        migrations.AlterField(
            model_name='usermicrocycles',
            name='name',
            field=models.CharField(blank=True, default='Microcycle', help_text='Name of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='title'),
        ),
    ]
