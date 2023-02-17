from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from users.models import User
from nanofootball.views import util_check_access
import methodology.v_api as v_api
from system_icons.views import get_ui_elements


def methodology(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'menu_methodology' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["exercises.view_userexercise"], 'perms_club': ["exercises.view_clubexercise"]}
    ):
        return redirect("users:profile")
    return render(request, 'methodology/base_methodology.html', {
        'menu_methodology': 'active',
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })


def methodology_api(request):
    """
    Return JsonResponse depending on the request method and the parameter sent. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
        In case of any error client will get next response: JsonResponse({"errors": "access_error"}, status=400).\n
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
    * 'param' -> bla-bla.
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
        copy_exs_status = 0

        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            copy_exs_status = int(request.POST.get("copy_exs", 0))
        except:
            pass
        if copy_exs_status == 1:
            return v_api.POST_copy_exs(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_exs_all_status = 0

        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            get_exs_all_status = int(request.GET.get("get_exs_all", 0))
        except:
            pass
        if get_exs_all_status == 1:
            return v_api.GET_get_exs_all(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)
