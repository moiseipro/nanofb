# Generated by Django 4.0.4 on 2022-05-12 14:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('version', '0002_access_tag_section_tag_alter_version_tag'),
    ]

    operations = [
        migrations.AlterField(
            model_name='versionaccess',
            name='version_id',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='version.version'),
        ),
    ]
