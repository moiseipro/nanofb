from users.models import UserPersonal
from clubs.models import Club


class UserDatabaseRouter:
    def db_for_read(self, model, **hints):
        if model == UserPersonal:
            club_id = hints.get('club_id')
            if club_id is not None:
                try:
                    club = Club.objects.get(pk=club_id)
                    return club.separate_database if club.separate_database else 'default'
                except Club.DoesNotExist:
                    return 'default'
        return 'default'

    def db_for_write(self, model, **hints):
        if model == UserPersonal:
            club_id = hints.get('club_id')
            if club_id is not None:
                try:
                    club = Club.objects.get(pk=club_id)
                    return club.separate_database if club.separate_database else 'default'
                except Club.DoesNotExist:
                    return 'default'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return obj1._state.db == obj2._state.db

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == 'default'
