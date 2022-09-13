from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.forms.models import model_to_dict
from references.models import UserTeam
from players.models import UserPlayer, ClubPlayer, CardSection, PlayerCard
from references.models import PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot
from datetime import datetime
import json



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


def set_by_language_code(elem, code, value, value2 = None):
    if value2:
        value = value2 if value2 != "" else value
    if type(elem) is dict:
        elem[code] = value
    else:
        elem = {code: value}
    return elem


def set_refs_translations(data, lang_code):
    for key in data:
        elems = data[key]
        for elem in elems:
            title = get_by_language_code(elem['translation_names'], lang_code)
            elem['title'] = title if title != "" else elem['name']
    return data


def photo_url_convert(photo_url):
    if "players/img/" not in photo_url or not isinstance(photo_url, str):
        return ""
    return f"/media/{photo_url}"


def set_value_as_int(request, name, def_value = None):
    res = def_value
    try:
        res = int(request.POST.get(name, def_value))
    except:
        pass
    return res


def set_value_as_date(request, name, def_value = None):
    format_ddmmyyyy = "%d/%m/%Y"
    format_yyyymmdd = "%Y-%m-%d"
    res = def_value
    try:
        res = request.POST.get(name, def_value)
    except:
        pass
    flag = False
    try:
        date = datetime.strptime(res, format_ddmmyyyy)
    except:
        flag = True
    try:
        date = datetime.strptime(res, format_yyyymmdd)
        flag = False
    except:
        flag = True if flag else False
    if flag:
        res = None
    return res   


def get_players_refs(request):
    refs = {}
    refs['player_team_status'] = PlayerTeamStatus.objects.filter().values()
    refs['player_player_status'] = PlayerPlayerStatus.objects.filter().values()
    refs['player_level'] = PlayerLevel.objects.filter().values()
    refs['player_position'] = PlayerPosition.objects.filter().values()
    refs['player_foot'] = PlayerFoot.objects.filter().values()
    refs = set_refs_translations(refs, request.LANGUAGE_CODE)
    return refs



# --------------------------------------------------
# PLAYERS API
def POST_edit_player(request, cur_user, cur_team):
    player_id = -1
    try:
        player_id = int(request.POST.get("id", -1))
    except:
        pass
    c_player = None
    access_denied = False
    c_team = None
    if access_denied:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    c_player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team)
    if not c_player.exists() or c_player[0].id == None:
        c_team = UserTeam.objects.filter(id=cur_team)
        if not c_team.exists() or c_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        c_player = UserPlayer(user=cur_user, team=c_team[0])
        is_new_player = True
    else:
        c_player = c_player[0]
    if c_player == None:
            return JsonResponse({"err": "Player not found.", "success": False}, status=400)
    print(request.POST)
    c_player.surname = request.POST.get("data[surname]", "")
    c_player.name = request.POST.get("data[name]", "")
    c_player.patronymic = request.POST.get("data[patronymic]", "")

    new_team_id = set_value_as_int(request, "data[team]", None)
    new_team = UserTeam.objects.filter(id=new_team_id) if c_team == None else c_team
    if not new_team.exists() or new_team[0].id == None:
        return JsonResponse({"err": "Team not found.", "success": False}, status=400)
    c_player.team = new_team[0]

    img_photo = request.FILES.get('filePhoto')
    if img_photo is not None and img_photo:
        c_player.photo = img_photo

    try:
        c_player.save()
        res_data = f'Player with id: [{c_player.id}] is added / edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit or add the player.", "success": False}, status=200)
    c_player_playercard = c_player.card
    if not c_player_playercard or not c_player_playercard.id == None:
        c_player_playercard = PlayerCard()
    c_player_playercard.citizenship = request.POST.get("data[citizenship]", None)
    c_player_playercard.club_from = request.POST.get("data[club_from]", None)
    c_player_playercard.growth = set_value_as_int(request, "data[growth]", None)
    c_player_playercard.weight = set_value_as_int(request, "data[weight]", None)
    c_player_playercard.game_num = set_value_as_int(request, "data[game_num]", None)
    c_player_playercard.birthsday = set_value_as_date(request, "data[birthsday]", None)
    c_player_playercard.ref_team_status = set_value_as_int(request, "data[ref_team_status]", None)
    c_player_playercard.ref_player_status = set_value_as_int(request, "data[ref_player_status]", None)
    c_player_playercard.ref_level = set_value_as_int(request, "data[ref_level]", None)
    c_player_playercard.ref_position = set_value_as_int(request, "data[ref_position]", None)
    c_player_playercard.ref_foot = set_value_as_int(request, "data[ref_foot]", None)
    c_player_playercard.come = set_value_as_date(request, "data[come]", None)
    c_player_playercard.leave = set_value_as_date(request, "data[leave]", None)
    try:
        c_player_playercard.save()
        c_player.card = c_player_playercard
        c_player.save()
        res_data += '\nAdded player card for player.'
    except:
        res_data += '\nErr while saving player card.'
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_player(request, cur_user, cur_team):
    player_id = -1
    try:
        player_id = int(request.POST.get("id", -1))
    except:
        pass
    c_player = None
    access_denied = False
    if access_denied:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if not access_denied:
        c_player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team)
    if c_player == None or not c_player.exists() or c_player[0].id == None:
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        try:
            c_player.delete()
            return JsonResponse({"data": {"id": player_id}, "success": True}, status=200)
        except:
            return JsonResponse({"errors": "Can't delete exercise"}, status=400)


def POST_edit_card_sections(request, cur_user):
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    res_data = ""
    if cur_user.is_superuser:
        for elem in post_data:
            f_section = CardSection.objects.filter(id=elem['id'])
            if f_section.exists() and f_section[0].id != None:
                f_section = f_section[0]
                f_section.title = set_by_language_code(f_section.title, request.LANGUAGE_CODE, elem['title'])
                f_section.order = elem['order']
                f_section.visible = elem['visible']
                try:
                    f_section.save()
                    res_data += f'Section with id: [{f_section.id}] is edited successfully.'
                except Exception as e:
                    res_data += f"Err. Cant edit section with id: [{elem['id']}]."
    else:
        pass
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_player(request, cur_user, cur_team):
    player_id = -1
    try:
        player_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = {}
    player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team)
    if player.exists() and player[0].id != None:
        res_data = player.values()[0]
        res_data['team'] = player[0].team.id
        res_data['team_name'] = player[0].team.name
        res_data['photo'] = photo_url_convert(res_data['photo'])
        if player[0].card and player[0].card.id != None:
            player_card = model_to_dict(player[0].card)
            for key in player_card:
                if key != "id":
                    res_data[key] = player_card[key]
        return JsonResponse({"data": res_data, "success": True}, status=200)
    return JsonResponse({"errors": "Player not found.", "success": False}, status=400)


def GET_get_card_sections(request, cur_user):
    res_data = {'sections': [], 'user_params': [], 'mode': "nfb" if cur_user.is_superuser else "user"}
    sections = CardSection.objects.filter()
    sections = [entry for entry in sections.values()]
    for section in sections:
        section['title'] = get_by_language_code(section['title'], request.LANGUAGE_CODE)
    res_data["sections"] = sections
    return JsonResponse({"data": res_data, "success": True}, status=200)


