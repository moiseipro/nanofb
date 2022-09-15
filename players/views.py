
from django.shortcuts import render, redirect
from django.http import JsonResponse
from users.models import User
from references.models import UserSeason, UserTeam
from players.models import UserPlayer, ClubPlayer, CardSection
import players.v_api as v_api



def players(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    players = UserPlayer.objects.filter(user=cur_user[0], team=cur_team)
    refs = {}
    refs = v_api.get_players_refs(request)
    return render(request, 'players/base_players.html', {
        'players': players,
        'refs': refs,
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
    })


def player(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    selected_player_id = -1
    try:
        selected_player_id = int(request.GET.get('id', -1))
    except:
        pass
    selected_player = UserPlayer.objects.filter(user=cur_user[0], id=selected_player_id)
    if selected_player.exists() and selected_player[0].id != None:
        if selected_player[0].team:
            cur_team = selected_player[0].team.id
            request.session['team'] = str(cur_team)
            print(type(request.session['team']))
    players = UserPlayer.objects.filter(user=cur_user[0], team=cur_team)
    refs = {}
    refs = v_api.get_players_refs(request)
    return render(request, 'players/base_player.html', {
        'players': players,
        'refs': refs,
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
    })


def players_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        edit_player_status = 0
        delete_player_status = 0
        edit_card_sections_status = 0
        edit_players_table_cols_status = 0
        add_players_table_cols_status = 0
        delete_players_table_cols_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            edit_player_status = int(request.POST.get("edit_player", 0))
        except:
            pass
        try:
            delete_player_status = int(request.POST.get("delete_player", 0))
        except:
            pass
        try:
            edit_card_sections_status = int(request.POST.get("edit_card_sections", 0))
        except:
            pass
        try:
            edit_players_table_cols_status = int(request.POST.get("edit_players_table_cols", 0))
        except:
            pass
        try:
            add_players_table_cols_status = int(request.POST.get("add_players_table_cols", 0))
        except:
            pass
        try:
            delete_players_table_cols_status = int(request.POST.get("delete_players_table_cols", 0))
        except:
            pass
        if edit_player_status == 1:
            return v_api.POST_edit_player(request, cur_user[0], cur_team)
        elif delete_player_status == 1:
            return v_api.POST_delete_player(request, cur_user[0], cur_team)
        elif edit_card_sections_status == 1:
            return v_api.POST_edit_card_sections(request, cur_user[0])
        elif edit_players_table_cols_status == 1:
            return v_api.POST_edit_players_table_cols(request, cur_user[0])
        elif add_players_table_cols_status == 1:
            return v_api.POST_add_delete_players_table_cols(request, cur_user[0])
        elif delete_players_table_cols_status == 1:
            return v_api.POST_add_delete_players_table_cols(request, cur_user[0], False)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_player_status = 0
        get_card_sections_status = 0
        get_players_json_status = 0
        get_players_table_cols_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            get_player_status = int(request.GET.get("get_player", 0))
        except:
            pass
        try:
            get_players_json_status = int(request.GET.get("get_players_json", 0))
        except:
            pass
        try:
            get_card_sections_status = int(request.GET.get("get_card_sections", 0))
        except:
            pass
        try:
            get_players_table_cols_status = int(request.GET.get("get_players_table_cols", 0))
        except:
            pass
        if get_player_status == 1:
            return v_api.GET_get_player(request, cur_user[0], cur_team)
        elif get_players_json_status == 1:
            return v_api.GET_get_players_json(request, cur_user[0], cur_team)
        elif get_card_sections_status == 1:
            return v_api.GET_get_card_sections(request, cur_user[0])
        elif get_players_table_cols_status == 1:
            return v_api.GET_get_players_table_cols(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)


