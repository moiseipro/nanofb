from django.http import JsonResponse
from django.forms.models import model_to_dict
import json
from datetime import datetime, date, timedelta
from references.models import UserTeam, ClubTeam
from events.models import UserEvent, ClubEvent, EventVideoLink
from matches.models import UserMatch, ClubMatch, UserProtocol, ClubProtocol
from references.models import PlayerProtocolStatus
from players.models import UserPlayer, ClubPlayer
from nanofootball.views import util_check_access
import nanofootball.utils as utils


def get_match_result(data):
    """
    Return list of two elements for defining match's result. 
    First element:
    = 0 -> Draw
    = 1 -> First team's win.
    = 2 -> Second team's win.
    = -1 -> Any error.
    Second element:
    = 1 -> The number of goals is equal.
    = 0 -> The number of goals is not equal.
    = -1 -> Any error.
    
    :param data: Match's object.
    :type data: [object]
    :return: List of two elements - statuses match's result.
    :rtype: list[int]

    """
    # первый элемент - 0: Ничья, 1: Победа_1-ой_команды, 2: Победа_2-ой.
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
    """
    Return dictionary with full protocol name and short.
    
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param elem: status's object.
    :type elem: [object]
    :return: Dictionary with full protocol name and short.
    :rtype: dict['full':[str], 'short':[str]]

    """
    res = {'full': "", 'short': ""}
    if elem and elem.translation_names:
        if elem.translation_names[request.LANGUAGE_CODE]:
            res["full"] = elem.translation_names[request.LANGUAGE_CODE]
        else:
            res["full"] = elem.translation_names[request.utils.LANG_CODE_DEFAULT]
    if elem and elem.short_name:
        res["short"] = elem.short_name
    return res


def get_matches_refs(request):
    """
    Return data of Matches' References with translations.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Dictionary of references.
    :rtype: dict[list[object]]

    """
    refs = {}
    refs['player_protocol_status'] = PlayerProtocolStatus.objects.filter(tags__matches=1).values()
    for elem in refs['player_protocol_status']:
        elem['is_red'] = "matches_red" in elem['tags'] and elem['tags']['matches_red'] == 1
    refs = utils.set_refs_translations(refs, request.LANGUAGE_CODE)
    return refs


def count_videos(data):
    """
    Return amount of videos at data. Data is usually match object.

    :param data: Match object.
    :type data: [object]
    :return: Amount of videos.
    :rtype: [int]

    """
    counter = 0
    if data and data['links'] and isinstance(data['links'], list):
        for elem in data['links']:
            if elem != "":
                counter += 1
    return counter
# --------------------------------------------------
# MATCHES API
def POST_edit_match(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    try:
        match_id = int(request.POST.get("id", -1))
    except:
        pass
    c_match = None
    c_team = None
    if not util_check_access(cur_user, {
        'perms_user': ["matches.change_usermatch", "matches.add_usermatch"], 
        'perms_club': ["matches.change_clubmatch", "matches.add_clubmatch"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    adding_mode = False
    c_datetime = utils.set_value_as_datetime(f"{post_data['date']} {post_data['time']}:00")
    c_match = None
    if request.user.club_id is not None:
        c_match = ClubMatch.objects.filter(event_id=match_id, team_id=cur_team)
        if not c_match.exists() or c_match[0].event_id == None:
            adding_mode = True
            c_team = ClubTeam.objects.filter(id=cur_team)
            if not c_team.exists() or c_team[0].id == None:
                return JsonResponse({"err": "Team not found.", "success": False}, status=400)
            try:
                if c_datetime:
                    new_event = ClubEvent(user_id=cur_user, date=c_datetime, club_id=request.user.club_id)
                else:
                    new_event = ClubEvent(user_id=cur_user, club_id=request.user.club_id)
                new_event.save()
            except:
                return JsonResponse({"errors": "Can't create event"}, status=400)
            c_match = ClubMatch(team_id=c_team[0], event_id=new_event)
        else:
            c_match = c_match[0]
    else:
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
    if c_match == None:
        return JsonResponse({"err": "Match not found.", "success": False}, status=400)
    if c_datetime:
        c_match.event_id.date = c_datetime
        c_match.event_id.save()
    c_match.duration = utils.set_value_as_duration(post_data['duration'])
    c_match.goals = utils.set_value_as_int2(post_data['goals'], 0)
    c_match.penalty = utils.set_value_as_int2(post_data['penalty'], 0)
    c_match.opponent = post_data['opponent_name']
    c_match.o_goals = utils.set_value_as_int2(post_data['o_goals'], 0)
    c_match.o_penalty = utils.set_value_as_int2(post_data['o_penalty'], 0)
    c_match.place = post_data['place']
    c_match.tournament = post_data['tournament']
    c_match.m_type = utils.set_value_as_int2(post_data['m_type'], 0)
    c_match.m_format = post_data['m_format']
    try:
        c_match.save()
        res_data = f'Match with id: [{c_match.event_id}] is added / edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit or add the match.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_match(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Delete match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    try:
        match_id = int(request.POST.get("id", -1))
    except:
        pass
    c_event = None # deleting the event, delete and match
    if not util_check_access(cur_user, {
        'perms_user': ["matches.delete_usermatch"], 
        'perms_club': ["matches.delete_clubmatch"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        c_event = ClubEvent.objects.filter(id=match_id, club_id=request.user.club_id)
    else:
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
    """
    Return JSON Response as result on POST operation "Edit players' protocol in match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
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
    print(c_value)
    c_key = request.POST.get("key", "")
    keys_with_values = ['minute_from', 'minute_to', 'goal', 'penalty', 'p_pass', 'yellow_card', 'red_card', 'estimation', 'like', 'dislike', 'note']
    AnyProtocol = None
    if request.user.club_id is not None:
        AnyProtocol = ClubProtocol
    else:
        AnyProtocol = UserProtocol
    update_protocol_flag = True
    try:
        update_dict = {
            f'{c_key}': c_value
        }
        if c_key in keys_with_values:
            f_protocol = AnyProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                if f_protocol[0].p_status and 'matches_reset' in f_protocol[0].p_status.tags and f_protocol[0].p_status.tags['matches_reset'] == 1:
                    c_value = None
                    if c_key == "dislike" or c_key == "like":
                        c_value = False
            if c_value and c_value < 0:
                c_value = None
            if c_key == "note":
                c_value = request.POST.get("value", "")
            update_dict[c_key] = c_value
            print(update_dict)
            if c_key == "dislike" and c_value == 1:
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
                    else:
                        update_dict[t_key] = False
        elif c_key == "is_captain" or c_key == "is_goalkeeper":
            f_protocol = AnyProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                if c_key == "is_captain":
                    another_protocols_in_match = AnyProtocol.objects.filter(match=f_protocol[0].match, is_captain=True)
                    if another_protocols_in_match.exists() and another_protocols_in_match[0].id != None and f_protocol[0].is_captain == False:
                        update_protocol_flag = False
                t_val = getattr(f_protocol[0], c_key)
                update_dict[c_key] = not t_val
        elif c_key == "border_black" or c_key == "border_red":
            f_protocol = AnyProtocol.objects.filter(id=protocol_id)
            if f_protocol.exists() and f_protocol[0].id != None:
                t_val = getattr(f_protocol[0], c_key)
                t_val = 1 if t_val == 0 else 0
                update_dict[c_key] = t_val
        if update_protocol_flag:
            AnyProtocol.objects.filter(id=protocol_id).update(**update_dict)
    except Exception as e:
        print(e)
        return JsonResponse({"err": "Can't edit match protocol.", "success": False}, status=400)
    return JsonResponse({"data": update_dict, "success": True}, status=200)


def POST_add_delete_players_protocol(request, cur_user, to_add = True):
    """
    Return JSON Response as result on POST operation "Add or delete players' protocol in match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new protocol else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
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
            f_player = None
            f_match = None
            if request.user.club_id is not None:
                f_player = ClubPlayer.objects.filter(id=pl_id, team=team_id)
                f_match = ClubMatch.objects.filter(event_id=match_id)
            else:
                f_player = UserPlayer.objects.filter(id=pl_id, user=cur_user, team=team_id)
                f_match = UserMatch.objects.filter(event_id=match_id)
            if f_player.exists() and f_player[0].id != None and f_match.exists() and f_match[0].event_id != None:
                protocol = None
                created = False
                if request.user.club_id is not None:
                    protocol, created = ClubProtocol.objects.get_or_create(match=f_match[0], player=f_player[0])
                else:
                    protocol, created = UserProtocol.objects.get_or_create(match=f_match[0], player=f_player[0])
                if created:
                    try:
                        protocol.is_opponent = is_opponent
                        protocol.p_num = f_player[0].card.game_num
                        protocol.save()
                        res_data.append(f"Created new protocol with id: {protocol.id}")
                    except:
                        pass
                else:
                    res_data.append(f"Protocol with id: {protocol.id} (refer on player: {f_player[0].id} and on match: {f_match[0].event_id}) already existed.")
        else:
            f_protocol = None
            if request.user.club_id is not None:
                f_protocol = ClubProtocol.objects.filter(id=pl_id)
            else:
                f_protocol = UserProtocol.objects.filter(id=pl_id)
            if f_protocol != None and f_protocol.exists() and f_protocol[0].id != None:
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
    """
    Return JSON Response as result on POST operation "Edit ordering of players' protocols in match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    ids_data = request.POST.getlist("protocols[]", [])
    temp_res_arr = []
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = c_ind + 1
        try:
            t_id = int(ids_data[c_ind])
        except:
            pass
        found_protocol = None
        if request.user.club_id is not None:
            found_protocol = ClubProtocol.objects.get(id=t_id)
        else:
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
    """
    Return JSON Response as result on POST operation "Edit match's video event".
    Match is event, every event has video links' field. This function is allowed to edit these links.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    links_data = request.POST.getlist("links[]", [])
    notes_data = request.POST.getlist("notes[]", [])
    names_data = request.POST.getlist("names[]", [])
    event_id = -1
    try:
        event_id = int(request.POST.get("id", -1))
    except:
        pass
    res_data = "ERROR."
    success_state = False
    status_state = 400
    f_event = None
    if request.user.club_id is not None:
        f_event = ClubEvent.objects.filter(id=event_id)
    else:
        f_event = UserEvent.objects.filter(id=event_id)
    if f_event != None and f_event.exists() and f_event[0].id != None:
        f_event_video = f_event[0].video_link
        if f_event_video == None:
            f_event_video = EventVideoLink()
        f_event_video.json_link = links_data
        f_event_video.description = notes_data
        f_event_video.name = names_data
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
    """
    Return JSON Response as result on POST operation "Edit match's video event".
    Every player's protocol in match has field video_link also. This foreign key at the same Model(EventVideoLink) how for event.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    links_data = request.POST.getlist("links[]", [])
    notes_data = request.POST.getlist("notes[]", [])
    names_data = request.POST.getlist("names[]", [])
    protocol_id = -1
    try:
        protocol_id = int(request.POST.get("id", -1))
    except:
        pass
    res_data = "ERROR."
    success_state = False
    status_state = 400
    f_protocol = None
    if request.user.club_id is not None:
        f_protocol = ClubProtocol.objects.filter(id=protocol_id)
    else:
        f_protocol = UserProtocol.objects.filter(id=protocol_id)
    if f_protocol.exists() and f_protocol[0].id != None:
        f_protocol_video = f_protocol[0].video_link
        if f_protocol_video == None:
            f_protocol_video = EventVideoLink()
        f_protocol_video.json_link = links_data
        f_protocol_video.description = notes_data
        f_protocol_video.name = names_data
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


def POST_edit_match_labels(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit match labels".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    try:
        match_id = int(request.POST.get("id", -1))
    except:
        pass
    c_match = None
    c_team = None
    if not util_check_access(cur_user, {
        'perms_user': ["matches.change_usermatch", "matches.add_usermatch"], 
        'perms_club': ["matches.change_clubmatch", "matches.add_clubmatch"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    labels_team = request.POST.get("team", None)
    labels_opponent = request.POST.get("opponent", None)
    adding_mode = False
    c_match = None
    if request.user.club_id is not None:
        c_match = ClubMatch.objects.filter(event_id=match_id, team_id=cur_team)
        if c_match.exists() and c_match[0].event_id != None:
            c_match = c_match[0]
    else:
        c_match = UserMatch.objects.filter(event_id=match_id, team_id=cur_team)
        if c_match.exists() and c_match[0].event_id != None:
            c_match = c_match[0]
    if c_match == None:
        return JsonResponse({"err": "Match not found.", "success": False}, status=400)
    c_match.field_labels_team = labels_team
    c_match.field_labels_opponent = labels_opponent
    try:
        c_match.save()
        res_data = f'Match with id: [{c_match.event_id}] is edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit the match.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": True}, status=200)



def GET_get_match(request, cur_user, cur_team, return_JsonResponse=True):
    """
    Return JSON Response or object as result on GET operation "Get one match".
    If return_JsonResponse is False then function return Object
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param return_JsonResponse: Controls returning type.
    :type return_JsonResponse: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as match's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object

    """
    match_id = -1
    try:
        match_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = {}
    match = None
    if not util_check_access(cur_user, {
        'perms_user': ["matches.view_usermatch"], 
        'perms_club': ["matches.view_clubmatch"]
    }):
        if return_JsonResponse:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        else:
            return None
    if request.user.club_id is not None:
        match = ClubMatch.objects.filter(event_id=match_id, team_id=cur_team)
    else:
        match = UserMatch.objects.filter(event_id=match_id, team_id=cur_team)
    if match.exists() and match[0].event_id != None:
        res_data = match.values()[0]
        res_data['date'] = utils.get_date_str_from_datetime(match[0].event_id.date, utils.LANG_CODE_DEFAULT)
        res_data['time'] = utils.get_time_from_datetime(match[0].event_id.date)
        res_data['duration'] = utils.get_duration_normal_format(match[0].duration)
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
    """
    Return JSON Response or object as result on GET operation "Get protocol of selected match".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    match_id = -1
    try:
        match_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = []
    protocol = None
    if request.user.club_id is not None:
        protocol = ClubProtocol.objects.filter(match=match_id)
    else:
        protocol = UserProtocol.objects.filter(match=match_id)
    if protocol.exists() and protocol[0].id != None:
        for protocol_elem in protocol:
            protocol_dict = model_to_dict(protocol_elem)
            protocol_dict['player_name'] = f"{protocol_elem.player.surname} {protocol_elem.player.name}"
            protocol_dict['player_name_full'] = f"{protocol_elem.player.surname} {protocol_elem.player.name} {protocol_elem.player.patronymic}"
            player_position = ""
            try:
                player_position = protocol_elem.player.card.ref_position.short_name
            except:
                pass
            protocol_dict['player_position'] = player_position
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
    """
    Return JSON Response or object as result on GET operation "Get one match's video event".
    If return_JsonResponse is False then function return Object or None
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param returnJSONResponse: Controls returning type.
    :type returnJSONResponse: [bool]
    :param custom_id: Custom event's ID.
    :type custom_id: [int] or None
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as video_event's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object or None

    """
    event_id = -1
    try:
        event_id = int(request.GET.get("id", -1))
    except:
        pass
    if custom_id:
        event_id = custom_id
    event = None
    if request.user.club_id is not None:
        event = ClubEvent.objects.filter(id=event_id)
    else:
        event = UserEvent.objects.filter(id=event_id)
    if event.exists() and event[0].id != None:
        res_data = {'links': [], 'notes': [], 'names': []}
        try:
            res_data["links"] = event[0].video_link.json_link
            res_data["notes"] = event[0].video_link.description
            res_data["names"] = event[0].video_link.name
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
    """
    Return JSON Response or object as result on GET operation "Get one match's protocol video".
    If return_JsonResponse is False then function return Object or None
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param returnJSONResponse: Controls returning type.
    :type returnJSONResponse: [bool]
    :param custom_id: Custom protocol's ID.
    :type custom_id: [int] or None
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as video_protocol's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object or None

    """
    protocol_id = -1
    try:
        protocol_id = int(request.GET.get("id", -1))
    except:
        pass
    if custom_id:
        protocol_id = custom_id
    protocol = None
    if request.user.club_id is not None:
        protocol = ClubProtocol.objects.filter(id=protocol_id)
    else:
        protocol = UserProtocol.objects.filter(id=protocol_id)
    if protocol.exists() and protocol[0].id != None:
        res_data = {'links': [], 'notes': [], 'names': []}
        try:
            res_data["links"] = protocol[0].video_link.json_link
            res_data["notes"] = protocol[0].video_link.description
            res_data["names"] = protocol[0].video_link.name
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

