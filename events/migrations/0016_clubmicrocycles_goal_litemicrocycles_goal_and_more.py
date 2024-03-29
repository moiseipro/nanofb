# Generated by Django 4.0.4 on 2023-09-12 07:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0015_alter_clubmicrocycles_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubmicrocycles',
            name='goal',
            field=models.CharField(blank=True, default='Microcycle', help_text='Goal of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='M.C. 2'),
        ),
        migrations.AddField(
            model_name='litemicrocycles',
            name='goal',
            field=models.CharField(blank=True, default='Microcycle', help_text='Goal of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='M.C. 2'),
        ),
        migrations.AddField(
            model_name='usermicrocycles',
            name='goal',
            field=models.CharField(blank=True, default='Microcycle', help_text='Goal of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='M.C. 2'),
        ),
        migrations.AlterField(
            model_name='clubmicrocycles',
            name='name',
            field=models.CharField(blank=True, default='Microcycle', help_text='Name of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='M.C.'),
        ),
        migrations.AlterField(
            model_name='litemicrocycles',
            name='name',
            field=models.CharField(blank=True, default='Microcycle', help_text='Name of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='M.C.'),
        ),
        migrations.AlterField(
            model_name='usermicrocycles',
            name='name',
            field=models.CharField(blank=True, default='Microcycle', help_text='Name of the microcycle. The maximum length is 80 characters', max_length=80, verbose_name='M.C.'),
        ),
    ]
