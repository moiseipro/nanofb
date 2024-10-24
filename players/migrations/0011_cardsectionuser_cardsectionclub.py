# Generated by Django 4.0.4 on 2022-09-12 13:58

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('references', '0012_playerfoot_playerlevel_playerplayerstatus_and_more'),
        ('players', '0010_playercard_clubplayer_card_userplayer_card'),
    ]

    operations = [
        migrations.CreateModel(
            name='CardSectionUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='players.cardsection')),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='references.userteam')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='CardSectionClub',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='players.cardsection')),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='references.clubteam')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
