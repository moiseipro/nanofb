from django.http import JsonResponse
from django.db.models import Sum, Q
from django.core.cache import cache
from users.models import User
from matches.models import UserMatch, ClubMatch, UserProtocol, ClubProtocol
from trainings.models import UserTraining, ClubTraining, UserTrainingProtocol, ClubTrainingProtocol
from players.models import UserPlayer, ClubPlayer
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason
from exercises.models import UserFolder, ClubFolder
from nanofootball.views import util_check_access
from datetime import datetime, date, timedelta
from dateutil.relativedelta  import relativedelta
import json


LANG_CODE_DEFAULT = "en"
CACHE_EXPIRES_SECS = 60*60*24



def get_by_language_code(value, code):
    """
    Return a value by current language's code.

    :param value: Dictionary with structure("code_1": "value_1",...) for different languages. Usually "value" is STRING.
    :type value: dict[str]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :raise None. In case of an exception, the result: "". 
        If it was not possible to find the desired value by the key, then an attempt will be made to take the default (LANG_CODE_DEFAULT).
    :return: Value, depending on the current language.
    :rtype: [str]

    """
    res = ""
    try:
        res = value[code]
    except:
        pass
    if res == "":
        try:
            res = value[LANG_CODE_DEFAULT]
        except:
            pass
    return res


def get_exs_folders(request, cur_user, cur_team):
    """
    Return a list of Model.UserFolder or Model.ClubFolder depending on current version.

    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :raise None. In case of any error, the result: [].
    :return: Empty list or list of exercises' folders.
    :rtype: list[Model.object[UserFolder]]

    """
    res = []
    folders = None
    if request.user.club_id is not None:
        folders = ClubFolder.objects.filter(Q(parent=0) | Q(parent=None), club=request.user.club_id)
    else:
        folders = UserFolder.objects.filter(Q(parent=0) | Q(parent=None), user=cur_user, team=cur_team)
    if folders is not None and folders.exists() and folders[0].id != None:
        for folder in folders:
            subfolders = []
            if request.user.club_id is not None:
                subfolders = ClubFolder.objects.filter(parent=folder.id)
            else:
                subfolders = UserFolder.objects.filter(parent=folder.id)
            setattr(folder, "subfolders", subfolders)
    if folders is not None and folders.exists() and folders[0].id != None:
        res = folders
    return res


def months_between(start_date, end_date):
    """
    Return every first day of the month from start date to end date as DATE. Using yield.

    :param start_date: Start date of required range.
    :type start_date: [date]
    :param end_date: End date of required range.
    :type end_date: [date]
    :raise AttributeError. In case "start_date" or "end_date" not DATE, result: exception.
    :return: Every first day of the month from start date to end date.
    :rtype: yield[date]

    """
    year = start_date.year
    month = start_date.month
    while (year, month) <= (end_date.year, end_date.month):
        yield date(year, month, 1)
        if month == 12:
            month = 1
            year += 1
        else:
            month += 1


def get_season_months(request, season, c_user):
    """
    Return list of objects, which contains full name of month and short 3 letter word. Names of months selected by current system's language.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param season: Season's ID.
    :type season: [int]
    :raise None. In case of any error, result: [].
    :return: List of current selected season's months. (Example: [{'name': "January", 'short': "Jan"},...]) or empty list
    :rtype: list[{'name': [str], 'short': [str]}]

    """
    months_defs = {
        'en': {
            '01': "January", '02': "February", '03': "March", '04': "April", '05': "May", '06': "June", '07': "July", 
            '08': "August", '09': "September", '10': "October", '11': "November", '12': "December"
        },
        'ru' : {
            '01': "Январь", '02': "Февраль", '03': "Март", '04': "Апрель", '05': "Май", '06': "Июнь", '07': "Июль", 
            '08': "Август", '09': "Сентябрь", '10': "Октябрь", '11': "Ноябрь", '12': "Декабрь"
        }
    }
    res = []
    f_season = None
    if request.user.club_id is not None:
        f_season = ClubSeason.objects.filter(id=season, club_id=request.user.club_id).first()
    else:
        f_season = UserSeason.objects.filter(id=season, user_id=c_user).first()
    if f_season and f_season.id != None:
        for month in months_between(f_season.date_with, f_season.date_by):
            month_id = month.strftime("%m")
            month_name = ""
            if not request.LANGUAGE_CODE in months_defs:
                month_name = months_defs[LANG_CODE_DEFAULT][month_id]
            else:
                month_name = months_defs[request.LANGUAGE_CODE][month_id]
            res.append({'name': month_name, 'short': month_name[:3]})
    return res


def check_protocol_status(status):
    """
    Return True or False, if tag "analytics" is 1 in status, then True, else False.

    :param status: Protocol status.
    :type status: Model.object[PlayerProtocolStatus]
    :return: If tag "analytics" is 1 in status, then True, else False.
    :rtype: [bool]

    """
    if not status or (status and "analytics" in status.tags and status.tags['analytics'] == 1):
        return True
    return False


# --------------------------------------------------
# ANALYTICS API
def POST_edit_analytics(request, cur_user, cur_team):
    """
    Template POST API FUNC

    """
    return JsonResponse({"errors": "Can't edit analytics"}, status=400)


def POST_reset_cache(request, cur_user, cur_team, cur_season):
    """
    Template POST API FUNC

    """
    season_type = None
    try:
        season_type = int(request.POST.get("season_type", 0))
    except:
        pass
    if season_type == 0:
        season_type = None
    status = None
    if request.user.club_id is not None:
        status = cache.delete(f'analytics_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}')
        cache.delete(f'analytics_by_folders_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}')
        cache.delete(f'analytics_by_folders_full_club_{request.user.club_id.id}_{cur_team}_{cur_season}_None')
    else:
        status = cache.delete(f'analytics_{cur_user}_{cur_team}_{cur_season}_{season_type}')
        cache.delete(f'analytics_by_folders_{cur_user}_{cur_team}_{cur_season}_{season_type}')
        cache.delete(f'analytics_by_folders_full_{cur_user}_{cur_team}_{cur_season}_None')
    res_data = "Cached data deleted successfully!"
    if not status:
        res_data = "Cached data has not been deleted. Not found or another reason."
    return JsonResponse({"data": res_data, "success": True}, status=200)



def GET_get_analytics_in_team(request, cur_user, cur_team, cur_season):
    """
    Return JsonResponse which contains dictionary with players. Each object is a dictionary, where the key is what we consider, 
    and the value, respectively, is its value.
    Use cached data (stored at Database), if this data was expired by CACHE_EXPIRES_SECS, then server calculates actual values.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param cur_season: Current season's ID.
    :type cur_season: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
        "Data" example:
        {
            'players': {
                '[player_id -> int]': {
                    'matches_count: 0,
                    'matches_time: 0,
                    'matches_goals: 0,
                    ...
                }
                ...
            }
        }
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    res_data = {'players': {}}
    res_matches = {
        'matches_count': 0, 'matches_time': 0, 'matches_goals': 0, 'matches_penalty': 0, 'matches_pass': 0,
        'matches_red_card': 0, 'matches_yellow_card': 0, 'matches_estimation': 0, 'matches_estimation_count': 0, 
        'matches_dislike': 0, 'matches_like': 0, 'matches_captains': 0
    }
    res_trainings = {
        'trainings_count': 0, 'trainings_time': 0, 'trainings_dislike': 0, 'trainings_like': 0,
        'trainings_exs_folders': {}, 'trainings_with_ball': 0, 'trainings_no_ball': 0
    }
    res_protocols = {
        'diseases_count': 0, 'injuries_count': 0, 'skip_count': 0, 'a_u_count': 0, 'disqualification_count': 0
    }
    players = []
    if request.user.club_id is not None:
        players = ClubPlayer.objects.filter(team=cur_team)
    else:
        players = UserPlayer.objects.filter(team=cur_team, user=cur_user)
    for player in players:
        res_data['players'][player.id] = {
            'name': f'{player.surname} {player.name}',
            'res_matches': json.loads(json.dumps(res_matches)), 
            'res_trainings': json.loads(json.dumps(res_trainings)), 
            'res_protocols': json.loads(json.dumps(res_protocols))
        }
    season_type = None
    try:
        season_type = int(request.GET.get("season_type", 0))
    except:
        pass
    f_season = None
    if request.user.club_id is not None:
        f_season = ClubSeason.objects.get(id=cur_season, club_id=request.user.club_id)
    else:
        f_season = UserSeason.objects.get(id=cur_season, user_id=cur_user)
    if f_season and f_season.id != None:
        cached_data = None
        if request.user.club_id is not None:
            cached_data = cache.get(f'analytics_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}')
        else:
            cached_data = cache.get(f'analytics_{cur_user}_{cur_team}_{cur_season}_{season_type}')
        if cached_data is None:
            date_with = f_season.date_with
            date_by = f_season.date_by
            if season_type and season_type != 0:
                if season_type == -1:
                    date_with = date.today() - timedelta(days=30)
                    date_by = date.today()
                else:
                    date_with = date_with + relativedelta(months=(season_type-1))
                    date_with.replace(day=1)
                    date_by = date_with + relativedelta(months=1) - relativedelta(days=1)
                    if date.today() < date_by:
                        date_by = date.today()
            else:
                if date.today() < f_season.date_by:
                    date_by = date.today()
            matches_protocols = []
            if util_check_access(cur_user, {
                'perms_user': ["matches.analytics_usermatch"],
                'perms_club': ["matches.analytics_clubmatch"]
            }):
                if request.user.club_id is not None:
                    matches_protocols = ClubProtocol.objects.filter(
                        # match_id__team_id=cur_team,
                        match_id__event_id__club_id=request.user.club_id,
                        match_id__event_id__date__range=[
                            datetime.combine(date_with, datetime.min.time()),
                            datetime.combine(date_by, datetime.max.time())
                        ],
                    )
                else:
                    matches_protocols = UserProtocol.objects.filter(
                        # match_id__team_id=cur_team,
                        match_id__event_id__user_id=cur_user,
                        match_id__event_id__date__range=[
                            datetime.combine(date_with, datetime.min.time()),
                            datetime.combine(date_by, datetime.max.time())
                        ],
                    )
            is_status_correct = False
            for m_protocol in matches_protocols:
                player_data = None
                try:
                    player_data = res_data['players'][m_protocol.player.id]
                except Exception as e:
                    pass
                is_status_correct = check_protocol_status(m_protocol.p_status)
                if player_data:
                    if is_status_correct:
                        min_from = m_protocol.minute_from if m_protocol.minute_from else 0
                        min_to = m_protocol.minute_to if m_protocol.minute_to else 0
                        if min_to - min_from > 0:
                            player_data['res_matches']['matches_count'] += 1
                            player_data['res_matches']['matches_time'] += min_to - min_from + 1 if min_to > 0 else 0
                            player_data['res_matches']['matches_goals'] += m_protocol.goal if m_protocol.goal else 0
                            player_data['res_matches']['matches_penalty'] += m_protocol.penalty if m_protocol.penalty else 0
                            player_data['res_matches']['matches_pass'] += m_protocol.p_pass if m_protocol.p_pass else 0
                            player_data['res_matches']['matches_red_card'] += m_protocol.red_card if m_protocol.red_card else 0
                            player_data['res_matches']['matches_yellow_card'] += m_protocol.yellow_card if m_protocol.yellow_card else 0
                            player_data['res_matches']['matches_captains'] += 1 if m_protocol.is_captain == True else 0
                            if m_protocol.estimation:
                                player_data['res_matches']['matches_estimation'] += m_protocol.estimation
                                player_data['res_matches']['matches_estimation_count'] += 1
                            player_data['res_matches']['matches_dislike'] += m_protocol.dislike if m_protocol.dislike else 0
                            player_data['res_matches']['matches_like'] += m_protocol.like if m_protocol.like else 0
                    else:
                        if "type_ill" in m_protocol.p_status.tags and m_protocol.p_status.tags['type_ill'] == 1:
                            player_data['res_protocols']['diseases_count'] += 1
                        if "type_injury" in m_protocol.p_status.tags and m_protocol.p_status.tags['type_injury'] == 1:
                            player_data['res_protocols']['injuries_count'] += 1
                        if "type_au" in m_protocol.p_status.tags and m_protocol.p_status.tags['type_au'] == 1:
                            player_data['res_protocols']['a_u_count'] += 1
                        if "type_skip" in m_protocol.p_status.tags and m_protocol.p_status.tags['type_skip'] == 1:
                            player_data['res_protocols']['skip_count'] += 1
                        if "type_disqualification" in m_protocol.p_status.tags and m_protocol.p_status.tags['type_disqualification'] == 1:
                            player_data['res_protocols']['disqualification_count'] += 1
            is_status_correct = False
            trainings_protocols = []
            if util_check_access(cur_user, {
                'perms_user': ["trainings.analytics_usertraining"],
                'perms_club': ["trainings.analytics_clubtraining"]
            }):
                if request.user.club_id is not None:
                    trainings_protocols = ClubTrainingProtocol.objects.filter(
                        # training_id__team_id=cur_team,
                        training_id__event_id__club_id=request.user.club_id,
                        training_id__event_id__date__range=[
                            datetime.combine(date_with, datetime.min.time()),
                            datetime.combine(date_by, datetime.max.time())
                        ],
                    )
                else:
                    trainings_protocols = UserTrainingProtocol.objects.filter(
                        # training_id__team_id=cur_team,
                        training_id__event_id__user_id=cur_user,
                        training_id__event_id__date__range=[
                            datetime.combine(date_with, datetime.min.time()),
                            datetime.combine(date_by, datetime.max.time())
                        ],
                    )
            for t_protocol in trainings_protocols:
                player_data = None
                try:
                    player_data = res_data['players'][t_protocol.player_id.id]
                except Exception as e:
                    pass
                is_status_correct = check_protocol_status(t_protocol.status)
                if player_data:
                    if is_status_correct:
                        training_full_time = 0
                        for t_exercise in t_protocol.training_exercise_check.all():
                            if t_exercise.exercise_id.ref_ball and t_exercise.exercise_id.ref_ball.name == "мяч":
                                player_data['res_trainings']['trainings_with_ball'] += 1
                            else:
                                player_data['res_trainings']['trainings_no_ball'] += 1
                            player_data['res_trainings']['trainings_time'] += t_exercise.duration
                            training_full_time += t_exercise.duration
                            if not t_exercise.exercise_id.folder.parent in player_data['res_trainings']['trainings_exs_folders']:
                                player_data['res_trainings']['trainings_exs_folders'][t_exercise.exercise_id.folder.parent] = 0
                            player_data['res_trainings']['trainings_exs_folders'][t_exercise.exercise_id.folder.parent] += 1
                        if training_full_time > 0:
                            player_data['res_trainings']['trainings_count'] += 1
                            if t_protocol.estimation == 2:
                                player_data['res_trainings']['trainings_like'] += 1
                            if t_protocol.estimation == 1:
                                player_data['res_trainings']['trainings_dislike'] += 1
                    else:
                        if "type_ill" in t_protocol.status.tags and t_protocol.status.tags['type_ill'] == 1:
                            player_data['res_protocols']['diseases_count'] += 1
                        if "type_injury" in t_protocol.status.tags and t_protocol.status.tags['type_injury'] == 1:
                            player_data['res_protocols']['injuries_count'] += 1
                        if "type_au" in t_protocol.status.tags and t_protocol.status.tags['type_au'] == 1:
                            player_data['res_protocols']['a_u_count'] += 1
                        if "type_skip" in t_protocol.status.tags and t_protocol.status.tags['type_skip'] == 1:
                            player_data['res_protocols']['skip_count'] += 1
                        if "type_disqualification" in t_protocol.status.tags and t_protocol.status.tags['type_disqualification'] == 1:
                            player_data['res_protocols']['disqualification_count'] += 1
            if request.user.club_id is not None:
                cache.set(f'analytics_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}', res_data, CACHE_EXPIRES_SECS)
            else:
                cache.set(f'analytics_{cur_user}_{cur_team}_{cur_season}_{season_type}', res_data, CACHE_EXPIRES_SECS)
        else:
            res_data = cached_data
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_analytics_by_folders_in_team(request, cur_user, cur_team, cur_season):
    """
    Return JsonResponse which contains dictionary with players. Each object is a dictionary, where the key is what we consider, 
    and the value, respectively, is its value.
    Use cached data (stored at Database), if this data was expired by CACHE_EXPIRES_SECS, then server calculates actual values.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param cur_season: Current season's ID.
    :type cur_season: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    res_data = {'players': {}}
    res_trainings = {
        'trainings_exs_folders': {}
    }
    players = []
    if request.user.club_id is not None:
        players = ClubPlayer.objects.filter(team=cur_team)
    else:
        players = UserPlayer.objects.filter(team=cur_team, user=cur_user)
    for player in players:
        res_data['players'][player.id] = {
            'name': f'{player.surname} {player.name}',
            'res_trainings': json.loads(json.dumps(res_trainings))
        }
    season_type = None
    try:
        season_type = int(request.GET.get("season_type", 0))
    except:
        pass
    f_season = None
    if request.user.club_id is not None:
        f_season = ClubSeason.objects.get(id=cur_season, club_id=request.user.club_id)
    else:
        f_season = UserSeason.objects.get(id=cur_season, user_id=cur_user)
    if f_season and f_season.id != None:
        cached_data = None
        if request.user.club_id is not None:
            cached_data = cache.get(f'analytics_by_folders_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}')
        else:
            cached_data = cache.get(f'analytics_by_folders_{cur_user}_{cur_team}_{cur_season}_{season_type}')
        if cached_data is None:
            date_with = f_season.date_with
            date_by = f_season.date_by
            if season_type and season_type != 0:
                if season_type == -1:
                    date_with = date.today() - timedelta(days=30)
                    date_by = date.today()
                else:
                    date_with = date_with + relativedelta(months=(season_type-1))
                    date_with.replace(day=1)
                    date_by = date_with + relativedelta(months=1) - relativedelta(days=1)
                    if date.today() < date_by:
                        date_by = date.today()
            else:
                if date.today() < f_season.date_by:
                    date_by = date.today()
            player_data = None
            is_status_correct = False
            trainings_protocols = []
            if util_check_access(cur_user, {
                'perms_user': ["trainings.analytics_usertraining"],
                'perms_club': ["trainings.analytics_clubtraining"]
            }):
                if request.user.club_id is not None:
                    trainings_protocols = ClubTrainingProtocol.objects.filter(
                        training_id__team_id=cur_team,
                        training_id__event_id__date__range=[
                            datetime.combine(date_with, datetime.min.time()),
                            datetime.combine(date_by, datetime.max.time())
                        ],
                    )
                else:
                    trainings_protocols = UserTrainingProtocol.objects.filter(
                        training_id__team_id=cur_team, training_id__event_id__user_id=cur_user,
                        training_id__event_id__date__range=[
                            datetime.combine(date_with, datetime.min.time()),
                            datetime.combine(date_by, datetime.max.time())
                        ],
                    )
            for t_protocol in trainings_protocols:
                try:
                    player_data = res_data['players'][t_protocol.player_id.id]
                except Exception as e:
                    pass
                is_status_correct = check_protocol_status(t_protocol.status)
                if player_data:
                    if is_status_correct:
                        for t_exercise in t_protocol.training_exercise_check.all():
                            if not t_exercise.exercise_id.folder.id in player_data['res_trainings']['trainings_exs_folders']:
                                player_data['res_trainings']['trainings_exs_folders'][t_exercise.exercise_id.folder.id] = 0
                            player_data['res_trainings']['trainings_exs_folders'][t_exercise.exercise_id.folder.id] += 1
            if request.user.club_id is not None:
                cache.set(f'analytics_by_folders_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}', res_data, CACHE_EXPIRES_SECS)
            else:
                cache.set(f'analytics_by_folders_{cur_user}_{cur_team}_{cur_season}_{season_type}', res_data, CACHE_EXPIRES_SECS)
        else:
            res_data = cached_data
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_analytics_by_folders_full_in_team(request, cur_user, cur_team, cur_season):
    """
    Return JsonResponse which contains dictionary with seasons. Each object is a dictionary, where the key is what we consider, 
    and the value, respectively, is its value.
    Use cached data (stored at Database), if this data was expired by CACHE_EXPIRES_SECS, then server calculates actual values.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param cur_season: Current season's ID.
    :type cur_season: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    res_data = {'months': {}}
    season_type = None
    s_months = get_season_months(request, cur_season, cur_user)
    for index in range(len(s_months)):
        s_months[index]['id'] = index + 1
    s_months.insert(0, {'name': "30 дней", 'short': "30", 'id': -1})
    f_season = None
    if request.user.club_id is not None:
        f_season = ClubSeason.objects.get(id=cur_season, club_id=request.user.club_id)
    else:
        f_season = UserSeason.objects.get(id=cur_season, user_id=cur_user)
    if f_season and f_season.id != None:
        cached_data = None
        if request.user.club_id is not None:
            cached_data = cache.get(f'analytics_by_folders_full_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}')
        else:
            cached_data = cache.get(f'analytics_by_folders_full_{cur_user}_{cur_team}_{cur_season}_{season_type}')
        if cached_data is None:
            for s_month in s_months:
                res_data['months'][s_month['id']] = {
                    'name': s_month['name'],
                    'short_name': s_month['short'],
                    'trainings_exs_folders': {},
                    'trainings_exs_subfolders': {}
                }
                date_with = f_season.date_with
                date_by = f_season.date_by
                if s_month['id'] and s_month['id'] != 0:
                    if season_type == -1:
                        date_with = date.today() - timedelta(days=30)
                        date_by = date.today()
                    else:
                        date_with = date_with + relativedelta(months=(s_month['id']-1))
                        date_with.replace(day=1)
                        date_by = date_with + relativedelta(months=1) - relativedelta(days=1)
                        if date.today() < date_by:
                            date_by = date.today()
                else:
                    if date.today() < f_season.date_by:
                        date_by = date.today()
                is_status_correct = False
                trainings_protocols = []
                if util_check_access(cur_user, {
                    'perms_user': ["trainings.analytics_usertraining"],
                    'perms_club': ["trainings.analytics_clubtraining"]
                }):
                    if request.user.club_id is not None:
                        trainings_protocols = ClubTrainingProtocol.objects.filter(
                            training_id__team_id=cur_team,
                            training_id__event_id__date__range=[
                                datetime.combine(date_with, datetime.min.time()),
                                datetime.combine(date_by, datetime.max.time())
                            ],
                        )
                    else:
                        trainings_protocols = UserTrainingProtocol.objects.filter(
                            training_id__team_id=cur_team, training_id__event_id__user_id=cur_user,
                            training_id__event_id__date__range=[
                                datetime.combine(date_with, datetime.min.time()),
                                datetime.combine(date_by, datetime.max.time())
                            ],
                        )
                for t_protocol in trainings_protocols:
                    is_status_correct = check_protocol_status(t_protocol.status)
                    if is_status_correct:
                        for t_exercise in t_protocol.training_exercise_check.all():
                            if not t_exercise.exercise_id.folder.parent in res_data['months'][s_month['id']]['trainings_exs_folders']:
                                res_data['months'][s_month['id']]['trainings_exs_folders'][t_exercise.exercise_id.folder.parent] = 0
                            res_data['months'][s_month['id']]['trainings_exs_folders'][t_exercise.exercise_id.folder.parent] += 1
                            if not t_exercise.exercise_id.folder.id in res_data['months'][s_month['id']]['trainings_exs_subfolders']:
                                res_data['months'][s_month['id']]['trainings_exs_subfolders'][t_exercise.exercise_id.folder.id] = 0
                            res_data['months'][s_month['id']]['trainings_exs_subfolders'][t_exercise.exercise_id.folder.id] += 1
            if request.user.club_id is not None:
                cache.set(f'analytics_by_folders_full_club_{request.user.club_id.id}_{cur_team}_{cur_season}_{season_type}', res_data, CACHE_EXPIRES_SECS)
            else:
                cache.set(f'analytics_by_folders_full_{cur_user}_{cur_team}_{cur_season}_{season_type}', res_data, CACHE_EXPIRES_SECS)
        else:
            res_data = cached_data
    return JsonResponse({"data": res_data, "success": True}, status=200)



