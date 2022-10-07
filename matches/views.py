from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.forms.models import model_to_dict

from users.models import User
from references.models import UserTeam, UserSeason
from system_icons.views import get_ui_elements
from matches.models import UserMatch, ClubMatch
import matches.v_api as v_api
import calendar



def matches(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    matches = []
    f_matches = UserMatch.objects.filter(team_id=cur_team, event_id__user_id=cur_user[0])
    for match in f_matches:
        match_obj = model_to_dict(match)
        match_obj['team_name'] = match.team_id.name
        match_obj['date'] = v_api.get_date_str_from_datetime(match.event_id.date, request.LANGUAGE_CODE)
        match_obj['date_day'] = v_api.get_day_from_datetime(match.event_id.date, request.LANGUAGE_CODE)
        match_obj['date_time'] = v_api.get_time_from_datetime(match.event_id.date)
        match_res = v_api.get_match_result(match_obj)
        match_obj['result'] = match_res[0]
        match_obj['goals_equal'] = match_res[1]
        match_obj['duration'] = v_api.get_duration_normal_format(match.duration)
        match_obj['goals'] = match.goals if match.goals != 0 else '-'
        match_obj['o_goals'] = match.o_goals if match.o_goals != 0 else '-'
        match_obj['penalty'] = match.penalty if match.penalty != 0 else '-'
        match_obj['o_penalty'] = match.o_penalty if match.o_penalty != 0 else '-'
        matches.append(match_obj)
    refs = {}
    # refs = v_api.get_players_refs(request)
    return render(request, 'matches/base_matches.html', {
        'matches': matches,
        'refs': refs,
        'menu_matches': 'active',
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
        'ui_elements': get_ui_elements(request)
    })


def match(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    match = v_api.GET_get_match(request, cur_user[0], cur_team, False)
    if match == None:
        return redirect("matches:base_matches")
    refs = {}
    # refs = v_api.get_players_refs(request)
    return render(request, 'matches/base_match.html', {
        'refs': refs,
        'menu_matches': 'active',
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
        'ui_elements': get_ui_elements(request)
    })


def matches_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        edit_match_status = 0
        delete_match_status = 0
        add_players_protocol_status = 0
        delete_players_protocol_status = 0
        edit_players_protocol_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            edit_match_status = int(request.POST.get("edit_match", 0))
        except:
            pass
        try:
            delete_match_status = int(request.POST.get("delete_match", 0))
        except:
            pass
        try:
            add_players_protocol_status = int(request.POST.get("add_players_protocol", 0))
        except:
            pass
        try:
            delete_players_protocol_status = int(request.POST.get("delete_players_protocol", 0))
        except:
            pass
        try:
            edit_players_protocol_status = int(request.POST.get("edit_players_protocol", 0))
        except:
            pass
        if edit_match_status == 1:
            return v_api.POST_edit_match(request, cur_user[0], cur_team)
        elif delete_match_status == 1:
            return v_api.POST_delete_match(request, cur_user[0], cur_team)
        elif add_players_protocol_status == 1:
            return v_api.POST_add_delete_players_protocol(request, cur_user[0], True)
        elif delete_players_protocol_status == 1:
            return v_api.POST_add_delete_players_protocol(request, cur_user[0], False)
        elif edit_players_protocol_status == 1:
            return v_api.POST_edit_players_protocol(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_match_status = 0
        get_match_protocol_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            get_match_status = int(request.GET.get("get_match", 0))
        except:
            pass
        try:
            get_match_protocol_status = int(request.GET.get("get_match_protocol", 0))
        except:
            pass
        if get_match_status == 1:
            return v_api.GET_get_match(request, cur_user[0], cur_team)
        elif get_match_protocol_status == 1:
            return v_api.GET_get_match_protocol(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

