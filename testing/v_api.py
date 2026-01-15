import datetime
import json
from django.http import JsonResponse
from django.db.models import Sum, Q
from django.forms.models import model_to_dict
from users.models import User
from testing.models import Test, UserPlayerResult, ClubPlayerResult
from players.models import UserPlayer, ClubPlayer
from nanofootball.views import util_check_access
import nanofootball.utils as utils


# --------------------------------------------------
# TESTING API
def POST_edit_test_one(request, cur_user, cur_team):
    status = False
    c_id = -1
    c_parameters = []
    delete_status = -1
    try:
        c_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        delete_status = int(request.POST.get("delete", -1))
    except:
        pass
    try:
        c_parameters = json.loads(request.POST.get("parameters", ""))
    except:
        pass
    c_title = request.POST.get("title", "")
    if not util_check_access(cur_user, {
        'perms_user': ["testing.change_test"], 
        'perms_club': ["testing.change_test"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False, "status": "access_denied"}, status=400)
    c_test = Test.objects.filter(id=c_id, created_by=cur_user).first()
    if delete_status != 1:
        if not c_title.strip() or not c_parameters:
            return JsonResponse({"err": "Empty Data.", "success": False, "status": "empty_data"}, status=400)
        if c_test:
            c_test.name = c_title
            c_test.parameters = c_parameters
        else:
            c_test = Test(name=c_title, parameters=c_parameters, created_by=cur_user)
        try:
            c_test.save()
            status = True
        except Exception as e:
            pass
    else:
        if c_test:
            try:
                c_test.delete()
                status = True
            except Exception as e:
                pass
    return JsonResponse({"success": status}, status=200)


def POST_edit_test_result_one(request, cur_user, cur_team):
    status = False
    c_id = -1
    c_date = None
    c_parameters = []
    delete_status = -1
    try:
        c_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        c_date = datetime.datetime.strptime(request.POST.get("date", ""), '%Y-%m-%d').date()
    except:
        pass
    try:
        delete_status = int(request.POST.get("delete", -1))
    except:
        pass
    try:
        c_parameters = json.loads(request.POST.get("parameters", ""))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["testing.change_test"], 
        'perms_club': ["testing.change_test"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False, "status": "access_denied"}, status=400)
    c_test = Test.objects.filter(id=c_id, created_by=cur_user).first()
    if not c_test:
        return JsonResponse({"err": "Cant find test with this ID.", "success": False, "status": "bad_test_id"}, status=400)
    c_test_results = None
    if request.user.club_id is not None:
        c_test_results = ClubPlayerResult.objects.filter(test=c_test, player__team=cur_team, date=c_date)
    else:
        c_test_results = UserPlayerResult.objects.filter(test=c_test, player__team=cur_team, date=c_date)
    if not isinstance(c_parameters, dict):
        return JsonResponse({"err": "Bad parameters' data.", "success": False, "status": "bad_params"}, status=400)
    all_players = 0
    all_players_saved = 0
    for player_id in c_parameters:
        all_players += 1
        found_player = None
        if request.user.club_id is not None:
            found_player = ClubPlayer.objects.filter(team=cur_team, id=player_id).first()
        else:
            found_player = UserPlayer.objects.filter(user=cur_user, team=cur_team, id=player_id).first()
        if not found_player:
            continue
        c_test_result = c_test_results.filter(player=found_player).first()
        if delete_status != 1:
            if c_test_result:
                c_test_result.values = c_parameters[player_id]
            else:
                if request.user.club_id is not None:
                    c_test_result = ClubPlayerResult(test=c_test, date=c_date, player=found_player, values=c_parameters[player_id])
                else:
                    c_test_result = UserPlayerResult(test=c_test, date=c_date, player=found_player, values=c_parameters[player_id])
            try:
                c_test_result.save()
                status = True
                all_players_saved += 1
            except Exception as e:
                pass
        else:
            print("Here?")
            if c_test_result:
                try:
                    print(f"Deleting: {c_test_result}")
                    c_test_result.delete()
                    status = True
                    all_players_saved += 1
                except Exception as e:
                    print(e)
                    pass
    return JsonResponse({"success": status, 'stats': f"{all_players_saved} / {all_players}"}, status=200)



def GET_get_tests_all(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get all tests".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["testing.view_test"], 
        'perms_club': ["testing.view_test"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    res_exs = []
    only_titles = False
    try:
        only_titles = int(request.POST.get("only_titles", -1)) == 1
    except:
        pass
    found_tests = Test.objects.filter(created_by=cur_user)
    if only_titles:
        res_exs = list(found_tests.values('id', 'name'))
    else:
        res_exs = list(found_tests.values())
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_test_one(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get one test".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    c_id = -1
    try:
        c_id = int(request.GET.get("id", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["testing.view_test"], 
        'perms_club': ["testing.view_test"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    data_res = {}
    found_test = Test.objects.filter(id=c_id, created_by=cur_user).first()
    if found_test:
        data_res = model_to_dict(found_test)
    else:
        data_res = {'id': "", 'name': "", 'parameters': []}
    return JsonResponse({"data": data_res, "success": True}, status=200)


def GET_get_players(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get players from cur_team".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["players.view_userplayer"], 
        'perms_club': ["players.view_clubplayer"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    
    players = None
    if request.user.club_id is not None:
        players = ClubPlayer.objects.filter(team=cur_team)
    else:
        players = UserPlayer.objects.filter(user=cur_user, team=cur_team)
    res_exs = []
    if players:
        for p in players:
            res_exs.append({
                'id': p.id, 'name': p.get_part_name(),
                'birthsday': p.card.birthsday if p.card.birthsday else "",
                'growth': p.card.growth if p.card.growth else "",
                'weight': p.card.weight if p.card.weight else "",
            })
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_all_tests_results(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get all tests results".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    c_id = -1
    try:
        c_id = int(request.GET.get("id", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["testing.view_test"], 
        'perms_club': ["testing.view_test"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    found_test = Test.objects.filter(id=c_id, created_by=cur_user).first()
    if not found_test:
        return JsonResponse({"err": "Cant find test with current ID.", "success": False}, status=400)
    res_exs = []
    if request.user.club_id is not None:
        found_results = ClubPlayerResult.objects.filter(test=found_test, player__team=cur_team).order_by('date')
    else:
        found_results = UserPlayerResult.objects.filter(test=found_test, player__team=cur_team).order_by('date')
    if found_results:
        res_exs = list(found_results.values())
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_test_result_one(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get one test result".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    c_id = -1
    c_date = None
    try:
        c_id = int(request.GET.get("id", -1))
    except:
        pass
    try:
        c_date = datetime.datetime.strptime(request.GET.get("date", ""), '%Y-%m-%d').date()
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["testing.view_test"], 
        'perms_club': ["testing.view_test"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    found_test = Test.objects.filter(id=c_id, created_by=cur_user).first()
    if not found_test:
        return JsonResponse({"err": "Cant find test with current ID.", "success": False}, status=400)
    res_exs = []
    if request.user.club_id is not None:
        found_results = ClubPlayerResult.objects.filter(test=found_test, player__team=cur_team, date=c_date)
    else:
        found_results = UserPlayerResult.objects.filter(test=found_test, player__team=cur_team, date=c_date)
    if found_results:
        res_exs = list(found_results.values())
    return JsonResponse({"data": res_exs, "success": True}, status=200)
