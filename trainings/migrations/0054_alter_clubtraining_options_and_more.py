# Generated by Django 4.0.4 on 2024-03-22 11:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trainings', '0053_clubtraining_is_personal_litetraining_is_personal_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='clubtraining',
            options={'permissions': [('analytics_clubtraining', 'Access to the section "Analytics" for ClubTraining'), ('individual_clubtraining', 'Access to the individual training mark for the club')]},
        ),
        migrations.AlterModelOptions(
            name='usertraining',
            options={'permissions': [('analytics_usertraining', 'Access to the section "Analytics" for UserTraining'), ('individual_usertraining', 'Access to the individual training mark for the user')]},
        ),
    ]
