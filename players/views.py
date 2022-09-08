
from django.shortcuts import render, redirect
from django.http import JsonResponse
from users.models import User
from references.models import UserSeason, UserTeam
from players.models import UserPlayer, ClubPlayer, PlayerCard, CardSection
from references.models import PlayerTeamStatus, PlayerPlayerStatus, PlayerLevel, PlayerPosition, PlayerFoot
from datetime import datetime
import json
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



def players_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        edit_player_status = 0
        delete_player_status = 0
        edit_card_sections_status = 0
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
        if edit_player_status == 1:
            return v_api.POST_edit_player(request, cur_user[0], cur_team)

            # player_id = -1
            # try:
            #     player_id = int(request.POST.get("id", -1))
            # except:
            #     pass
            # c_player = None
            # access_denied = False
            # if access_denied:
            #     return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            # c_player = UserPlayer.objects.filter(id=player_id, user=cur_user[0], team=cur_team)
            # if not c_player.exists() or c_player[0].id == None:
            #     c_team = UserTeam.objects.filter(id=cur_team)
            #     if not c_team.exists() or c_team[0].id == None:
            #         return JsonResponse({"err": "Team not found.", "success": False}, status=400)
            #     c_player = UserPlayer(user=cur_user[0], team=c_team[0])
            # else:
            #     c_player = c_player[0]
            # if c_player == None:
            #      return JsonResponse({"err": "Player not found.", "success": False}, status=400)
            # print(request.POST)
            # c_player.surname = request.POST.get("data[surname]", "")
            # c_player.name = request.POST.get("data[name]", "")
            # c_player.patronymic = request.POST.get("data[patronymic]", "")

            # new_team_id = set_value_as_int(request, "data[team]", None)
            # new_team = UserTeam.objects.filter(id=new_team_id)
            # if not new_team.exists() or new_team[0].id == None:
            #     return JsonResponse({"err": "Team not found.", "success": False}, status=400)
            # c_player.team = new_team[0]

            # img_photo = request.FILES.get('filePhoto')
            # if img_photo is not None and img_photo:
            #     c_player.photo = img_photo
            
            # try:
            #     c_player.save()
            #     res_data = f'Player with id: [{c_player.id}] is added / edited successfully.'
            # except Exception as e:
            #     return JsonResponse({"err": "Can't edit or add the player.", "success": False}, status=200)
            # c_player_playercard = PlayerCard.objects.filter(player_user=c_player)
            # if not c_player_playercard.exists() or c_player_playercard[0].id == None:
            #     c_player_playercard = PlayerCard(player_user=c_player, user=cur_user[0])
            # else:
            #     c_player_playercard = c_player_playercard[0]
            # c_player_playercard.citizenship = request.POST.get("data[citizenship]", None)
            # c_player_playercard.club_from = request.POST.get("data[club_from]", None)
            # c_player_playercard.growth = set_value_as_int(request, "data[growth]", None)
            # c_player_playercard.weight = set_value_as_int(request, "data[weight]", None)
            # c_player_playercard.game_num = set_value_as_int(request, "data[game_num]", None)
            # c_player_playercard.birthsday = set_value_as_date(request, "data[birthsday]", None)
            # c_player_playercard.ref_team_status = set_value_as_int(request, "data[ref_team_status]", None)
            # c_player_playercard.ref_player_status = set_value_as_int(request, "data[ref_player_status]", None)
            # c_player_playercard.ref_level = set_value_as_int(request, "data[ref_level]", None)
            # c_player_playercard.ref_position = set_value_as_int(request, "data[ref_position]", None)
            # c_player_playercard.ref_foot = set_value_as_int(request, "data[ref_foot]", None)
            # c_player_playercard.come = set_value_as_date(request, "data[come]", None)
            # c_player_playercard.leave = set_value_as_date(request, "data[leave]", None)
            # try:
            #     c_player_playercard.save()
            #     res_data += '\nAdded player card for player.'
            # except:
            #     res_data += '\nErr while saving player card.'
            # return JsonResponse({"data": res_data, "success": True}, status=200)
        elif delete_player_status == 1:
            return v_api.POST_delete_player(request, cur_user[0], cur_team)

            # player_id = -1
            # try:
            #     player_id = int(request.POST.get("id", -1))
            # except:
            #     pass
            # c_player = None
            # access_denied = False
            # if access_denied:
            #     return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            # if not access_denied:
            #     c_player = UserPlayer.objects.filter(id=player_id, user=cur_user[0], team=cur_team)
            # if c_player == None or not c_player.exists() or c_player[0].id == None:
            #     return JsonResponse({"errors": "access_error"}, status=400)
            # else:
            #     try:
            #         c_player.delete()
            #         return JsonResponse({"data": {"id": player_id}, "success": True}, status=200)
            #     except:
            #         return JsonResponse({"errors": "Can't delete exercise"}, status=400)
        elif edit_card_sections_status == 1:
            return v_api.POST_edit_card_sections(request, cur_user[0])

            # post_data = request.POST.get("data", None)
            # try:
            #     post_data = json.loads(post_data)
            # except:
            #     post_data = None
            # if not post_data:
            #     return JsonResponse({"errors": "Can't parse post data"}, status=400)
            # res_data = ""
            # if cur_user[0].is_superuser:
            #     for elem in post_data:
            #         f_section = CardSection.objects.filter(id=elem['id'])
            #         if f_section.exists() and f_section[0].id != None:
            #             f_section = f_section[0]
            #             f_section.title = set_by_language_code(f_section.title, request.LANGUAGE_CODE, elem['title'])
            #             f_section.order = elem['order']
            #             f_section.visible = elem['visible']
            #             try:
            #                 f_section.save()
            #                 res_data += f'Section with id: [{f_section.id}] is edited successfully.'
            #             except Exception as e:
            #                 res_data += f"Err. Cant edit section with id: [{elem['id']}]."
            # else:
            #     pass
            # return JsonResponse({"data": res_data, "success": True}, status=200)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_player_status = 0
        get_card_sections_status = 0
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
            get_card_sections_status = int(request.GET.get("get_card_sections", 0))
        except:
            pass
        if get_player_status == 1:
            return v_api.GET_get_player(request, cur_user[0], cur_team)
            # player_id = -1
            # try:
            #     player_id = int(request.GET.get("id", -1))
            # except:
            #     pass
            # res_data = {}
            # player = UserPlayer.objects.filter(id=player_id, user=cur_user[0], team=cur_team)
            # if player.exists() and player[0].id != None:
            #     res_data = player.values()[0]
            #     res_data['team'] = player[0].team.id
            #     res_data['team_name'] = player[0].team.name
            #     res_data['photo'] = photo_url_convert(res_data['photo'])
            #     player_card = PlayerCard.objects.filter(player_user=player[0].id, user=cur_user[0])
            #     if player_card.exists() and player_card[0].id != None:
            #         player_card = player_card.values()[0]
            #         for key in player_card:
            #             res_data[key] = player_card[key]
            #     return JsonResponse({"data": res_data, "success": True}, status=200)
            # return JsonResponse({"errors": "Player not found.", "success": False}, status=400)
        elif get_card_sections_status == 1:
            return v_api.GET_get_card_sections(request, cur_user[0])

            # res_data = {'sections': [], 'user_params': [], 'mode': "nfb" if cur_user[0].is_superuser else "user"}
            # sections = CardSection.objects.filter()
            # sections = [entry for entry in sections.values()]
            # for section in sections:
            #     section['title'] = get_by_language_code(section['title'], request.LANGUAGE_CODE)
            # res_data["sections"] = sections
            # return JsonResponse({"data": res_data, "success": True}, status=200)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

