from django.http import JsonResponse
from django.db.models import Sum, Q
from users.models import User
from matches.models import UserMatch, ClubMatch, UserProtocol, ClubProtocol
from trainings.models import UserTraining, ClubTraining, UserTrainingProtocol
from players.models import UserPlayer, ClubPlayer
from references.models import UserTeam, UserSeason, ClubTeam, ClubSeason
from exercises.models import UserFolder, ClubFolder
from datetime import datetime, date, timedelta
from dateutil.relativedelta  import relativedelta


LANG_CODE_DEFAULT = "en"



def get_by_language_code(value, code):
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


def get_exs_folders(cur_user, cur_team):
    res = []
    folders = UserFolder.objects.filter(Q(parent=0) | Q(parent=None), user=cur_user, team=cur_team)
    if folders.exists() and folders[0].id != None:
        res = folders
    return res


def months_between(start_date, end_date):
    year = start_date.year
    month = start_date.month
    while (year, month) <= (end_date.year, end_date.month):
        yield date(year, month, 1)
        if month == 12:
            month = 1
            year += 1
        else:
            month += 1


def get_season_months(request, season):
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
    f_season = UserSeason.objects.get(id=season)
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
    if not status or (status and "analytics" in status.tags and status.tags['analytics'] == 1):
        return True
    return False


# --------------------------------------------------
# ANALYTICS API
def POST_edit_analytics(request, cur_user, cur_team):
    return JsonResponse({"errors": "Can't edit analytics"}, status=400)


def GET_get_analytics_in_team(request, cur_user, cur_team, cur_session):
    res_data = {'players': {}}
    res_matches = {
        'matches_count': 0, 'matches_time': 0, 'matches_goals': 0, 'matches_penalty': 0, 'matches_pass': 0,
        'matches_red_card': 0, 'matches_yellow_card': 0, 'matches_estimation': 0, 'matches_estimation_count': 0, 
        'matches_dislike': 0, 'matches_like': 0
    }
    res_trainings = {
        'trainings_count': 0, 'trainings_time': 0, 'trainings_dislike': 0, 'trainings_like': 0,
        'trainings_exs_folders': {}, 'trainings_with_ball': 0, 'trainings_no_ball': 0
    }
    res_protocols = {
        'diseases_count': 0, 'injuries_count': 0, 'skip_count': 0, 'a_u_count': 0
    }
    players = UserPlayer.objects.filter(team=cur_team, user=cur_user)
    for player in players:
        res_data['players'][player.id] = {
            'name': f'{player.surname} {player.name}',
            'res_matches': {k: v for k, v in res_matches.items()}, 
            'res_trainings': {k: v for k, v in res_trainings.items()}, 
            'res_protocols': {k: v for k, v in res_protocols.items()}
        }
    season_type = None
    try:
        season_type = int(request.GET.get("season_type", 0))
    except:
        pass
    f_season = UserSeason.objects.get(id=cur_session, user_id=cur_user)
    if f_season and f_season.id != None:
        date_with = f_season.date_with
        date_by = f_season.date_by
        if season_type and season_type != 0:
            if season_type == -1:
                date_with = date.today() - timedelta(days=30)
                date_by = date.today()
            else:
                date_with = date_with + relativedelta(months=(season_type-1))
                date_with.replace(day=1)
                date_by = date_with + relativedelta(months=1)
        if date.today() < f_season.date_by:
            date_by = date.today()
        matches_protocols = UserProtocol.objects.filter(
            match_id__team_id=cur_team, match_id__event_id__user_id=cur_user,
            match_id__event_id__date__range=[
                datetime.combine(date_with, datetime.min.time()),
                datetime.combine(date_by, datetime.max.time())
            ],
        )
        player_data = None
        is_status_correct = False
        for m_protocol in matches_protocols:
            try:
                player_data = res_data['players'][m_protocol.player.id]
            except Exception as e:
                pass
            is_status_correct = check_protocol_status(m_protocol.p_status)
            if player_data:
                player_data['res_matches']['matches_count'] += 1
                if is_status_correct:
                    min_from = m_protocol.minute_from if m_protocol.minute_from else 0
                    min_to = m_protocol.minute_to if m_protocol.minute_to else 0
                    player_data['res_matches']['matches_time'] += min_to - min_from if min_to > 0 else 0
                    player_data['res_matches']['matches_goals'] += m_protocol.goal if m_protocol.goal else 0
                    player_data['res_matches']['matches_penalty'] += m_protocol.penalty if m_protocol.penalty else 0
                    player_data['res_matches']['matches_pass'] += m_protocol.p_pass if m_protocol.p_pass else 0
                    player_data['res_matches']['matches_red_card'] += m_protocol.red_card if m_protocol.red_card else 0
                    player_data['res_matches']['matches_yellow_card'] += m_protocol.yellow_card if m_protocol.yellow_card else 0
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
        player_data = None
        is_status_correct = False
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
                player_data['res_trainings']['trainings_count'] += 1
                if is_status_correct:
                    if t_protocol.estimation == 1:
                        player_data['res_trainings']['trainings_like'] += 1
                    if t_protocol.estimation == 2:
                        player_data['res_trainings']['trainings_dislike'] += 1
                    for t_exercise in t_protocol.training_exercise_check.all():
                        if t_exercise.exercise_id.ref_ball and t_exercise.exercise_id.ref_ball.name == "мяч":
                            player_data['res_trainings']['trainings_with_ball'] += 1
                        else:
                            player_data['res_trainings']['trainings_no_ball'] += 1
                        player_data['res_trainings']['trainings_time'] += t_exercise.duration
                        if not t_exercise.exercise_id.folder.id in player_data['res_trainings']['trainings_exs_folders']:
                            player_data['res_trainings']['trainings_exs_folders'][t_exercise.exercise_id.folder.id] = 0
                        player_data['res_trainings']['trainings_exs_folders'][t_exercise.exercise_id.folder.id] += 1
                else:
                    if "type_ill" in t_protocol.status.tags and t_protocol.status.tags['type_ill'] == 1:
                        player_data['res_protocols']['diseases_count'] += 1
                    if "type_injury" in t_protocol.status.tags and t_protocol.status.tags['type_injury'] == 1:
                        player_data['res_protocols']['injuries_count'] += 1
                    if "type_au" in t_protocol.status.tags and t_protocol.status.tags['type_au'] == 1:
                        player_data['res_protocols']['a_u_count'] += 1
                    if "type_skip" in t_protocol.status.tags and t_protocol.status.tags['type_skip'] == 1:
                        player_data['res_protocols']['skip_count'] += 1
    return JsonResponse({"data": res_data, "success": True}, status=200)

