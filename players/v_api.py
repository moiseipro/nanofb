from django.http import JsonResponse
from django.forms.models import model_to_dict
from django.db.models import Q, Count
from references.models import UserTeam, ClubTeam
from players.models import UserPlayer, ClubPlayer, CardSection, PlayerCard, PlayersTableColumns, PlayerRecord
from players.models import PlayerCharacteristicsRows, PlayerCharacteristicUser, PlayerCharacteristicClub
from players.models import PlayerQuestionnairesRows, PlayerQuestionnaireUser, PlayerQuestionnaireClub
from players.models import UserDocumentType, ClubDocumentType, UserPlayerDocument, ClubPlayerDocument
from references.models import PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot
from nanofootball.views import util_check_access
from datetime import datetime, date, timedelta
import json
import nanofootball.utils as utils


def photo_url_convert(photo_url):
    """
    Return converted url strin in case success else empty string.

    """
    if "players/img/" not in photo_url or not isinstance(photo_url, str):
        return ""
    return f"/media/{photo_url}"


def set_value_as_ref(request, name, ref_type, def_value = None):
    """
    Return new value as Reference Model Object. Using argument "name" the appropriate directory is selected.
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param ref_type: Reference's type.
    :type ref_type: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value for setting to field.
    :rtype: [Model.object] or None

    """
    res = def_value
    c_id = -1
    try:
        c_id = int(request.POST.get(name, def_value))
    except:
        pass
    f_elem = None
    if ref_type == "team_status":
        f_elem = PlayerTeamStatus.objects.filter(id=c_id)
    if ref_type == "player_status":
        f_elem = PlayerPlayerStatus.objects.filter(id=c_id)
    if ref_type == "level":
        f_elem = PlayerLevel.objects.filter(id=c_id)
    if ref_type == "position":
        f_elem = PlayerPosition.objects.filter(id=c_id)
    if ref_type == "foot":
        f_elem = PlayerFoot.objects.filter(id=c_id)
    if f_elem and f_elem.exists() and f_elem[0].id != None:
        res = f_elem[0]
    return res


def set_value_as_date(request, name, def_value = None):
    """
    Return Date or None. Transforming value from request by "name" to date using format "ddmmyyyy" or "yyyymmdd".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of parameter in request.
    :type name: [str]
    :param def_value: Default value for new value.
    :type def_value: [date] or None
    :return: Date or None.
    :rtype: [date] or None

    """
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
    """
    Return data of Players' References with translations.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Dictionary of references.
    :rtype: dict[list[object]]

    """
    refs = {}
    refs['player_team_status'] = PlayerTeamStatus.objects.filter().values()
    refs['player_player_status'] = PlayerPlayerStatus.objects.filter().values()
    refs['player_level'] = PlayerLevel.objects.filter().values()
    refs['player_position'] = PlayerPosition.objects.filter().values()
    refs['player_foot'] = PlayerFoot.objects.filter().values()
    refs = utils.set_refs_translations(refs, request.LANGUAGE_CODE)
    return refs
# --------------------------------------------------
# PLAYERS API
def POST_edit_player(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit player".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    player_id = -1
    try:
        player_id = int(request.POST.get("id", -1))
    except:
        pass
    c_player = None
    c_team = None
    if not util_check_access(cur_user, {
        'perms_user': ["players.change_userplayer", "players.add_userplayer"], 
        'perms_club': ["players.change_clubplayer", "players.add_clubplayer"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        c_player = ClubPlayer.objects.filter(id=player_id, team=cur_team)
        if not c_player.exists() or c_player[0].id == None:
            c_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
            if not c_team.exists() or c_team[0].id == None:
                return JsonResponse({"err": "Team not found.", "success": False}, status=400)
            players_add_limit_flag = False
            players_add_limit_amount = 0
            try:
                players_add_limit_amount = request.user.club_id.player_limit
                players_add_limit_flag = ClubPlayer.objects.filter(team=cur_team, is_archive=False).count() < players_add_limit_amount
            except:
                pass
            if not players_add_limit_flag:
                return JsonResponse({"err": "Players' amount limits by version.", "success": False, "err_code": "players_limit", "r_value": players_add_limit_amount}, status=400)
            c_player = ClubPlayer(user=cur_user, team=c_team[0])
            is_new_player = True
        else:
            c_player = c_player[0]
    else:
        c_player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team)
        if not c_player.exists() or c_player[0].id == None:
            c_team = UserTeam.objects.filter(id=cur_team)
            if not c_team.exists() or c_team[0].id == None:
                return JsonResponse({"err": "Team not found.", "success": False}, status=400)
            players_add_limit_flag = False
            players_add_limit_amount = 0
            try:
                players_add_limit_amount = cur_user.player_limit
                players_add_limit_flag = UserPlayer.objects.filter(user=cur_user, team=cur_team, is_archive=False).count() < players_add_limit_amount
            except:
                pass
            if not players_add_limit_flag:
                return JsonResponse({"err": "Players' amount limits by version.", "success": False, "err_code": "players_limit", "r_value": players_add_limit_amount}, status=400)
            c_player = UserPlayer(user=cur_user, team=c_team[0])
            is_new_player = True
        else:
            c_player = c_player[0]
    if c_player == None:
            return JsonResponse({"err": "Player not found.", "success": False}, status=400)
    c_player.surname = request.POST.get("data[surname]", "")
    c_player.name = request.POST.get("data[name]", "")
    c_player.patronymic = request.POST.get("data[patronymic]", "")
    c_player.is_archive = request.POST.get("data[is_archive]", "0") == '1'

    new_team_id = utils.set_value_as_int(request, "data[team]", None)
    new_team = None
    if request.user.club_id is not None:
        new_team = ClubTeam.objects.filter(id=new_team_id, club_id=request.user.club_id) if c_team == None else c_team
    else:
        new_team = UserTeam.objects.filter(id=new_team_id) if c_team == None else c_team
    if new_team == None or not new_team.exists() or new_team[0].id == None:
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
    
    try:
        old_records = c_player.card.records.all()
        for record in old_records:
            record.delete()
    except:
        pass
    try:
        c_player.card.records.clear()
    except:
        pass

    c_player_playercard = c_player.card
    if not c_player_playercard or not c_player_playercard.id == None:
        c_player_playercard = PlayerCard()
    c_player_playercard.citizenship = request.POST.get("data[citizenship]", None)
    c_player_playercard.club_from = request.POST.get("data[club_from]", None)
    c_player_playercard.growth = utils.set_value_as_int(request, "data[growth]", None)
    c_player_playercard.weight = utils.set_value_as_int(request, "data[weight]", None)
    c_player_playercard.game_num = utils.set_value_as_int(request, "data[game_num]", None)
    c_player_playercard.birthsday = set_value_as_date(request, "data[birthsday]", None)
    c_player_playercard.ref_team_status = set_value_as_ref(request, "data[ref_team_status]", "team_status", None)
    c_player_playercard.ref_player_status = set_value_as_ref(request, "data[ref_player_status]", "player_status", None)
    c_player_playercard.ref_level = set_value_as_ref(request, "data[ref_level]", "level", None)
    c_player_playercard.ref_position = set_value_as_ref(request, "data[ref_position]", "position", None)
    c_player_playercard.ref_foot = set_value_as_ref(request, "data[ref_foot]", "foot", None)
    c_player_playercard.come = set_value_as_date(request, "data[come]", None)
    c_player_playercard.leave = set_value_as_date(request, "data[leave]", None)
    c_player_playercard.contract_with = set_value_as_date(request, "data[contract_with]", None)
    c_player_playercard.contract_by = set_value_as_date(request, "data[contract_by]", None)
    c_player_playercard.email = request.POST.get("data[email]", None)
    c_player_playercard.phone = request.POST.get("data[phone]", None)
    c_player_playercard.phone_2 = request.POST.get("data[phone_2]", None)
    c_player_playercard.is_goalkeeper = utils.set_value_as_int(request, "data[is_goalkeeper]", 0)
    c_player_playercard.is_captain = utils.set_value_as_int(request, "data[is_captain]", 0)
    c_player_playercard.is_vice_captain = utils.set_value_as_int(request, "data[is_vice_captain]", 0)
    c_player_playercard.field_labels = request.POST.get("data[field_labels]", None)
    try:
        c_player_playercard.save()
        c_player.card = c_player_playercard
        c_player.save()
        res_data += '\nAdded player card for player.'
    except:
        res_data += '\nErr while saving player card.'
    
    record_dates = request.POST.getlist("data[record_dates]")
    record_notes = request.POST.getlist("data[record_notes]")
    if isinstance(record_dates, list) and isinstance(record_notes, list):
        if len(record_dates) == len(record_notes):
            for _i in range(len(record_dates)):
                c_date = None
                c_note = ""
                try:
                    c_date = set_value_as_date(request, "", record_dates[_i])
                except:
                    pass
                try:
                    c_note = record_notes[_i]
                except:
                    pass
                if c_date is not None:
                    new_row = PlayerRecord(date=c_date, record=c_note)
                    new_row.save()
                    c_player.card.records.add(new_row)

    characteristics_ids = request.POST.getlist("data[characteristics_id]")
    characteristics_stars = request.POST.getlist("data[characteristics_stars]")
    characteristics_notes = request.POST.getlist("data[characteristics_notes]")
    if isinstance(characteristics_ids, list) and isinstance(characteristics_stars, list) and isinstance(characteristics_notes, list):
        if len(characteristics_ids) == len(characteristics_stars) and len(characteristics_stars) == len(characteristics_notes):
            current_date = date.today()
            current_date = current_date.strftime("%Y-%m-%d")
            for _i in range(len(characteristics_ids)):
                c_id = -1
                c_value = 0
                c_note = ""
                try:
                    c_id = int(characteristics_ids[_i])
                except:
                    pass
                try:
                    c_value = int(characteristics_stars[_i])
                except:
                    pass
                try:
                    c_note = characteristics_notes[_i]
                except:
                    pass
                f_row = None
                if request.user.club_id is not None:
                    f_row = PlayerCharacteristicsRows.objects.filter(id=c_id, is_nfb=False, club=request.user.club_id)
                else:
                    f_row = PlayerCharacteristicsRows.objects.filter(id=c_id, is_nfb=False, user=cur_user)
                if f_row != None and f_row.exists() and f_row[0].id != None:
                    f_row = f_row[0]
                    c_characteristics = None
                    if request.user.club_id is not None:
                        c_characteristics = PlayerCharacteristicClub.objects.filter(characteristics=f_row, club=request.user.club_id, player=c_player, date_creation=current_date)
                        if c_characteristics.exists() and c_characteristics[0].id != None:
                            c_characteristics = c_characteristics[0]
                        else:
                            c_characteristics = PlayerCharacteristicClub(characteristics=f_row, club=request.user.club_id, player=c_player)
                    else:
                        c_characteristics = PlayerCharacteristicUser.objects.filter(characteristics=f_row, user=cur_user, player=c_player, date_creation=current_date)
                        if c_characteristics.exists() and c_characteristics[0].id != None:
                            c_characteristics = c_characteristics[0]
                        else:
                            c_characteristics = PlayerCharacteristicUser(characteristics=f_row, user=cur_user, player=c_player)
                    try:
                        c_characteristics.value = c_value
                        c_characteristics.notes = c_note
                        c_characteristics.save()
                        res_data += '\nAdded player characteristics for player.'
                    except:
                        res_data += '\nErr while saving player characteristics.'
    questionnaires_ids = request.POST.getlist("data[questionnaires_ids]")
    questionnaires_notes = request.POST.getlist("data[questionnaires_notes]")
    if isinstance(questionnaires_ids, list) and isinstance(questionnaires_notes, list):
        if len(questionnaires_ids) == len(questionnaires_notes):
            for _i in range(len(questionnaires_ids)):
                c_id = -1
                c_note = ""
                try:
                    c_id = int(questionnaires_ids[_i])
                except:
                    pass
                try:
                    c_note = questionnaires_notes[_i]
                except:
                    pass
                f_row = None
                if request.user.club_id is not None:
                    f_row = PlayerQuestionnairesRows.objects.filter(id=c_id, is_nfb=False, club=request.user.club_id)
                else:
                    f_row = PlayerQuestionnairesRows.objects.filter(id=c_id, is_nfb=False, user=cur_user)
                if f_row != None and f_row.exists() and f_row[0].id != None:
                    f_row = f_row[0]
                    c_questionnaires = None
                    if request.user.club_id is not None:
                        c_questionnaires = PlayerQuestionnaireClub.objects.filter(questionnaire=f_row, club=request.user.club_id, player=c_player)
                        if c_questionnaires.exists() and c_questionnaires[0].id != None:
                            c_questionnaires = c_questionnaires[0]
                        else:
                            c_questionnaires = PlayerQuestionnaireClub(questionnaire=f_row, club=request.user.club_id, player=c_player)
                    else:
                        c_questionnaires = PlayerQuestionnaireUser.objects.filter(questionnaire=f_row, user=cur_user, player=c_player)
                        if c_questionnaires.exists() and c_questionnaires[0].id != None:
                            c_questionnaires = c_questionnaires[0]
                        else:
                            c_questionnaires = PlayerQuestionnaireUser(questionnaire=f_row, user=cur_user, player=c_player)
                    try:
                        c_questionnaires.notes = c_note
                        c_questionnaires.save()
                        res_data += '\nAdded player questionnaires for player.'
                    except:
                        res_data += '\nErr while saving player questionnaires.'
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_player(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Delete player".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    player_id = -1
    try:
        player_id = int(request.POST.get("id", -1))
    except:
        pass
    c_player = None
    if not util_check_access(cur_user, {
        'perms_user': ["players.delete_userplayer"], 
        'perms_club': ["players.delete_clubplayer"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        c_player = ClubPlayer.objects.filter(id=player_id, team=cur_team)
    else:
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
    """
    Return JSON Response as result on POST operation "Edit card's sections".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
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
                f_section.title = utils.set_by_language_code(f_section.title, request.LANGUAGE_CODE, elem['title'])
                f_section.text_id = elem['text_id']
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


def POST_add_delete_card_sections(request, cur_user, to_add = True):
    """
    Return JSON Response as result on POST operation "Add or delete card's sections".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new card section else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    section_id = -1
    parent = -1
    try:
        section_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        parent = int(request.POST.get("parent", -1))
    except:
        pass
    res_data = ""
    if cur_user.is_superuser:
        if to_add:
            found_section = CardSection.objects.filter(id=parent, parent=None)
            new_section = None
            if found_section.exists() and found_section[0].id != None:
                new_section = CardSection(parent=parent)
            else:
                new_section = CardSection()
            try:
                new_section.save()
                res_data += f'New section added successfully.'
            except:
                return JsonResponse({"errors": "Can't save new section", "success": False}, status=400)
        else:
            found_section = CardSection.objects.filter(id=section_id)
            if found_section.exists() and found_section[0].id != None:
                try:
                    found_section.delete()
                    found_sections = CardSection.objects.filter(parent=section_id)
                    if found_sections.exists() and found_sections[0].id != None:
                        for section in found_sections:
                            section.delete()
                    res_data += f'Section deleted successfully.'
                except:
                   return JsonResponse({"errors": "Can't delete section for delete.", "success": False}, status=400) 
            else:
                return JsonResponse({"errors": "Can't find section for delete.", "success": False}, status=400)
    else:
        pass
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_players_table_cols(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit table's columns".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
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
            f_column = PlayersTableColumns.objects.filter(id=elem['id'])
            if f_column.exists() and f_column[0].id != None:
                f_column = f_column[0]
                f_column.title = utils.set_by_language_code(f_column.title, request.LANGUAGE_CODE, elem['title'])
                f_column.text_id = elem['text_id']
                f_column.order = elem['order']
                f_column.visible = elem['visible']
                try:
                    f_column.save()
                    res_data += f'Section with id: [{f_column.id}] is edited successfully.'
                except Exception as e:
                    res_data += f"Err. Cant edit section with id: [{elem['id']}]."
    else:
        pass
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_add_delete_players_table_cols(request, cur_user, to_add = True):
    """
    Return JSON Response as result on POST operation "Add or delete table's columns".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new column else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    col_id = -1
    parent = -1
    try:
        col_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        parent = int(request.POST.get("parent", -1))
    except:
        pass
    res_data = ""
    if cur_user.is_superuser:
        if to_add:
            found_col = PlayersTableColumns.objects.filter(id=parent, parent=None)
            new_col = None
            if found_col.exists() and found_col[0].id != None:
                new_col = PlayersTableColumns(parent=parent)
            else:
                new_col = PlayersTableColumns()
            try:
                new_col.save()
                res_data += f'New column added.'
            except:
                return JsonResponse({"errors": "Can't save new column", "success": False}, status=400)
        else:
            found_col = PlayersTableColumns.objects.filter(id=col_id)
            if found_col.exists() and found_col[0].id != None:
                try:
                    found_col.delete()
                    found_cols = PlayersTableColumns.objects.filter(parent=col_id)
                    if found_cols.exists() and found_cols[0].id != None:
                        for col in found_cols:
                            col.delete()
                except:
                   return JsonResponse({"errors": "Can't delete column for delete.", "success": False}, status=400) 
            else:
                return JsonResponse({"errors": "Can't find column for delete.", "success": False}, status=400)
    else:
        pass
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_characteristics_rows(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit characherstiscs' rows".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    is_nfb = 0
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    try:
        is_nfb = int(request.POST.get("nfb", 0))
    except:
        pass
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    res_data = ""
    if is_nfb == 1:
        if cur_user.is_superuser:
            for elem in post_data:
                f_row = PlayerCharacteristicsRows.objects.filter(id=elem['id'], is_nfb=True)
                if f_row.exists() and f_row[0].id != None:
                    f_row = f_row[0]
                    f_row.title = utils.set_by_language_code(f_row.title, request.LANGUAGE_CODE, elem['title'])
                    f_row.order = elem['order']
                    f_row.visible = elem['visible']
                    try:
                        f_row.save()
                        res_data += f'Section with id: [{f_row.id}] is edited successfully.'
                    except Exception as e:
                        res_data += f"Err. Cant edit section with id: [{elem['id']}]."
        else:
            pass
    else:
        if not util_check_access(cur_user, {
            'perms_user': ["players.change_playercharacteristicsrows", "players.add_playercharacteristicsrows"], 
            'perms_club': ["players.change_playercharacteristicsrows", "players.add_playercharacteristicsrows"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        for elem in post_data:
            f_row = None
            if request.user.club_id is not None:
                f_row = PlayerCharacteristicsRows.objects.filter(id=elem['id'], is_nfb=False, club=request.user.club_id)
            else:
                f_row = PlayerCharacteristicsRows.objects.filter(id=elem['id'], is_nfb=False, user=cur_user)
            if f_row != None and f_row.exists() and f_row[0].id != None:
                f_row = f_row[0]
                f_row.title = utils.set_by_language_code(f_row.title, request.LANGUAGE_CODE, elem['title'])
                f_row.order = elem['order']
                f_row.visible = elem['visible']
                try:
                    f_row.save()
                    res_data += f'Section with id: [{f_row.id}] is edited successfully.'
                except Exception as e:
                    res_data += f"Err. Cant edit section with id: [{elem['id']}]."
    return JsonResponse({"data": res_data, "success": True, 'is_nfb': is_nfb}, status=200)


def POST_add_delete_characteristics_rows(request, cur_user, to_add = True):
    """
    Return JSON Response as result on POST operation "Add or delete characteristics' row".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new characteristic else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    characteristic_id = -1
    parent = -1
    is_nfb = 0
    try:
        characteristic_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        parent = int(request.POST.get("parent", -1))
    except:
        pass
    try:
        is_nfb = int(request.POST.get("nfb", 0))
    except:
        pass
    res_data = ""
    if is_nfb == 1:
        if cur_user.is_superuser:
            if to_add:
                found_row = PlayerCharacteristicsRows.objects.filter(id=parent, parent=None, is_nfb=True)
                new_row = None
                if found_row.exists() and found_row[0].id != None:
                    new_row = PlayerCharacteristicsRows(parent=parent, is_nfb=True)
                else:
                    new_row = PlayerCharacteristicsRows(is_nfb=True)
                try:
                    new_row.save()
                    res_data += f'New characteristic added.'
                except:
                    return JsonResponse({"errors": "Can't save new characteristic", "success": False}, status=400)
            else:
                found_row = PlayerCharacteristicsRows.objects.filter(id=characteristic_id, is_nfb=True)
                if found_row.exists() and found_row[0].id != None:
                    try:
                        found_row.delete()
                        found_rows = PlayerCharacteristicsRows.objects.filter(parent=characteristic_id, is_nfb=True)
                        if found_rows.exists() and found_rows[0].id != None:
                            for col in found_rows:
                                col.delete()
                    except:
                        return JsonResponse({"errors": "Can't delete characteristic for delete.", "success": False}, status=400) 
                else:
                    return JsonResponse({"errors": "Can't find characteristic for delete.", "success": False}, status=400)
        else:
            pass
    else:
        if not util_check_access(cur_user, {
            'perms_user': ["players.delete_playercharacteristicsrows", "players.add_playercharacteristicsrows"], 
            'perms_club': ["players.delete_playercharacteristicsrows", "players.add_playercharacteristicsrows"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if to_add:
            new_row = None
            if request.user.club_id is not None:
                found_row = PlayerCharacteristicsRows.objects.filter(id=parent, parent=None, is_nfb=False, club=request.user.club_id)
                if found_row.exists() and found_row[0].id != None:
                    new_row = PlayerCharacteristicsRows(parent=parent, is_nfb=False, club=request.user.club_id)
                else:
                    new_row = PlayerCharacteristicsRows(is_nfb=False, club=request.user.club_id)
            else:
                found_row = PlayerCharacteristicsRows.objects.filter(id=parent, parent=None, is_nfb=False, user=cur_user)
                if found_row.exists() and found_row[0].id != None:
                    new_row = PlayerCharacteristicsRows(parent=parent, is_nfb=False, user=cur_user)
                else:
                    new_row = PlayerCharacteristicsRows(is_nfb=False, user=cur_user)
            try:
                new_row.save()
                res_data += f'New characteristic added.'
            except:
                return JsonResponse({"errors": "Can't save new characteristic", "success": False}, status=400)
        else:
            found_row = None
            if request.user.club_id is not None:
                found_row = PlayerCharacteristicsRows.objects.filter(id=characteristic_id, is_nfb=False, club=request.user.club_id)
            else:
                found_row = PlayerCharacteristicsRows.objects.filter(id=characteristic_id, is_nfb=False, user=cur_user)
            if found_row != None and found_row.exists() and found_row[0].id != None:
                try:
                    found_row.delete()
                    found_rows = None
                    if request.user.club_id is not None:
                        found_rows = PlayerCharacteristicsRows.objects.filter(parent=characteristic_id, is_nfb=False, club=request.user.club_id)
                    else:
                        found_rows = PlayerCharacteristicsRows.objects.filter(parent=characteristic_id, is_nfb=False, user=cur_user)
                    if found_rows != None and found_rows.exists() and found_rows[0].id != None:
                        for col in found_rows:
                            col.delete()
                except:
                    return JsonResponse({"errors": "Can't delete characteristic.", "success": False}, status=400) 
            else:
                return JsonResponse({"errors": "Can't find characteristic for delete.", "success": False}, status=400)
    return JsonResponse({"data": res_data, "success": True, 'is_nfb': is_nfb}, status=200)


def POST_copy_characteristics_rows(request, cur_user):
    """
    Return JSON Response as result on POST operation "Copy characherstiscs' rows".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    try:
        found_rows = None
        if request.user.club_id is not None:
            found_rows = PlayerCharacteristicsRows.objects.filter(is_nfb=False, club=request.user.club_id)
        else:
            found_rows = PlayerCharacteristicsRows.objects.filter(is_nfb=False, user=cur_user)
        if found_rows != None and found_rows.exists() and found_rows[0].id != None:
            for row in found_rows:
                row.delete()
    except:
        return JsonResponse({"errors": "Can't delete characteristic.", "success": False}, status=400)
    try:
        found_parent_rows = PlayerCharacteristicsRows.objects.filter(is_nfb=True, parent=None)
        if found_parent_rows.exists() and found_parent_rows[0].id != None:
            for parent_row in found_parent_rows:
                old_parent_id = parent_row.id
                parent_row.pk = None
                parent_row.user = cur_user
                parent_row.is_nfb = False
                parent_row.parent = None
                if request.user.club_id is not None:
                    parent_row.club = request.user.club_id
                parent_row.save()
                found_child_rows = PlayerCharacteristicsRows.objects.filter(is_nfb=True, parent=old_parent_id)
                for child_row in found_child_rows:
                    child_row.pk = None
                    child_row.user = cur_user
                    child_row.is_nfb = False
                    child_row.parent = parent_row.id
                    if request.user.club_id is not None:
                        child_row.club = request.user.club_id
                    child_row.save()
    except:
        return JsonResponse({"errors": "Can't copy characteristic.", "success": False}, status=400)
    return JsonResponse({"data": "Ok!", "success": True}, status=200)


def POST_edit_questionnaires_rows(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit questionnaires' rows".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    res_data = ""
    for elem in post_data:
        f_row = None
        if request.user.club_id is not None:
            f_row = PlayerQuestionnairesRows.objects.filter(id=elem['id'], is_nfb=False, club=request.user.club_id)
        else:
            f_row = PlayerQuestionnairesRows.objects.filter(id=elem['id'], is_nfb=False, user=cur_user)
        if f_row != None and f_row.exists() and f_row[0].id != None:
            f_row = f_row[0]
            f_row.title = utils.set_by_language_code(f_row.title, request.LANGUAGE_CODE, elem['title'])
            f_row.order = elem['order']
            f_row.visible = elem['visible']
            try:
                f_row.save()
                res_data += f'Questionnaire row with id: [{f_row.id}] is edited successfully.'
            except Exception as e:
                res_data += f"Err. Cant edit questionnaire row with id: [{elem['id']}]."
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_add_delete_questionnaires_rows(request, cur_user, to_add = True):
    """
    Return JSON Response as result on POST operation "Add or delete questionnaires' row".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new questionnaire else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    row_id = -1
    parent = -1
    try:
        row_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        parent = int(request.POST.get("parent", -1))
    except:
        pass
    res_data = ""
    if to_add:
        new_row = None
        if request.user.club_id is not None:
            found_row = PlayerQuestionnairesRows.objects.filter(id=parent, parent=None, is_nfb=False, club=request.user.club_id)
            if found_row.exists() and found_row[0].id != None:
                new_row = PlayerQuestionnairesRows(parent=parent, is_nfb=False, club=request.user.club_id)
            else:
                new_row = PlayerQuestionnairesRows(is_nfb=False, club=request.user.club_id)
        else:
            found_row = PlayerQuestionnairesRows.objects.filter(id=parent, parent=None, is_nfb=False, user=cur_user)
            if found_row.exists() and found_row[0].id != None:
                new_row = PlayerQuestionnairesRows(parent=parent, is_nfb=False, user=cur_user)
            else:
                new_row = PlayerQuestionnairesRows(is_nfb=False, user=cur_user)
        try:
            new_row.save()
            res_data += f'New row added.'
        except:
            return JsonResponse({"errors": "Can't save new row", "success": False}, status=400)
    else:
        found_row = None
        if request.user.club_id is not None:
            found_row = PlayerQuestionnairesRows.objects.filter(id=row_id, is_nfb=False, club=request.user.club_id)
        else:
            found_row = PlayerQuestionnairesRows.objects.filter(id=row_id, is_nfb=False, user=cur_user)
        if found_row != None and found_row.exists() and found_row[0].id != None:
            try:
                found_row.delete()
                found_rows = PlayerQuestionnairesRows.objects.filter(parent=row_id, is_nfb=False, user=cur_user)
                if found_rows.exists() and found_rows[0].id != None:
                    for row in found_rows:
                        row.delete()
            except:
                return JsonResponse({"errors": "Can't delete row.", "success": False}, status=400) 
        else:
            return JsonResponse({"errors": "Can't find row for delete.", "success": False}, status=400)
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_docs_types(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit documents' types".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    post_data = request.POST.get("data", None)
    try:
        post_data = json.loads(post_data)
    except:
        post_data = None
    if not post_data:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    res_data = ""
    if not util_check_access(cur_user, {
        'perms_user': ["players.change_userdocumenttype", "players.add_userdocumenttype"], 
        'perms_club': ["players.change_clubdocumenttype", "players.add_clubdocumenttype"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    for elem in post_data:
        f_row = None
        if request.user.club_id is not None:
            f_row = ClubDocumentType.objects.filter(id=elem['id'], club=request.user.club_id)
        else:
            f_row = UserDocumentType.objects.filter(id=elem['id'], user=cur_user)
        if f_row != None and f_row.exists() and f_row[0].id != None:
            f_row = f_row[0]
            f_row.name = elem['title']
            f_row.order = elem['order']
            try:
                f_row.save()
                res_data += f'Section with id: [{f_row.id}] is edited successfully.'
            except Exception as e:
                res_data += f"Err. Cant edit section with id: [{elem['id']}]."
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_add_delete_docs_types(request, cur_user, to_add = True):
    """
    Return JSON Response as result on POST operation "Add or delete documents' type".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new characteristic else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    doc_id = -1
    try:
        doc_id = int(request.POST.get("id", -1))
    except:
        pass
    res_data = ""
    if not util_check_access(cur_user, {
        'perms_user': ["players.delete_userdocumenttype", "players.add_userdocumenttype"], 
        'perms_club': ["players.delete_clubdocumenttype", "players.add_clubdocumenttype"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if to_add:
        new_row = None
        if request.user.club_id is not None:
            new_row = ClubDocumentType(club=request.user.club_id)
        else:
            new_row = UserDocumentType(user=cur_user)
        try:
            new_row.save()
            res_data += f'New characteristic added.'
        except:
            return JsonResponse({"errors": "Can't save new characteristic", "success": False}, status=400)
    else:
        found_row = None
        if request.user.club_id is not None:
            found_row = ClubDocumentType.objects.filter(id=doc_id, club=request.user.club_id)
        else:
            found_row = UserDocumentType.objects.filter(id=doc_id, user=cur_user)
        if found_row != None and found_row.exists() and found_row[0].id != None:
            try:
                found_row.delete()
            except:
                return JsonResponse({"errors": "Can't delete characteristic.", "success": False}, status=400) 
        else:
            return JsonResponse({"errors": "Can't find characteristic for delete.", "success": False}, status=400)
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_player_document(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Editing player's document".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param to_add: If true then add new characteristic else delete existed by ID.
    :type to_add: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["players.change_userplayerdocument", "players.add_userplayerdocument", "players.delete_userplayerdocument"], 
        'perms_club': ["players.change_clubplayerdocument", "players.add_clubplayerdocument", "players.delete_clubplayerdocument"]
    }):
        return JsonResponse({"success": False, "err": "Access denied."}, status=400)
    player_id = -1
    doc_id = -1
    doc_type_id = -1
    to_delete = 0
    try:
        player_id = int(request.POST.get("player", -1))
    except:
        pass
    try:
        doc_id = int(request.POST.get("doc", -1))
    except:
        pass
    try:
        doc_type_id = int(request.POST.get("doc_type", -1))
    except:
        pass
    try:
        to_delete = int(request.POST.get("to_delete", 0))
    except:
        pass
    cur_player = None
    cur_doc_type = None
    if request.user.club_id is not None:
        cur_player = ClubPlayer.objects.filter(id=player_id, team=cur_team).first()
        cur_doc_type = ClubDocumentType.objects.filter(id=doc_type_id, club=request.user.club_id).first()
    else:
        cur_player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team).first()
        cur_doc_type = UserDocumentType.objects.filter(id=doc_type_id, user=cur_user).first()
    if cur_player is None or cur_doc_type is None:
        return JsonResponse({"success": False, "err": "Player or DocType not found."}, status=400)
    found_doc = None
    if request.user.club_id is not None:
        found_doc = ClubPlayerDocument.objects.filter(id=doc_id, player=cur_player, type=cur_doc_type, club=request.user.club_id).first()
    else:
        found_doc = UserPlayerDocument.objects.filter(id=doc_id, player=cur_player, type=cur_doc_type, user=cur_user).first()
    if to_delete != 1:
        if found_doc is None:
            if request.user.club_id is not None:
                c_doc = ClubPlayerDocument(player=cur_player, type=cur_doc_type, club=request.user.club_id, trainer=cur_user)
            else:
                c_doc = UserPlayerDocument(player=cur_player, type=cur_doc_type, user=cur_user, trainer=cur_user)
        else:
            c_doc = found_doc
        c_doc.doc_text = request.POST.get("doc_text", "")
        try:
            c_doc.doc = request.FILES['doc_file']
        except:
            return JsonResponse({"errors": "Can't save file. Check if document is not empty.", "success": False}, status=400)
        try:
            c_doc.save()
        except:
            return JsonResponse({"errors": "Can't save new or edited document", "success": False}, status=400)
    else:
        if found_doc:
            try:
                found_doc.doc.delete(save=True)
                found_doc.delete()
            except:
                return JsonResponse({"errors": "Can't delete document", "success": False}, status=400)
    return JsonResponse({"data": None, "success": True}, status=200)



def GET_get_player(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get one player".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    player_id = -1
    try:
        player_id = int(request.GET.get("id", -1))
    except:
        pass
    res_data = {}
    player = None
    if not util_check_access(cur_user, {
        'perms_user': ["players.view_userplayer"], 
        'perms_club': ["players.view_clubplayer"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        player = ClubPlayer.objects.filter(id=player_id, team=cur_team)
    else:
        player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team)
    if player != None and player.exists() and player[0].id != None:
        res_data = player.values()[0]
        res_data['team'] = player[0].team.id
        res_data['team_name'] = player[0].team.name
        res_data['photo'] = photo_url_convert(res_data['photo'])
        if player[0].card and player[0].card.id != None:
            player_card = model_to_dict(player[0].card)
            for key in player_card:
                if key != "id" and key != "records":
                    res_data[key] = player_card[key]
            res_data['card_records'] = []
            for record in player[0].card.records.all():
                res_data['card_records'].append({'date': record.date, 'record': record.record})
        res_data['characteristics'] = []
        f_characteristics_rows = None
        if request.user.club_id is not None:
            f_characteristics_rows = PlayerCharacteristicsRows.objects.exclude(parent__isnull=True).filter(is_nfb=False, club=request.user.club_id)
        else:
            f_characteristics_rows = PlayerCharacteristicsRows.objects.exclude(parent__isnull=True).filter(is_nfb=False, user=cur_user)
        if f_characteristics_rows != None and f_characteristics_rows.exists() and f_characteristics_rows[0].id != None:
            for f_row in f_characteristics_rows:
                f_characteristics_elem = None
                if request.user.club_id is not None:
                    f_characteristics_elem = PlayerCharacteristicClub.objects.filter(characteristics=f_row, player=player[0]).order_by('-date_creation')
                else:
                    f_characteristics_elem = PlayerCharacteristicUser.objects.filter(characteristics=f_row, user=cur_user, player=player[0]).order_by('-date_creation')
                if f_characteristics_elem != None and f_characteristics_elem.exists() and f_characteristics_elem[0].id != None:
                    f_characteristic_one = f_characteristics_elem[0]
                    diff = "-"
                    if len(f_characteristics_elem) > 1 and f_characteristics_elem[1].id != None:
                        if f_characteristics_elem[0].value == f_characteristics_elem[1].value:
                            diff = "="
                        elif f_characteristics_elem[0].value > f_characteristics_elem[1].value:
                            diff = ">"
                        else:
                            diff = "<"
                    res_data['characteristics'].append({
                        'row_id': f_row.id,
                        'value': f_characteristic_one.value,
                        'notes': f_characteristic_one.notes,
                        'diff': diff
                    })
        res_data['questionnaires'] = []
        f_questionnaires_rows = None
        if request.user.club_id is not None:
            f_questionnaires_rows = PlayerQuestionnairesRows.objects.filter(is_nfb=False, club=request.user.club_id)
        else:
            f_questionnaires_rows = PlayerQuestionnairesRows.objects.filter(is_nfb=False, user=cur_user)
        if f_questionnaires_rows != None and f_questionnaires_rows.exists() and f_questionnaires_rows[0].id != None:
            for f_row in f_questionnaires_rows:
                f_questionnaire_elem = None
                if request.user.club_id is not None:
                    f_questionnaire_elem = PlayerQuestionnaireClub.objects.filter(questionnaire=f_row, player=player[0])
                else:
                    f_questionnaire_elem = PlayerQuestionnaireUser.objects.filter(questionnaire=f_row, user=cur_user, player=player[0])
                if f_questionnaire_elem.exists() and f_questionnaire_elem[0].id != None:
                    f_questionnaire_one = f_questionnaire_elem[0]
                    res_data['questionnaires'].append({
                        'row_id': f_row.id,
                        'notes': f_questionnaire_one.notes,
                    })
        return JsonResponse({"data": res_data, "success": True}, status=200)
    return JsonResponse({"errors": "Player not found.", "success": False}, status=400)


def GET_get_players_json(request, cur_user, cur_team, is_for_table=True, return_JsonResponse=True, ignore_archive=False):
    """
    Return JSON Response or object as result on GET operation "Get players in JSON format".
    If return_JsonResponse is False then function return Object
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param is_for_table: If it true then result will be with sorting, filtering, pagination for table.
    :type is_for_table: [bool]
    :param return_JsonResponse: Controls returning type.
    :type return_JsonResponse: [bool]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object

    """
    c_start = 0
    c_length = 10
    try:
        c_start = int(request.GET.get('start'))
    except:
        pass
    try:
        c_length = int(request.GET.get('length'))
    except:
        pass
    is_archive = request.GET.get('is_archive')
    columns = [
        'id', 'surname', 'name', 'patronymic', 'card__birthsday', 
        'card__citizenship', 'team__name', 'card__ref_position__short_name', ['card__is_captain', 'card__is_vice_captain'], 
        'card__ref_foot__short_name', 'card__growth', 'card__weight', 'card__game_num', 
        'card__come', 'card__club_from', 'card__contract_with', 
        'card__contract_by', 'card__notes', 'card__video', 'card_ref_level'
    ]
    column_order_id = 0
    column_order = 'id'
    column_order_dir = ''
    try:
        column_order_id = int(request.GET.get('order[0][column]'))
        column_order = columns[column_order_id]
    except:
        pass
    try:
        column_order_dir = request.GET.get('order[0][dir]')
        column_order_dir = '-' if column_order_dir == "desc" else ''
    except:
        pass
    search_val = ''
    try:
        search_val = request.GET.get('search[value]')
    except:
        pass
    get_team = request.GET.get('team_id')
    if get_team is not None:
        try:
            cur_team = int(get_team)
        except:
            pass
    players_data = []
    if not util_check_access(cur_user, {
        'perms_user': ["players.view_userplayer"], 
        'perms_club': ["players.view_clubplayer"]
    }):
        if return_JsonResponse:
            return JsonResponse({"data": players_data, "success": True, "err": "Access denied."}, status=200)
        else:
            return players_data
    players = None
    if request.user.club_id is not None:
        players = ClubPlayer.objects.filter(team=cur_team)
    else:
        players = UserPlayer.objects.filter(user=cur_user, team=cur_team)
    if players is not None:
        startdate = date.today() - timedelta(days=3)
        if not ignore_archive:
            if is_archive == '1':
                players = players.filter(is_archive=True)
            else:
                players = players.filter(is_archive=False)
        if is_for_table:
            if search_val and search_val != "":
                players = players.filter(Q(surname__istartswith=search_val) | Q(name__istartswith=search_val) | Q(patronymic__istartswith=search_val) | Q(card__citizenship__istartswith=search_val) | Q(team__name__istartswith=search_val) | Q(card__club_from__istartswith=search_val))
            # players = players.order_by(f'{column_order_dir}{column_order}')[c_start:(c_start+c_length)] with pagination
            if isinstance(column_order, list):
                for _i in range(len(column_order)):
                    column_order[_i] = f'{column_order_dir}{column_order[_i]}'
                players = players.order_by(*column_order)
            else:
                if column_order == "card__notes":
                    players.annotate(rec_count=Count('card__records')).order_by(f'{column_order_dir}rec_count')
                elif column_order == "card__video":
                    pass
                else:
                    players = players.order_by(f'{column_order_dir}{column_order}')
        for _i, player in enumerate(players):
            player_position = ""
            player_foot = ""
            player_notes_amount = 0
            player_notes_recent = ""
            try:
                player_position = player.card.ref_position.short_name
            except:
                pass
            try:
                player_foot = player.card.ref_foot.short_name
            except:
                pass
            try:
                player_notes_amount = player.card.records.all().count()
            except:
                pass
            try:
                f_records = player.card.records.filter(date__gte=startdate)
                if f_records.exists() and f_records[0].id != None:
                    player_notes_recent = "color: #be0000;"
            except:
                pass
            captain_val = '<span title="">-</span>'
            try:
                if player.card.is_captain == True:
                    captain_val = '<span title="Капитан" style="color: red;">(K.)</span>'
            except:
                pass
            try:
                if player.card.is_vice_captain == True:
                    captain_val = '<span title="Вице-Капитан">(K.)</span>'
            except:
                pass
            level_val = ""
            try:
                level_val = utils.get_by_language_code(player.card.ref_level.translation_names, request.LANGUAGE_CODE)
            except:
                pass
            player_data = {
                'id': player.id,
                'surname': player.surname,
                'name': player.name,
                'patronymic': player.patronymic,
                'archive': '1' if player.is_archive else '0',
                'citizenship': player.card.citizenship if player.card else "",
                'team': player.team.name if player.team else "",
                'club_from': player.card.club_from if player.card else "",
                'position': player_position,
                'additional_options': f"{captain_val}",
                'foot': player_foot,
                'growth': player.card.growth if player.card else "",
                'weight': player.card.weight if player.card else "",
                'game_num': player.card.game_num if player.card else "",
                'birthsday': player.card.birthsday if player.card else "",
                'come': player.card.come if player.card else "",
                'leave': player.card.leave if player.card else "",
                'contract_with': player.card.contract_with if player.card else "",
                'contract_by': player.card.contract_by if player.card else "",
                'video': "",
                'notes': f'<span style="{player_notes_recent}">записи ({player_notes_amount})</span>',
                'level': level_val
            }
            players_data.append(player_data)
    if return_JsonResponse:
        return JsonResponse({"data": players_data, "success": True}, status=200)
    else:
        return players_data


def GET_get_card_sections(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get card sections".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    res_data = {'sections': [], 'user_params': [], 'mode': "nfb" if cur_user.is_superuser else "user"}
    sections = CardSection.objects.filter(visible=True)
    sections = [entry for entry in sections.values()]
    for section in sections:
        section['title'] = utils.get_by_language_code(section['title'], request.LANGUAGE_CODE)
    res_data["sections"] = sections
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_players_table_cols(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get players' table columns".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    res_data = {'columns': [], 'user_params': [], 'mode': "nfb" if cur_user.is_superuser else "user"}
    columns = PlayersTableColumns.objects.filter()
    columns = [entry for entry in columns.values()]
    for column in columns:
        column['title'] = utils.get_by_language_code(column['title'], request.LANGUAGE_CODE)
    res_data["columns"] = columns
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_characteristics_rows(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get characteristics rows".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    res_data = {'characteristics': [], 'user_params': [], 'mode': "nfb" if cur_user.is_superuser else "user"}
    get_nfb = 0
    try:
        get_nfb = int(request.GET.get("nfb", 0))
    except:
        pass
    characteristics = []
    if get_nfb == 1:
        characteristics = PlayerCharacteristicsRows.objects.filter(is_nfb=True)
    else:
        if request.user.club_id is not None:
            characteristics = PlayerCharacteristicsRows.objects.filter(is_nfb=False, club=request.user.club_id)
        else:
            characteristics = PlayerCharacteristicsRows.objects.filter(is_nfb=False, user=cur_user)
    characteristics = [entry for entry in characteristics.values()]
    for characteristic in characteristics:
        characteristic['title'] = utils.get_by_language_code(characteristic['title'], request.LANGUAGE_CODE)
    res_data["characteristics"] = characteristics
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_questionnaires_rows(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get questionnaires rows".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    res_data = {'questionnaires': [], 'user_params': [], 'mode': "nfb" if cur_user.is_superuser else "user"}
    get_nfb = 0
    try:
        get_nfb = int(request.GET.get("nfb", 0))
    except:
        pass
    questionnaires = []
    if request.user.club_id is not None:
        questionnaires = PlayerQuestionnairesRows.objects.filter(is_nfb=False, club=request.user.club_id)
    else:
        questionnaires = PlayerQuestionnairesRows.objects.filter(is_nfb=False, user=cur_user)
    questionnaires = [entry for entry in questionnaires.values()]
    for questionnaire in questionnaires:
        questionnaire['title'] = utils.get_by_language_code(questionnaire['title'], request.LANGUAGE_CODE)
    res_data["questionnaires"] = questionnaires
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_documents_types_status(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get documents' types".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    res_data = []
    if request.user.club_id is not None:
        res_data = ClubDocumentType.objects.filter(club=request.user.club_id)
    else:
        res_data = UserDocumentType.objects.filter(user=cur_user)
    res_data = [entry for entry in res_data.values()]
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_players_documents(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get players' documents".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["players.view_userplayerdocument"], 
        'perms_club': ["players.view_clubplayerdocument"]
    }):
        return JsonResponse({"success": False, "err": "Access denied."}, status=400)
    res_data = []
    players = None
    if request.user.club_id is not None:
        players = ClubPlayer.objects.filter(team=cur_team, is_archive=False)
    else:
        players = UserPlayer.objects.filter(user=cur_user, team=cur_team, is_archive=False)
    if players is not None:
        for _i, player in enumerate(players):
            player_docs = {}
            docs = None
            if request.user.club_id is not None:
                docs = ClubPlayerDocument.objects.filter(player=player, club=request.user.club_id)
            else:
                docs = UserPlayerDocument.objects.filter(player=player, user=cur_user)
            for doc in docs:
                if doc.type is not None:
                    player_docs[doc.type.id] = doc.id
            res_data.append({
                'id': player.id,
                'surname': player.surname,
                'name': player.name,
                'patronymic': player.patronymic,
                'docs': player_docs
            })
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_player_document(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get player's doc".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["players.view_userplayerdocument"], 
        'perms_club': ["players.view_clubplayerdocument"]
    }):
        return JsonResponse({"success": False, "err": "Access denied."}, status=400)
    player_id = -1
    doc_id = -1
    doc_type_id = -1
    try:
        player_id = int(request.GET.get("player", -1))
    except:
        pass
    try:
        doc_id = int(request.GET.get("doc", -1))
    except:
        pass
    try:
        doc_type_id = int(request.GET.get("doc_type", -1))
    except:
        pass
    cur_player = None
    cur_doc_type = None
    if request.user.club_id is not None:
        cur_player = ClubPlayer.objects.filter(id=player_id, team=cur_team).first()
        cur_doc_type = ClubDocumentType.objects.filter(id=doc_type_id, club=request.user.club_id).first()
    else:
        cur_player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team).first()
        cur_doc_type = UserDocumentType.objects.filter(id=doc_type_id, user=cur_user).first()
    if cur_player is None or cur_doc_type is None:
        return JsonResponse({"success": False, "err": "Player or DocType not found."}, status=400)
    found_doc = None
    if request.user.club_id is not None:
        found_doc = ClubPlayerDocument.objects.filter(id=doc_id, player=cur_player, type=cur_doc_type, club=request.user.club_id).first()
    else:
        found_doc = UserPlayerDocument.objects.filter(id=doc_id, player=cur_player, type=cur_doc_type, user=cur_user).first()
    if found_doc is not None:
        elem_dict = model_to_dict(found_doc, exclude=['doc'])
        doc_url = None
        try:
            doc_url = found_doc.doc.path.split('media')[1]
            doc_url = doc_url.replace('\\', '/')
        except:
            pass
        elem_dict['doc'] = doc_url
        found_doc = elem_dict
    return JsonResponse({"data": found_doc, "success": True}, status=200)
