# Generated by Django 4.0.4 on 2023-08-30 08:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0036_medicinediseasenonspecific_medicinediseasespecific'),
        ('medicine', '0003_alter_clubmedicinediagnosis_healthy_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='clubmedicinediagnosis',
            name='disease_nonspecific',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinediseasenonspecific'),
        ),
        migrations.AddField(
            model_name='clubmedicinediagnosis',
            name='disease_specific',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinediseasespecific'),
        ),
        migrations.AddField(
            model_name='usermedicinediagnosis',
            name='disease_nonspecific',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinediseasenonspecific'),
        ),
        migrations.AddField(
            model_name='usermedicinediagnosis',
            name='disease_specific',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='references.medicinediseasespecific'),
        ),
    ]
