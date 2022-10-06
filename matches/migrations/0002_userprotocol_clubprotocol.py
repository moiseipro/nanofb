# Generated by Django 4.0.4 on 2022-10-05 09:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0015_playerquestionnairesrows_playerquestionnaireuser_and_more'),
        ('matches', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProtocol',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('minute_from', models.SmallIntegerField(blank=True, null=True)),
                ('minute_to', models.SmallIntegerField(blank=True, null=True)),
                ('goal', models.SmallIntegerField(blank=True, null=True)),
                ('penalty', models.SmallIntegerField(blank=True, null=True)),
                ('p_pass', models.SmallIntegerField(blank=True, null=True)),
                ('yellow_card', models.SmallIntegerField(blank=True, null=True)),
                ('red_card', models.SmallIntegerField(blank=True, null=True)),
                ('estimation', models.SmallIntegerField(blank=True, null=True)),
                ('like', models.BooleanField(default=False)),
                ('dislike', models.BooleanField(default=False)),
                ('match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='matches.usermatch')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='players.userplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ClubProtocol',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('minute_from', models.SmallIntegerField(blank=True, null=True)),
                ('minute_to', models.SmallIntegerField(blank=True, null=True)),
                ('goal', models.SmallIntegerField(blank=True, null=True)),
                ('penalty', models.SmallIntegerField(blank=True, null=True)),
                ('p_pass', models.SmallIntegerField(blank=True, null=True)),
                ('yellow_card', models.SmallIntegerField(blank=True, null=True)),
                ('red_card', models.SmallIntegerField(blank=True, null=True)),
                ('estimation', models.SmallIntegerField(blank=True, null=True)),
                ('like', models.BooleanField(default=False)),
                ('dislike', models.BooleanField(default=False)),
                ('match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='matches.clubmatch')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='players.clubplayer')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
