import datetime
from django.utils import timezone

from django.db import IntegrityError
from rest_framework import serializers

from clubs.serializers import ClubSerializer
from exercises.models import UserExercise, ClubExercise
from notifications.models import NotificationUser
from players.models import ClubPlayer, UserPlayer
from references.models import ClubTeam, UserTeam
from users.models import User, UserPersonal, TrainerLicense
from django_countries.serializer_fields import CountryField
from django.utils.translation import gettext_lazy as _

from version.serializers import VersionSerializer, GroupSerializer


class TrainerLicenseSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)

    name = serializers.CharField()

    class Meta:
        model = TrainerLicense
        fields = [
            'id', 'name'
        ]

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    password2 = serializers.CharField(required=True)


class ClubUserEditPermission(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'user_permissions', 'groups'
        ]


class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    full_name = serializers.CharField(
        source='personal.full_name'
    )
    job_title = serializers.CharField(
        source='personal.job_title'
    )
    date_birthsday = serializers.DateField(
        source='personal.date_birthsday'
    )
    groups = GroupSerializer(read_only=True, many=True)

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'job_title', 'date_birthsday', 'days_entered', 'is_active', 'groups'
        ]
        datatables_always_serialize = ('id', 'groups')


class UserEditSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'club_id', 'p_version', 'is_archive', 'distributor'
        ]


class UserAdminEditSerializer(UserEditSerializer):

    class Meta(UserEditSerializer.Meta):
        pass

    Meta.fields += ('registration_to', 'is_demo_mode', 'team_limit', 'player_limit', 'is_superuser')


class UserPersonalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    country_id = CountryField()

    class Meta:
        model = UserPersonal
        fields = [
            'id', 'first_name', 'last_name', 'father_name', 'email_2', 'job_title', 'date_birthsday', 'country_id',
            'region', 'city', 'phone', 'phone_2', 'trainer_license', 'license', 'license_date', 'skype', 'club_title'
        ]


class UserAllDataSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    personal = UserPersonalSerializer()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'club_id', 'p_version', 'date_last_login', 'date_joined', 'days_entered', 'is_active',
            'registration_to', 'personal', 'is_archive', 'is_demo_mode', 'distributor', 'team_limit', 'player_limit',
            'is_superuser'
        ]


class CreateUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    personal = UserPersonalSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'club_id', 'email', 'password', 'personal'
        ]


class CreateUserManagementSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    email = serializers.EmailField()
    password = serializers.CharField()

    personal = serializers.PrimaryKeyRelatedField(queryset=UserPersonal.objects.all())
    #club_id = serializers.PrimaryKeyRelatedField(queryset=Club.objects.all())
    #p_version = serializers.PrimaryKeyRelatedField(queryset=Version.objects.all())

    class Meta:
        model = User
        fields = [
            'id', 'club_id', 'email', 'password', 'personal', 'p_version'
        ]

    def perform_create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        user.save()

        return user

    def create(self, validated_data):
        try:
            user = self.perform_create(validated_data)
        except IntegrityError:
            self.fail("cannot_create_user")

        return user


class UserManagementSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    last_name = serializers.CharField(
        source="personal.last_name"
    )
    first_name = serializers.CharField(
        source="personal.first_name"
    )
    job_title = serializers.CharField(
        source="personal.job_title"
    )
    date_birthsday = serializers.DateField(
        source="personal.date_birthsday"
    )
    age = serializers.SerializerMethodField()
    trainer_license = TrainerLicenseSerializer(
        source="personal.trainer_license"
    )
    license = serializers.SerializerMethodField()
    license_date = serializers.DateField(
        source="personal.license_date"
    )
    phone = serializers.CharField(
        source="personal.phone"
    )
    club_name = serializers.CharField(
        source="club_id.name",
        default="---"
    )
    club_id = ClubSerializer()
    club_registration_to = serializers.DateField(
        source="club_id.date_registration_to",
        default=""
    )
    club_title = serializers.CharField(
        source="personal.club_title"
    )
    p_version = VersionSerializer()
    flag = serializers.CharField(
        source="personal.country_id.flag"
    )
    region = serializers.CharField(
        source="personal.region"
    )

    groups = GroupSerializer(read_only=True, many=True)

    admin_type = serializers.SerializerMethodField()

    activation = serializers.SerializerMethodField()

    exercises = serializers.SerializerMethodField()

    teams = serializers.SerializerMethodField()

    online = serializers.SerializerMethodField()

    teams_players = serializers.SerializerMethodField()

    teams_players_fact = serializers.SerializerMethodField()

    access_to = serializers.SerializerMethodField()

    notifications_count = serializers.SerializerMethodField()

    def get_license(self, user):
        license_name = ''
        if user.personal.trainer_license is not None:
            license_name += user.personal.trainer_license.name
        if user.personal.license is not None:
            license_name += ' ' + user.personal.license
        return license_name

    def get_admin_type(self, user):
        admin_types = ''
        if user.is_superuser:
            admin_types += _("MA")
        if user.club_id is not None and user.has_perm('clubs.club_admin'):
            admin_types += _("CA")
        return admin_types

    def get_age(self, user):
        today = datetime.date.today()
        birthday = user.personal.date_birthsday
        age = today.year-birthday.year
        if birthday.month >= today.month and birthday.day > today.day:
            age -= 1
        return age

    def get_activation(self, user):
        active_status = {'type': '', 'status': ''}
        if user.is_active:
            active_status['type'] = 'success'
            active_status['status'] = _("Active")
            if user.is_archive == 1:
                active_status['type'] = 'warning'
                active_status['status'] = _("Archive")
            elif user.club_id is not None:
                if user.club_id.date_registration_to < datetime.date.today():
                    active_status['type'] = 'danger'
                    active_status['status'] = _("Club license expired")
            else:
                if user.registration_to < datetime.date.today():
                    active_status['type'] = 'danger'
                    active_status['status'] = _("License expired")

        else:
            active_status['type'] = 'danger'
            active_status['status'] = _("Not active")
        return active_status

    def get_exercises(self, user):
        exercise_count = UserExercise.objects.filter(user_id=user.id).count()
        club_exercise_count = ClubExercise.objects.filter(user_id=user.id).count()
        return str(exercise_count) + ' / ' + str(club_exercise_count)

    def get_teams(self, user):
        teams_data = ''
        if user.club_id is not None:
            teams = ClubTeam.objects.filter(club_id=user.club_id, users=user)
            first = True
            for team in teams:
                if first:
                    first = False
                    teams_data = team.name
                else:
                    teams_data += ', ' + team.name
        return teams_data

    def get_online(self, user):
        now = timezone.now()
        then = user.date_last_login
        if then is None:
            return '...'
        tdelta = now - then
        minutes = round(tdelta.total_seconds() / 60)
        if minutes < 5:
            return '<span class="text-danger">'+_('Online')+'</span>'
        elif minutes < 60:
            return minutes
        else:
            return '> 60'

    def get_teams_players(self, user):
        data = ''
        if user.club_id is not None:
            teams = user.club_id.team_limit
            players = user.club_id.player_limit
        else:
            # if user.p_version is not None:
            #     teams = user.p_version.team_limit
            #     players = user.p_version.player_limit
            # else:
            teams = user.team_limit
            players = user.player_limit
        data += str(teams) + ' / ' + str(players)
        return data

    def get_teams_players_fact(self, user):
        data = ''
        if user.club_id is not None:
            teams = ClubTeam.objects.filter(users=user)
            players = ClubPlayer.objects.filter(team__in=teams)
        else:
            teams = UserTeam.objects.filter(user_id=user)
            players = UserPlayer.objects.filter(team__in=teams)
        data += str(teams.count()) + ' / ' + str(players.count())
        return data

    def get_access_to(self, user):
        now = datetime.date.today()
        if user.club_id is not None:
            then = user.club_id.date_registration_to
        else:
            then = user.registration_to
        if then is None:
            return '...'
        tdelta = then-now
        days = tdelta.days
        strdate = then.strftime('%d/%m/%Y')
        if days < 0:
            return strdate + ' (<span class="text-danger">' + str(days) + '</span>)'
        if days <= 14:
            return strdate + ' (<span class="text-warning">' + str(days) + '</span>)'
        elif days <= 30:
            return strdate + ' (<span class="text-info">' + str(days) + '</span>)'
        else:
            return strdate

    def get_notifications_count(self, user):
        notifications = NotificationUser.objects.filter(user=user)
        data = str(notifications.count())
        return data

    class Meta:
        model = User
        fields = [
            'id', 'email', 'days_entered', 'is_active', 'admin_type', 'p_version', 'registration_to', 'groups',
            'last_name', 'first_name', 'job_title', 'date_birthsday', 'age', 'access_to',
            'trainer_license', 'license', 'license_date', 'flag', 'distributor', 'date_joined', 'club_title',
            'activation', 'club_name', 'club_registration_to', 'is_archive', 'date_joined', 'phone', 'date_last_login',
            'region', 'club_id', 'exercises', 'teams', 'online', 'teams_players', 'teams_players_fact',
            'notifications_count'
        ]
        datatables_always_serialize = ('id', 'groups', 'trainer_license', 'club_registration_to', 'is_archive')
