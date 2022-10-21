from django.http import JsonResponse
from django.forms.models import model_to_dict
import json
import re
from datetime import datetime, date, timedelta
from references.models import UserTeam, ClubTeam
from events.models import UserEvent, ClubEvent, EventVideoLink
from matches.models import UserMatch, ClubMatch, UserProtocol, ClubProtocol
from references.models import PlayerProtocolStatus
from players.models import UserPlayer, ClubPlayer


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


def get_protocol_status(request, elem):
    res = {'full': "", 'short': ""}
    if elem and elem.translation_names:
        if elem.translation_names[request.LANGUAGE_CODE]:
            res["full"] = elem.translation_names[request.LANGUAGE_CODE]
        else:
            res["full"] = elem.translation_names[request.LANG_CODE_DEFAULT]
    if elem and elem.short_name:
        res["short"] = elem.short_name
    return res


def set_refs_translations(data, lang_code):
    for key in data:
        elems = data[key]
        for elem in elems:
            title = get_by_language_code(elem['translation_names'], lang_code)
            elem['title'] = title if title != "" else elem['name']
    return data


def get_matches_refs(request):
    refs = {}
    refs['player_protocol_status'] = PlayerProtocolStatus.objects.filter(tags__matches=1).values()
    for elem in refs['player_protocol_status']:
        elem['is_red'] = "matches_red" in elem['tags'] and elem['tags']['matches_red'] == 1
    refs = set_refs_translations(refs, request.LANGUAGE_CODE)
    return refs


def count_videos(data):
    counter = 0
    if data and data['links'] and isinstance(data['links'], list):
        for elem in data['links']:
            if elem != "":
                counter += 1
    return counter



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


def POST_edit_players_protocol(request, cur_user):
    protocol_id = -1
    c_value = None
    try:
        protocol_id = int(request.POST.get("protocol_id", -1))
    except:
        pass
    try:
        c_value = int(request.POST.get("value", None))
    except:
        pass
    c_key = request.POST.get("key", "")
    keys_with_values = ['minute_from', 'minute_to', 'goal', 'penalty', 'p_pass', 'yellow_card', 'red_card', 'estimation', 'like', 'dislike']
    try:
        update_dict = {
            f'{c_key}': c_value
        }
        if c_key in keys_with_values:
            f_protocol = UserProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                if f_protocol[0].p_status and 'matches_reset' in f_protocol[0].p_status.tags and f_protocol[0].p_status.tags['matches_reset'] == 1:
                    c_value = None
            if c_value and c_value < 0:
                c_value = None
            update_dict[c_key] = c_value
        elif c_key == "dislike" and c_value == 1:
            update_dict['like'] = 0
        elif c_key == "like" and c_value == 1:
            update_dict['dislike'] = 0
        elif c_key == "status":
            c_status_id = -1
            try:
                c_status_id = int(c_value)
            except:
                pass
            f_status = PlayerProtocolStatus.objects.filter(id=c_status_id, tags__matches=1)
            is_reset_values = False
            if f_status.exists() and f_status[0].id != None:
                is_reset_values = 'matches_reset' in f_status[0].tags and f_status[0].tags['matches_reset'] == 1
                update_dict = {'p_status': f_status[0].id}
            else:
                update_dict = {'p_status': None}
            if is_reset_values:
                for t_key in keys_with_values:
                    if t_key != "dislike" and t_key != "like":
                        update_dict[t_key] = None
        elif c_key == "is_captain" or c_key == "is_goalkeeper":
            f_protocol = UserProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                t_val = getattr(f_protocol[0], c_key)
                update_dict[c_key] = not t_val
        elif c_key == "border_black" or c_key == "border_red":
            f_protocol = UserProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                t_val = getattr(f_protocol[0], c_key)
                t_val = 1 if t_val == 0 else 0
                update_dict[c_key] = t_val
        UserProtocol.objects.filter(id=protocol_id).update(**update_dict)
    except Exception as e:
        print(e)
        return JsonResponse({"err": "Can't edit match protocol.", "success": False}, status=400)
    return JsonResponse({"data": update_dict, "success": True}, status=200)


def POST_add_delete_players_protocol(request, cur_user, to_add = True):
    match_id = -1
    team_id = -1
    is_opponent = 0
    try:
        match_id = int(request.POST.get("match_id", -1))
    except:
        pass
    try:
        team_id = int(request.POST.get("team_id", -1))
    except:
        pass
    try:
        is_opponent = int(request.POST.get("is_opponent", 0))
    except:
        pass
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    res_data = []
    for pl_id_str in post_data:
        pl_id = None
        try:
            pl_id = int(pl_id_str)
        except:
            pass
        if not pl_id:
            continue
        if to_add:
            f_player = UserPlayer.objects.filter(id=pl_id, user=cur_user, team=team_id)
            f_match = UserMatch.objects.filter(event_id=match_id)
            if f_player.exists() and f_player[0].id != None and f_match.exists() and f_match[0].event_id != None:
                protocol, created = UserProtocol.objects.get_or_create(match=f_match[0], player=f_player[0])
                if created:
                    try:
                        protocol.is_opponent = is_opponent
                        protocol.save()
                        res_data.append(f"Created new protocol with id: {protocol.id}")
                    except:
                        pass
                else:
                    res_data.append(f"Protocol with id: {protocol.id} (refer on player: {f_player[0].id} and on match: {f_match[0].event_id}) already existed.")
        else:
            f_protocol = UserProtocol.objects.filter(id=pl_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                try:
                    f_protocol[0].delete()
                    res_data.append(f"Protocol was deleted.")
                except:
                    res_data.append(f"Protocol couldnt delete.")
            else:
                res_data.append(f"Protocol not found for delete.")
    is_success = True
    status = 200
    if len(res_data) == 0:
        is_success = False
        status = 400
        res_data = "RESULT IS EMPTY."
    return JsonResponse({"data": res_data, "success": is_success}, status=status)


def POST_edit_players_protocol_order(request, cur_user):
    ids_data = request.POST.getlist("protocols[]", [])
    temp_res_arr = []
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = c_ind + 1
        try:
            t_id = int(ids_data[c_ind])
        except:
            pass
        found_protocol = UserProtocol.objects.get(id=t_id)
        if found_protocol and found_protocol.id != None:
            found_protocol.order = t_order
            try:
                found_protocol.save()
                temp_res_arr.append(f'Folder [{found_protocol.id}] is order changed: {t_order}')
            except Exception as e:
                temp_res_arr.append(f'Folder [{found_protocol.id}] -> ERROR / Not access or another reason')
    res_data = {'res_arr': temp_res_arr, 'type': "change_order"}
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_match_video_event(request, cur_user, cur_team):
    links_data = request.POST.getlist("links[]", [])
    notes_data = request.POST.getlist("notes[]", [])
    event_id = -1
    try:
        event_id = int(request.POST.get("id", -1))
    except:
        pass
    res_data = "ERROR."
    success_state = False
    status_state = 400
    f_event = UserEvent.objects.filter(id=event_id)
    if f_event.exists() and f_event[0].id != None:
        f_event_video = f_event[0].video_link
        if f_event_video == None:
            f_event_video = EventVideoLink()
        f_event_video.json_link = links_data
        f_event_video.description = notes_data
        try:
            f_event_video.save()
            f_event = f_event[0]
            f_event.video_link = f_event_video
            f_event.save()
            success_state = True
            status_state = 200
            res_data = f"Event with video was saved: {f_event.id}."
        except Exception as e:
            print(e)
            res_data = f"Event with video not saved: {f_event.id}"
            pass
    return JsonResponse({"data": res_data, "success": success_state}, status=status_state)


def POST_edit_match_video_protocol(request, cur_user, cur_team):
    links_data = request.POST.getlist("links[]", [])
    notes_data = request.POST.getlist("notes[]", [])
    protocol_id = -1
    try:
        protocol_id = int(request.POST.get("id", -1))
    except:
        pass
    res_data = "ERROR."
    success_state = False
    status_state = 400
    f_protocol = UserProtocol.objects.filter(id=protocol_id)
    if f_protocol.exists() and f_protocol[0].id != None:
        f_protocol_video = f_protocol[0].video_link
        if f_protocol_video == None:
            f_protocol_video = EventVideoLink()
        f_protocol_video.json_link = links_data
        f_protocol_video.description = notes_data
        try:
            f_protocol_video.save()
            f_protocol = f_protocol[0]
            f_protocol.video_link = f_protocol_video
            f_protocol.save()
            success_state = True
            status_state = 200
            res_data = f"Event with video was saved: {f_protocol.id}."
        except Exception as e:
            print(e)
            res_data = f"Event with video not saved: {f_protocol.id}"
            pass
    return JsonResponse({"data": res_data, "success": success_state}, status=status_state)




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
        match_videos = GET_get_match_video_event(request, cur_user, cur_team, False, match[0].event_id.id)
        res_data['videos_count'] = count_videos(match_videos)
        if return_JsonResponse:
            return JsonResponse({"data": res_data, "success": True}, status=200)
        else:
            return res_data
    if return_JsonResponse:
        return JsonResponse({"errors": "Match not found.", "success": False}, status=400)
    else:
        return None


def GET_get_match_protocol(request, cur_user, cur_team):
    match_id = -1
    try:
        match_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = []
    protocol = UserProtocol.objects.filter(match=match_id)
    if protocol.exists() and protocol[0].id != None:
        for protocol_elem in protocol:
            protocol_dict = model_to_dict(protocol_elem)
            protocol_dict['player_name'] = f"{protocol_elem.player.surname} {protocol_elem.player.name}"
            protocol_dict['player_name_full'] = f"{protocol_elem.player.surname} {protocol_elem.player.name} {protocol_elem.player.patronymic}"
            tmp_status = get_protocol_status(request, protocol_elem.p_status)
            protocol_dict['status_full'] = tmp_status['full']
            protocol_dict['status_short'] = tmp_status['short']
            protocol_dict['status_red'] = 1 if protocol_elem.p_status and 'matches_red' in protocol_elem.p_status.tags and protocol_elem.p_status.tags['matches_red'] == 1 else 0
            protocol_videos = GET_get_match_video_protocol(request, cur_user, cur_team, False, protocol_elem.id)
            protocol_dict['videos_count'] = count_videos(protocol_videos)
            res_data.append(protocol_dict)
        return JsonResponse({"data": res_data, "success": True}, status=200)
    return JsonResponse({"errors": "Match protocol not found.", "success": False}, status=400)


def GET_get_match_video_event(request, cur_user, cur_team, returnJSONResponse=True, custom_id=None):
    event_id = -1
    try:
        event_id = int(request.GET.get("id", -1))
    except:
        pass
    if custom_id:
        event_id = custom_id
    event = UserEvent.objects.filter(id=event_id)
    if event.exists() and event[0].id != None:
        res_data = {'links': [], 'notes': []}
        try:
            res_data["links"] = event[0].video_link.json_link
            res_data["notes"] = event[0].video_link.description
        except:
            pass
        if returnJSONResponse:
            return JsonResponse({"data": res_data, "success": True}, status=200)
        else:
            return res_data
    if returnJSONResponse:
        return JsonResponse({"errors": "Event video not found.", "success": False}, status=400)
    else:
        return None


def GET_get_match_video_protocol(request, cur_user, cur_team, returnJSONResponse=True, custom_id=None):
    protocol_id = -1
    try:
        protocol_id = int(request.GET.get("id", -1))
    except:
        pass
    if custom_id:
        protocol_id = custom_id
    protocol = UserProtocol.objects.filter(id=protocol_id)
    if protocol.exists() and protocol[0].id != None:
        res_data = {'links': [], 'notes': []}
        try:
            res_data["links"] = protocol[0].video_link.json_link
            res_data["notes"] = protocol[0].video_link.description
        except:
            pass
        if returnJSONResponse:
            return JsonResponse({"data": res_data, "success": True}, status=200)
        else:
            return res_data
    if returnJSONResponse:
        return JsonResponse({"errors": "Protocol video not found.", "success": False}, status=400)
    else:
        return None



