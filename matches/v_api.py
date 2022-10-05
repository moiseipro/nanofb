from asyncio import events
from turtle import pos
from django.http import JsonResponse
from references.models import UserTeam
from events.models import UserEvent, ClubEvent
from matches.models import UserMatch, ClubMatch
from references.models import PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot
from datetime import datetime, date, timedelta
import json
import re


LANG_CODE_DEFAULT = "en"


def set_value_as_int(value, def_value = None):
    res = def_value
    try:
        res = int(value)
    except:
        pass
    return res


def set_value_as_datetime(value):
    format_ddmmyyyy = "%d/%m/%Y %H:%M:%S"
    format_yyyymmdd = "%Y-%m-%d %H:%M:%S"
    date1 = None
    date2 = None
    try:
        date1 = datetime.strptime(value, format_ddmmyyyy)
    except:
        pass
    try:
        date2 = datetime.strptime(value, format_yyyymmdd)
    except:
        pass
    if date1:
        value = date1
    elif date2:
        value = date2
    else:
        value = None
    return value   


def set_value_as_duration(value, only_mins=True):
    if not only_mins:
        m = re.match(r'(?P<h>\d+):(?P<m>\d+):'r'(?P<s>\d[\.\d+]*)', value)
        if not m:
            return timedelta()
        time_dict = {key: float(val) for key, val in m.groupdict().items()}
    else:
        mins_val = 0
        try:
            mins_val = int(value)
        except:
            pass
        time_dict = {'h': 0, 'm': mins_val, 's': 0}
    return timedelta(hours=time_dict['h'], minutes=time_dict['m'], seconds=time_dict['s'])


def get_date_str_from_datetime(datetime_obj, code):
    formats = {
        'en': "%Y-%m-%d",
        'ru': "%d/%m/%Y"
    }
    date_str = ""
    try:
        date_str = datetime_obj.strftime(formats[code])
    except:
        return None
    return date_str


def get_day_from_datetime(datetime_obj, code):
    days = {
        'ru': ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
        'en': ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
    day = None
    try:
        day = days[code][datetime_obj.weekday()]
    except:
        pass
    return day


def get_time_from_datetime(datetime_obj):
    time_str = None
    try:
        time_str = datetime_obj.strftime("%H:%M")
    except:
        pass
    return time_str


def get_duration_normal_format(timedelta_obj, only_mins=True):
    duration_str = None
    if not only_mins:
        try:
            t_arr = str(timedelta_obj).split(':')
            duration_str = "{:02}:{:02}:{:02}".format(int(t_arr[0]), int(t_arr[1]), int(t_arr[2]))
        except:
            pass
    else:
        try:
            mins_v = round(timedelta_obj.total_seconds() / 60)
            duration_str = f"{mins_v}"
        except:
            pass
    return duration_str


def get_match_result(data):
    # первый элемент - 0:Ничья, 1:Победа_1-ой_команды, 2:Победа_2-ой.
    # Второй элемент - 1: кол-во голов равно, 0:не равно.
    res = [-1, -1]
    try:
        if data['goals'] > data['o_goals']:
            res = [1, 0]
        elif data['goals'] < data['o_goals']:
            res = [2, 0]
        else:
            if data['penalty'] > data['o_penalty']:
                res = [1, 1]
            elif data['penalty'] < data['o_penalty']:
                res = [2, 1]
            else:
                res = [0, 1]
    except:
        pass
    return res



# --------------------------------------------------
# MATCHES API
def POST_edit_match(request, cur_user, cur_team):
    match_id = -1
    try:
        match_id = int(request.POST.get("id", -1))
    except:
        pass
    c_match = None
    access_denied = False
    c_team = None
    if access_denied:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    adding_mode = False
    c_datetime = set_value_as_datetime(f"{post_data['date']} {post_data['time']}:00")
    c_match = UserMatch.objects.filter(event_id=match_id, team_id=cur_team)
    if not c_match.exists() or c_match[0].event_id == None:
        adding_mode = True
        c_team = UserTeam.objects.filter(id=cur_team)
        if not c_team.exists() or c_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        try:
            if c_datetime:
                new_event = UserEvent(user_id=cur_user, date=c_datetime)
            else:
                new_event = UserEvent(user_id=cur_user)
            new_event.save()
        except:
            return JsonResponse({"errors": "Can't create event"}, status=400)
        c_match = UserMatch(team_id=c_team[0], event_id=new_event)
    else:
        c_match = c_match[0]
    if c_datetime:
        c_match.event_id.date = c_datetime
    c_match.duration = set_value_as_duration(post_data['duration'])
    c_match.goals = set_value_as_int(post_data['goals'], 0)
    c_match.penalty = set_value_as_int(post_data['penalty'], 0)
    c_match.opponent = post_data['opponent_name']
    c_match.o_goals = set_value_as_int(post_data['o_goals'], 0)
    c_match.o_penalty = set_value_as_int(post_data['o_penalty'], 0)
    c_match.place = post_data['place']
    c_match.tournament = post_data['tournament']
    c_match.m_type = set_value_as_int(post_data['m_type'], 0)
    c_match.m_format = post_data['m_format']
    if c_match == None:
        return JsonResponse({"err": "Match not found.", "success": False}, status=400)
    try:
        c_match.save()
        res_data = f'Match with id: [{c_match.event_id}] is added / edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit or add the match.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_match(request, cur_user, cur_team):
    match_id = -1
    try:
        match_id = int(request.POST.get("id", -1))
    except:
        pass
    c_event = None # deleting the event, delete and match
    access_denied = False
    if access_denied:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if not access_denied:
        c_event = UserEvent.objects.filter(id=match_id, user_id=cur_user)
    if c_event == None or not c_event.exists() or c_event[0].id == None:
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        try:
            c_event.delete()
            return JsonResponse({"data": {"id": match_id}, "success": True}, status=200)
        except:
            return JsonResponse({"errors": "Can't delete exercise"}, status=400)




def GET_get_match(request, cur_user, cur_team, return_JsonResponse=True):
    match_id = -1
    try:
        match_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = {}
    match = UserMatch.objects.filter(event_id=match_id, team_id=cur_team)
    if match.exists() and match[0].event_id != None:
        res_data = match.values()[0]
        res_data['date'] = get_date_str_from_datetime(match[0].event_id.date, LANG_CODE_DEFAULT)
        res_data['time'] = get_time_from_datetime(match[0].event_id.date)
        res_data['duration'] = get_duration_normal_format(match[0].duration)
        res_data['team_name'] = match[0].team_id.name
        res_data['opponent_name'] = match[0].opponent
        match_res = get_match_result(res_data)
        res_data['result'] = match_res[0]
        if return_JsonResponse:
            return JsonResponse({"data": res_data, "success": True}, status=200)
        else:
            return res_data
    if return_JsonResponse:
        return JsonResponse({"errors": "Player not found.", "success": False}, status=400)
    else:
        return None


