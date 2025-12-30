from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from users.models import User
from nanofootball.views import util_check_access
from system_icons.views import get_ui_elements
import testing.v_api as v_api
import nanofootball.utils as utils


def testing(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'menu_testing' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id", "personal__last_name", "personal__first_name")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["testing.view_test"], 'perms_club': ["testing.view_test"]}
    ):
        return redirect("users:profile")
    impersonate_is_superuser = False
    if "impersonate_is_superuser" in request.session:
        impersonate_is_superuser = True
    return render(request, 'testing/base_testing.html', {
        'menu_testing': 'active',
        'impersonate_is_superuser': impersonate_is_superuser,
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'user_name': f'{cur_user[0].personal.last_name} {cur_user[0].personal.first_name}',
        'ui_elements': get_ui_elements(request)
    })


def testing_api(request):
    """
    Return JsonResponse depending on the request method and the parameter sent. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
        In case of any error client will get next response: JsonResponse({"errors": "access_error"}, status=400).\n
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
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
        edit_test_one_status = 0
        edit_test_result_one_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            edit_test_one_status = int(request.POST.get("edit_test_one", 0))
        except:
            pass
        try:
            edit_test_result_one_status = int(request.POST.get("edit_test_result_one", 0))
        except:
            pass
        if edit_test_one_status == 1:
            return v_api.POST_edit_test_one(request, cur_user[0], cur_team)
        elif edit_test_result_one_status == 1:
            return v_api.POST_edit_test_result_one(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_all_tests_status = 0
        get_test_one_status = 0
        get_players_status = 0
        get_all_tests_results_status = 0
        get_test_result_one_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            get_all_tests_status = int(request.GET.get("get_all_tests", 0))
        except:
            pass
        try:
            get_test_one_status = int(request.GET.get("get_test_one", 0))
        except:
            pass
        try:
            get_players_status = int(request.GET.get("get_players", 0))
        except:
            pass
        try:
            get_all_tests_results_status = int(request.GET.get("get_all_tests_results", 0))
        except:
            pass
        try:
            get_test_result_one_status = int(request.GET.get("get_test_result_one", 0))
        except:
            pass
        if get_all_tests_status == 1:
            return v_api.GET_get_tests_all(request, cur_user[0], cur_team)
        elif get_test_one_status == 1:
            return v_api.GET_get_test_one(request, cur_user[0], cur_team)
        elif get_players_status == 1:
            return v_api.GET_get_players(request, cur_user[0], cur_team)
        elif get_all_tests_results_status == 1:
            return v_api.GET_get_all_tests_results(request, cur_user[0], cur_team)
        elif get_test_result_one_status == 1:
            return v_api.GET_get_test_result_one(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)
