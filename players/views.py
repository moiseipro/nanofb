
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from users.models import User
from references.models import UserSeason, UserTeam
from players.models import UserPlayer, ClubPlayer



def photo_url_convert(photo_url):
    if "players/img/" not in photo_url or not isinstance(photo_url, str):
        return ""
    return f"/media/{photo_url}"



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
    return render(request, 'players/base_players.html', {
        'players': players,
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user)
    })



@csrf_exempt
def players_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        edit_player_status = 0
        delete_player_status = 0
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
        if edit_player_status == 1:
            player_id = -1
            try:
                player_id = int(request.POST.get("id", -1))
            except:
                pass
            c_player = None
            access_denied = False
            if access_denied:
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            c_player = UserPlayer.objects.filter(id=player_id, user=cur_user[0], team=cur_team)
            if not c_player.exists() or c_player[0].id == None:
                c_team = UserTeam.objects.filter(id=cur_team)
                if not c_team.exists() or c_team[0].id == None:
                    return JsonResponse({"err": "Team not found.", "success": False}, status=400)
                c_player = UserPlayer(user=cur_user[0], team=c_team[0])
            else:
                c_player = c_player[0]
            if c_player == None:
                 return JsonResponse({"err": "Player not found.", "success": False}, status=400)
            print(request.POST)
            c_player.surname = request.POST.get("data[surname]", "")
            c_player.name = request.POST.get("data[name]", "")
            c_player.patronymic = request.POST.get("data[patronymic]", "")
            c_player.citizenship = request.POST.get("data[citizenship]", "")

            img_photo = request.FILES.get('filePhoto')
            if img_photo is not None and img_photo:
                c_player.photo = img_photo
            
            try:
                c_player.save()
                res_data = f'Player with id: [{c_player.id}] is added / edited successfully.'
            except Exception as e:
                return JsonResponse({"err": "Can't edit or add the player.", "success": False}, status=200)
            return JsonResponse({"data": res_data, "success": True}, status=200)
        elif delete_player_status == 1:
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
                c_player = UserPlayer.objects.filter(id=player_id, user=cur_user[0], team=cur_team)
            if c_player == None or not c_player.exists() or c_player[0].id == None:
                return JsonResponse({"errors": "access_error"}, status=400)
            else:
                try:
                    c_player.delete()
                    return JsonResponse({"data": {"id": player_id}, "success": True}, status=200)
                except:
                    return JsonResponse({"errors": "Can't delete exercise"}, status=400)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_player_status = 0
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
        if get_player_status == 1:
            player_id = -1
            try:
                player_id = int(request.GET.get("id", -1))
            except:
                pass
            res_data = {}
            player = UserPlayer.objects.filter(id=player_id, user=cur_user[0], team=cur_team)
            if player.exists() and player[0].id != None:
                res_data = player.values()[0]
                res_data['team'] = player[0].team.name
                res_data['photo'] = photo_url_convert(res_data['photo'])
                return JsonResponse({"data": res_data, "success": True}, status=200)
            return JsonResponse({"errors": "Player not found.", "success": False}, status=400)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

