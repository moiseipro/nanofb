from django.http import JsonResponse
import json
import re
from datetime import datetime, date, timedelta
from django.forms.models import model_to_dict
from django.db.models import Q
from references.models import MedicineDiagnosisType, MedicineDiseaseSpecific, MedicineDiseaseNonSpecific
from references.models import MedicineDiseaseSpecificUser, MedicineDiseaseSpecificClub, MedicineDiseaseNonSpecificUser, MedicineDiseaseNonSpecificClub
from references.models import MedicineTreatmentType, MedicineNoteType, MedicineAccessType
from players.models import UserPlayer, ClubPlayer
from medicine.models import UserMedicineDiagnosis, ClubMedicineDiagnosis, UserMedicineTreatment, ClubMedicineTreatment
from medicine.models import UserMedicineDocument, ClubMedicineDocument, UserMedicineNote, ClubMedicineNote
from medicine.models import UserMedicineAccess, ClubMedicineAccess
from nanofootball.views import util_check_access
import nanofootball.utils as utils


def get_medicine_refs(request, c_user):
    """
    Return data of Medicine' References with translations.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Dictionary of references.
    :rtype: dict[list[object]]

    """
    refs = {}
    refs['med_diagnosis_type'] = MedicineDiagnosisType.objects.filter().values()
    if request.user.club_id is not None:
        refs['med_disease_specific'] = MedicineDiseaseSpecificClub.objects.filter(club_id=request.user.club_id).values()
        refs['med_disease_nonspecific'] = MedicineDiseaseNonSpecificClub.objects.filter(club_id=request.user.club_id).values()
    else:
        refs['med_disease_specific'] = MedicineDiseaseSpecificUser.objects.filter(user_id=c_user).values()
        refs['med_disease_nonspecific'] = MedicineDiseaseNonSpecificUser.objects.filter(user_id=c_user).values()
    refs['med_treatment_type'] = MedicineTreatmentType.objects.filter().values()
    refs['med_note_type'] = MedicineNoteType.objects.filter().values()
    refs['med_access_type'] = MedicineAccessType.objects.filter().values()
    refs = utils.set_refs_translations(refs, request.LANGUAGE_CODE)
    return refs


def transform_med_value(name, value, request, c_user):
    tmp_val = -1
    if name == "diagnosis_type":
        try:
            tmp_val = int(value)
        except:
            pass
        value = MedicineDiagnosisType.objects.filter(id=tmp_val).first()
    if name == "disease_specific":
        try:
            tmp_val = int(value)
        except:
            pass
        if request.user.club_id is not None:
            value = MedicineDiseaseSpecificClub.objects.filter(id=tmp_val, club_id=request.user.club_id).first()
        else:
            value = MedicineDiseaseSpecificUser.objects.filter(id=tmp_val, user_id=c_user).first()
    if name == "disease_nonspecific":
        try:
            tmp_val = int(value)
        except:
            pass
        if request.user.club_id is not None:
            value = MedicineDiseaseNonSpecificClub.objects.filter(id=tmp_val, club_id=request.user.club_id).first()
        else:
            value = MedicineDiseaseNonSpecificUser.objects.filter(id=tmp_val, user_id=c_user).first()
    if name == "healthy_status":
        value = value == '1'
    if name == "note_type":
        try:
            tmp_val = int(value)
        except:
            pass
        value = MedicineNoteType.objects.filter(id=tmp_val).first()
    if name == "access":
        try:
            tmp_val = int(value)
        except:
            pass
        value = MedicineAccessType.objects.filter(id=tmp_val).first()
    return value
# --------------------------------------------------
# MEDICINE API
def POST_edit_medicine(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit medicine".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    c_med = None
    player_id = -1
    med_id = -1
    try:
        player_id = int(request.POST.get("player_id", -1))
    except:
        pass
    try:
        med_id = int(request.POST.get("id", -1))
    except:
        pass
    c_player = None
    if not util_check_access(cur_user, {
        'perms_user': ["medicine.change_usermedicinediagnosis", "medicine.add_usermedicinediagnosis"], 
        'perms_club': ["medicine.change_clubmedicinediagnosis", "medicine.add_clubmedicinediagnosis"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        c_player = ClubPlayer.objects.filter(id=player_id, team=cur_team).first()
    else:
        c_player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team).first()
    if c_player == None:
            return JsonResponse({"err": "Player not found.", "success": False}, status=400)
    c_name = request.POST.get("name", None)
    c_value = request.POST.get("value", None)
    c_med_type = request.POST.get("type", None)
    if c_name is None or c_med_type is None:
        return JsonResponse({"errors": "Can't parse post data"}, status=400)
    if c_med_type == "disease":
        if request.user.club_id is not None:
            c_med = ClubMedicineDiagnosis.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = ClubMedicineDiagnosis(player=c_player, doctor_user_id=cur_user)
        else:
            c_med = UserMedicineDiagnosis.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = UserMedicineDiagnosis(player=c_player, doctor_user_id=cur_user)
    elif c_med_type == "treatment":
        if request.user.club_id is not None:
            c_med = ClubMedicineTreatment.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = ClubMedicineTreatment(player=c_player, doctor_user_id=cur_user)
        else:
            c_med = UserMedicineTreatment.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = UserMedicineTreatment(player=c_player, doctor_user_id=cur_user)
    elif c_med_type == "document":
        if request.user.club_id is not None:
            c_med = ClubMedicineDocument.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = ClubMedicineDocument(player=c_player, doctor_user_id=cur_user)
        else:
            c_med = UserMedicineDocument.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = UserMedicineDocument(player=c_player, doctor_user_id=cur_user)
    elif c_med_type == "note":
        if request.user.club_id is not None:
            c_med = ClubMedicineNote.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = ClubMedicineNote(player=c_player, doctor_user_id=cur_user)
        else:
            c_med = UserMedicineNote.objects.filter(id=med_id, player=c_player).first()
            if c_med == None:
                c_med = UserMedicineNote(player=c_player, doctor_user_id=cur_user)
    elif c_med_type == "med_access":
        if request.user.club_id is not None:
            c_med = ClubMedicineAccess.objects.filter(player=c_player).first()
            if c_med == None:
                c_med = ClubMedicineAccess(player=c_player, doctor_user_id=cur_user)
        else:
            c_med = UserMedicineAccess.objects.filter(player=c_player).first()
            if c_med == None:
                c_med = UserMedicineAccess(player=c_player, doctor_user_id=cur_user)
    else:
        return JsonResponse({"errors": "Can't find med with current type"}, status=400)
    try:
        if c_name == "treatment_type":
            c_types = c_value.split(',')
            c_med.treatment_type.clear()
            for c_type in c_types:
                type_obj = None
                try:
                    c_type = int(c_type)
                    type_obj = MedicineTreatmentType.objects.filter(id=c_type).first()
                except:
                    pass
                if type_obj is not None:
                    c_med.treatment_type.add(type_obj)
        elif c_name == "doc":
            doc_file = request.FILES['doc']
            c_med.doc = doc_file
        else:
            c_value = transform_med_value(c_name, c_value, request, cur_user)
            setattr(c_med, c_name, c_value)
        c_med.save()
        return JsonResponse({"data": {'id': c_med.id}, "success": True}, status=200)
    except Exception as e:
        return JsonResponse({"errors": f"Can't edit / create med obj. ({e})"}, status=400)


def POST_delete_medicine(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Delete medicine".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    c_med = None
    med_id = -1
    try:
        med_id = int(request.POST.get("id", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["medicine.delete_usermedicinediagnosis"], 
        'perms_club': ["medicine.delete_clubmedicinediagnosis"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    c_med_type = request.POST.get("type", None)
    if c_med_type is None:
        return JsonResponse({"errors": "Can't parse med type"}, status=400)
    if c_med_type == "disease":
        if request.user.club_id is not None:
            c_med = ClubMedicineDiagnosis.objects.filter(id=med_id).first()
        else:
            c_med = UserMedicineDiagnosis.objects.filter(id=med_id).first()
    elif c_med_type == "treatment":
        if request.user.club_id is not None:
            c_med = ClubMedicineTreatment.objects.filter(id=med_id).first()
        else:
            c_med = UserMedicineTreatment.objects.filter(id=med_id).first()
    elif c_med_type == "document":
        if request.user.club_id is not None:
            c_med = ClubMedicineDocument.objects.filter(id=med_id).first()
        else:
            c_med = UserMedicineDocument.objects.filter(id=med_id).first()
    elif c_med_type == "note":
        if request.user.club_id is not None:
            c_med = ClubMedicineNote.objects.filter(id=med_id).first()
        else:
            c_med = UserMedicineNote.objects.filter(id=med_id).first()
    else:
        return JsonResponse({"errors": "Can't find med with current type"}, status=400)
    try:
        if c_med_type == "document":
            c_med.doc.delete(save=True)
        c_med.delete()
        return JsonResponse({"data": {}, "success": True}, status=200)
    except Exception as e:
        return JsonResponse({"errors": f"Can't delete med obj. ({e})"}, status=400)


def POST_edit_med_disease_one(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit medicine's disease one".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    med_disease_id = -1
    try:
        med_disease_id = int(request.POST.get("id", -1))
    except:
        pass
    med_disease_name = request.POST.get("name", "")
    med_disease_type = request.POST.get("type", "")
    med_to_delete = 0
    try:
        med_to_delete = int(request.POST.get("delete", 0))
    except:
        pass
    c_med_disease = None
    if med_disease_type == "specific":
        if request.user.club_id is not None:
            c_med_disease = MedicineDiseaseSpecificClub.objects.filter(id=med_disease_id, club_id=request.user.club_id).first()
            if c_med_disease is None:
                c_med_disease = MedicineDiseaseSpecificClub(club_id=request.user.club_id)
        else:
            c_med_disease = MedicineDiseaseSpecificUser.objects.filter(id=med_disease_id, user_id=cur_user).first()
            if c_med_disease is None:
                c_med_disease = MedicineDiseaseSpecificUser(user_id=cur_user)
    elif med_disease_type == "nonspecific":
        if request.user.club_id is not None:
            c_med_disease = MedicineDiseaseNonSpecificClub.objects.filter(id=med_disease_id, club_id=request.user.club_id).first()
            if c_med_disease is None:
                c_med_disease = MedicineDiseaseNonSpecificClub(club_id=request.user.club_id)
        else:
            c_med_disease = MedicineDiseaseNonSpecificUser.objects.filter(id=med_disease_id, user_id=cur_user).first()
            if c_med_disease is None:
                c_med_disease = MedicineDiseaseNonSpecificUser(user_id=cur_user)
    if med_to_delete == 1:
        try:
            c_med_disease.delete()
            return JsonResponse({"data": "[deleted]", "success": True}, status=200)
        except Exception as e:
            return JsonResponse({"errors": f"Can't delete med obj. ({e})"}, status=400)
    else:
        try:
            c_med_disease.name = med_disease_name
            c_med_disease.translation_names = utils.set_by_language_code(c_med_disease.translation_names, request.LANGUAGE_CODE, med_disease_name)
            c_med_disease.save()
            return JsonResponse({"data": {'id': c_med_disease.id}, "success": True}, status=200)
        except Exception as e:
            return JsonResponse({"errors": f"Can't edit / create med obj. ({e})"}, status=400)


def POST_change_order_med_diseases(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Change medicine's diseases ordering".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    status = True
    ids_data = request.POST.getlist("ids_arr[]", [])
    ordering_data = request.POST.getlist("order_arr[]", [])
    c_type = request.POST.get("type", "")
    logs_arr = []
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_param = None
        if c_type == "specific":
            if request.user.club_id is not None:
                found_param = MedicineDiseaseSpecificClub.objects.filter(id=t_id, club_id=request.user.club_id).first()
            else:
                found_param = MedicineDiseaseSpecificUser.objects.filter(id=t_id, user_id=cur_user).first()
        elif c_type == "nonspecific":
            if request.user.club_id is not None:
                found_param = MedicineDiseaseNonSpecificClub.objects.filter(id=t_id, club_id=request.user.club_id).first()
            else:
                found_param = MedicineDiseaseNonSpecificUser.objects.filter(id=t_id, user_id=cur_user).first()
        if found_param and found_param.id != None:
            found_param.order = t_order
            try:
                found_param.save()
                logs_arr.append(f'Folder [{found_param.id}] is order changed: {t_order}')
            except Exception as e:
                logs_arr.append(f'Folder [{found_param.id}] -> ERROR / Not access or another reason')
    return JsonResponse({"success": status, "type": c_type, "logs": logs_arr}, status=200)



def GET_get_medicine_json(request, cur_user, cur_team, is_for_table=True, return_JsonResponse=True):
    """
    Return JSON Response or object as result on GET operation "Get medicine in JSON format".
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
    columns = [
        'id', 'surname', 'name', 'patronymic', 'card__birthsday',
        'card__game_num', 'injury', 'disease', 'med_date', 'med_status',
        'recovery_period', 'med_access', 'doctor',
    ]
    columns_not_players = [
        'injury', 'disease', 'med_date', 'med_status',
        'recovery_period', 'med_access', 'doctor',
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
        'perms_user': ["players.view_userplayer", "medicine.view_usermedicinediagnosis"], 
        'perms_club': ["players.view_clubplayer", "medicine.view_clubmedicinediagnosis"]
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
        if is_for_table:
            if search_val and search_val != "":
                players = players.filter(Q(surname__istartswith=search_val) | Q(name__istartswith=search_val) | Q(patronymic__istartswith=search_val))
            if isinstance(column_order, list):
                for _i in range(len(column_order)):
                    column_order[_i] = f'{column_order_dir}{column_order[_i]}'
                players = players.order_by(*column_order)
            else:
                if column_order not in columns_not_players:
                    players = players.order_by(f'{column_order_dir}{column_order}')
        for _i, player in enumerate(players):
            medicine_diagnosis = None
            medicine_access = None
            if request.user.club_id is not None:
                medicine_diagnosis = ClubMedicineDiagnosis.objects.filter(player=player).order_by('-date')
                medicine_access = ClubMedicineAccess.objects.filter(player=player)
            else:
                medicine_diagnosis = UserMedicineDiagnosis.objects.filter(player=player).order_by('-date')
                medicine_access = UserMedicineAccess.objects.filter(player=player)
            diag_type_injury = MedicineDiagnosisType.objects.filter(short_name="injury").first()
            diag_type_disease = MedicineDiagnosisType.objects.filter(short_name="disease").first()
            injury_count = 0
            disease_count = 0
            med_date = "---"
            med_status = "---"
            med_status_code = ""
            recovery_period = "---"
            med_access = "---"
            doctor_name = ""
            if medicine_diagnosis != None and medicine_diagnosis.exists() and medicine_diagnosis[0].id != None:
                if diag_type_injury is not None:
                    injury_count = medicine_diagnosis.filter(diagnosis_type=diag_type_injury).count()
                if diag_type_disease is not None:
                    disease_count = medicine_diagnosis.filter(diagnosis_type=diag_type_disease).count()
                if isinstance(medicine_diagnosis[0].date, datetime):
                    med_date = medicine_diagnosis[0].date.strftime('%d/%m/%Y')
                if medicine_diagnosis[0].healthy_status:
                    med_status = "Здоров"
                    med_status_code = "healthy"
                else:
                    if isinstance(medicine_diagnosis[0].diagnosis_type, MedicineDiagnosisType):
                        med_status = utils.get_by_language_code(medicine_diagnosis[0].diagnosis_type.translation_names, request.LANGUAGE_CODE)
                        med_status_code = medicine_diagnosis[0].diagnosis_type.short_name
                recovery_period = medicine_diagnosis[0].recovery_period
                doctor_name = medicine_diagnosis[0].doctor_user_id.personal.full_name
            if medicine_access != None and medicine_access.exists() and medicine_access[0].id != None:
                if medicine_access[0].access:
                    med_access = utils.get_by_language_code(medicine_access[0].access.translation_names, request.LANGUAGE_CODE)
            player_birthsday = ""
            try:
                if isinstance(player.card.birthsday, date):
                    player_birthsday = player.card.birthsday.strftime('%d/%m/%Y')
            except:
                pass
            player_data = {
                'id': player.id,
                'surname': player.surname,
                'name': player.name,
                'patronymic': player.patronymic,
                'game_num': player.card.game_num if player.card else "",
                'birthsday': player_birthsday,
                'injury': injury_count,
                'disease': disease_count,
                'med_date': med_date,
                'med_status': med_status,
                'med_status_code': med_status_code,
                'recovery_period': recovery_period,
                'med_access': med_access,
                'doctor': doctor_name,
            }
            players_data.append(player_data)
    if return_JsonResponse:
        return JsonResponse({"data": players_data, "success": True}, status=200)
    else:
        return players_data


def GET_get_player_medicine(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get one player's medicine".

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
        'perms_user': ["players.view_userplayer", "medicine.view_usermedicinediagnosis"], 
        'perms_club': ["players.view_clubplayer", "medicine.view_clubmedicinediagnosis"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        player = ClubPlayer.objects.filter(id=player_id, team=cur_team)
    else:
        player = UserPlayer.objects.filter(id=player_id, user=cur_user, team=cur_team)
    if player != None and player.exists() and player[0].id != None:
        res_data = player.values()[0]
        player_diagnosis = None
        player_treatment = None
        player_document = None
        player_note = None
        player_access = None
        if request.user.club_id is not None:
            player_diagnosis = ClubMedicineDiagnosis.objects.filter(player=player[0]).order_by('-date')
            player_treatment = ClubMedicineTreatment.objects.filter(player=player[0]).order_by('-date')
            player_document = ClubMedicineDocument.objects.filter(player=player[0]).order_by('-date')
            player_note = ClubMedicineNote.objects.filter(player=player[0]).order_by('-date')
            player_access = ClubMedicineAccess.objects.filter(player=player[0])
        else:
            player_diagnosis = UserMedicineDiagnosis.objects.filter(player=player[0]).order_by('-date')
            player_treatment = UserMedicineTreatment.objects.filter(player=player[0]).order_by('-date')
            player_document = UserMedicineDocument.objects.filter(player=player[0]).order_by('-date')
            player_note = UserMedicineNote.objects.filter(player=player[0]).order_by('-date')
            player_access = UserMedicineAccess.objects.filter(player=player[0])
        if player_diagnosis != None and player_diagnosis.exists() and player_diagnosis[0].id != None:
            t_data = []
            for elem in player_diagnosis:
                elem_dict = model_to_dict(elem)
                elem_dict['doctor'] = f"{elem.doctor_user_id.personal.full_name}"
                t_data.append(elem_dict)
            res_data['player_diagnosis'] = t_data
        else:
            res_data['player_diagnosis'] = []
        if player_treatment != None and player_treatment.exists() and player_treatment[0].id != None:
            t_data = []
            for elem in player_treatment:
                elem_dict = model_to_dict(elem, exclude=['treatment_type'])
                elem_dict['doctor'] = f"{elem.doctor_user_id.personal.full_name}"
                elem_dict['treatment_type'] = list(elem.treatment_type.all().values('id'))
                t_data.append(elem_dict)
            res_data['player_treatment'] = t_data
        else:
            res_data['player_treatment'] = []
        if player_document != None and player_document.exists() and player_document[0].id != None:
            t_data = []
            for elem in player_document:
                elem_dict = model_to_dict(elem, exclude=['doc'])
                elem_dict['doctor'] = f"{elem.doctor_user_id.personal.full_name}"
                doc_url = None
                try:
                    doc_url = elem.doc.path.split('media')[1]
                    doc_url = doc_url.replace('\\', '/')
                except:
                    pass
                elem_dict['doc'] = doc_url
                t_data.append(elem_dict)
            res_data['player_document'] = t_data
        else:
            res_data['player_document'] = []
        if player_note != None and player_note.exists() and player_note[0].id != None:
            t_data = []
            for elem in player_note:
                elem_dict = model_to_dict(elem)
                elem_dict['doctor'] = f"{elem.doctor_user_id.personal.full_name}"
                t_data.append(elem_dict)
            res_data['player_note'] = t_data
        else:
            res_data['player_note'] = []
        if player_access != None and player_access.exists() and player_access[0].id != None:
            res_data['player_access'] = model_to_dict(player_access[0])
        else:
            res_data['player_access'] = {}
        return JsonResponse({"data": res_data, "success": True}, status=200)
    return JsonResponse({"errors": "Player not found.", "success": False}, status=400)


def GET_get_med_all_diseases(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get all medicine diseases with by type".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    c_type = request.GET.get("type", "")
    if not util_check_access(cur_user, {
        'perms_user': ["medicine.view_usermedicinediagnosis"], 
        'perms_club': ["medicine.view_clubmedicinediagnosis"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    res_data = []
    found_elements = None
    if c_type == "specific":
        if request.user.club_id is not None:
            found_elements = MedicineDiseaseSpecificClub.objects.filter(club_id=request.user.club_id)
        else:
            found_elements = MedicineDiseaseSpecificUser.objects.filter(user_id=cur_user)
    elif c_type == "nonspecific":
        if request.user.club_id is not None:
            found_elements = MedicineDiseaseNonSpecificClub.objects.filter(club_id=request.user.club_id)
        else:
            found_elements = MedicineDiseaseNonSpecificUser.objects.filter(user_id=cur_user)
    if found_elements:
        for elem in found_elements:
            e_name = utils.get_by_language_code(elem.translation_names, request.LANGUAGE_CODE)
            res_data.append({'id': elem.id, 'name': e_name})
    return JsonResponse({"data": res_data, "success": True}, status=200)
