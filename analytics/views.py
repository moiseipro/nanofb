from django.shortcuts import render, redirect
from django.http import JsonResponse
from users.models import User
from references.models import UserSeason, UserTeam
import analytics.v_api as v_api
from system_icons.views import get_ui_elements



def analytics(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    cur_season = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    try:
        cur_season = int(request.session['season'])
    except:
        pass
    refs = {}
    folders = v_api.get_exs_folders(cur_user[0], cur_team)
    months = v_api.get_season_months(request, cur_season)
    return render(request, 'analytics/base_analytics.html', {
        'refs': refs, 
        'folders': folders,
        'months': months,
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
        'ui_elements': get_ui_elements(request)
    })


def analytics_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        edit_analytics_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            edit_analytics_status = int(request.POST.get("edit_analytics", 0))
        except:
            pass
        if edit_analytics_status == 1:
            return v_api.POST_edit_analytics(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_analytics_all_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        cur_season = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            cur_season = int(request.session['season'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            get_analytics_all_status = int(request.GET.get("get_analytics_all", 0))
        except:
            pass
        if get_analytics_all_status == 1:
            return v_api.GET_get_analytics_in_team(request, cur_user[0], cur_team, cur_season)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

