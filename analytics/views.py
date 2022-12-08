from django.shortcuts import render, redirect
from django.http import JsonResponse
from users.models import User
from references.models import UserSeason, UserTeam
from nanofootball.views import util_check_access
import analytics.v_api as v_api
from system_icons.views import get_ui_elements



def analytics(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'refs' -> References of Analytics Section.
    * 'folders' -> UserFolder or ClubFolder objects filtered by user and current team.
    * 'months' -> List of current season's months.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], {
        'perms_user': ["matches.analytics_usermatch", "trainings.analytics_usertraining"],
        'perms_club': ["matches.analytics_clubmatch", "trainings.analytics_clubtraining"]
    }):
        return redirect("users:profile")
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
    folders = v_api.get_exs_folders(request, cur_user[0], cur_team)
    months = v_api.get_season_months(request, cur_season)
    return render(request, 'analytics/base_analytics.html', {
        'refs': refs, 
        'folders': folders,
        'months': months,
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })


def analytics_api(request):
    """
    Return JsonResponse depending on the request method and the parameter sent. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
        In case of any error client will get next response: JsonResponse({"errors": "access_error"}, status=400).\n
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
    * 'get_analytics_all' -> Getting analytics for the selected season, for the current team and additionally for a specific period of time. Check analytics.v_api.GET_get_analytics_in_team() for see more.
    * 'edit_analytics' -> None
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an JsonResponse with next parameteres:\n
    * 'errors' -> Error text in case getting any error.
    * 'status' -> Response code.
    * 'data' -> Requiered data depending on the request method and the parameter sent, if status code is OK.
    :rtype: [JsonResponse]

    """
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        edit_analytics_status = 0
        reset_cache_status = 0
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
            edit_analytics_status = int(request.POST.get("edit_analytics", 0))
        except:
            pass
        try:
            reset_cache_status = int(request.POST.get("reset_cache", 0))
        except:
            pass
        if edit_analytics_status == 1:
            return v_api.POST_edit_analytics(request, cur_user[0], cur_team)
        elif reset_cache_status == 1:
            return v_api.POST_reset_cache(request, cur_user[0], cur_team, cur_season)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_analytics_all_status = 0
        get_analytics_by_folders_status = 0
        get_analytics_by_folders_full_status = 0
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
        try:
            get_analytics_by_folders_status = int(request.GET.get("get_analytics_by_folders", 0))
        except:
            pass
        try:
            get_analytics_by_folders_full_status = int(request.GET.get("get_analytics_by_folders_full", 0))
        except:
            pass
        if get_analytics_all_status == 1:
            return v_api.GET_get_analytics_in_team(request, cur_user[0], cur_team, cur_season)
        elif get_analytics_by_folders_status == 1:
            return v_api.GET_get_analytics_by_folders_in_team(request, cur_user[0], cur_team, cur_season)
        elif get_analytics_by_folders_full_status == 1:
            return v_api.GET_get_analytics_by_folders_full_in_team(request, cur_user[0], cur_team, cur_season)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

