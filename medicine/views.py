from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.forms.models import model_to_dict
from users.models import User
from system_icons.views import get_ui_elements
from nanofootball.views import util_check_access
import medicine.v_api as v_api



def medicine(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'medicine' -> Medicine objects filtered by user.
    * 'menu_medicine' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["players.view_userplayer", "medicine.view_usermedicinediagnosis"], 
         'perms_club': ["players.change_clubplayer", "medicine.view_clubmedicinediagnosis"]}
    ):
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
    medicine = []
    refs = v_api.get_medicine_refs(request, cur_user[0])
    return render(request, 'medicine/base_medicine.html', {
        'medicine': medicine,
        'refs': refs,
        'menu_medicine': 'active',
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })


def medicine_api(request):
    """
    Return JsonResponse depending on the request method and the parameter sent. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
        In case of any error client will get next response: JsonResponse({"errors": "access_error"}, status=400).\n
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
    * 'edit_match' -> Edit match including creating new match.
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
        edit_medicine_status = 0
        delete_medicine_status = 0
        edit_med_disease_one_status = 0
        change_order_med_diseases_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            edit_medicine_status = int(request.POST.get("edit_medicine", 0))
        except:
            pass
        try:
            delete_medicine_status = int(request.POST.get("delete_medicine", 0))
        except:
            pass
        try:
            edit_med_disease_one_status = int(request.POST.get("edit_med_disease_one", 0))
        except:
            pass
        try:
            change_order_med_diseases_status = int(request.POST.get("change_order_med_diseases", 0))
        except:
            pass
        if edit_medicine_status == 1:
            return v_api.POST_edit_medicine(request, cur_user[0], cur_team)
        elif delete_medicine_status == 1:
            return v_api.POST_delete_medicine(request, cur_user[0], cur_team)
        elif edit_med_disease_one_status == 1:
            return v_api.POST_edit_med_disease_one(request, cur_user[0], cur_team)
        elif change_order_med_diseases_status == 1:
            return v_api.POST_change_order_med_diseases(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_medicine_status = 0
        get_medicine_json_status = 0
        get_medicine_json_table_status = 0
        get_player_medicine_status = 0
        get_med_all_diseases_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            get_medicine_status = int(request.GET.get("get_match", 0))
        except:
            pass
        try:
            get_medicine_json_status = int(request.GET.get("get_medicine_json", 0))
        except:
            pass
        try:
            get_medicine_json_table_status = int(request.GET.get("get_medicine_json_table", 0))
        except:
            pass
        try:
            get_player_medicine_status = int(request.GET.get("get_player_medicine", 0))
        except:
            pass
        try:
            get_med_all_diseases_status = int(request.GET.get("get_med_all_diseases", 0))
        except:
            pass
        if get_medicine_status == 1:
            return v_api.GET_get_medicine(request, cur_user[0], cur_team)
        elif get_medicine_json_status == 1:
            return v_api.GET_get_medicine_json(request, cur_user[0], cur_team, False)
        elif get_medicine_json_table_status == 1:
            return v_api.GET_get_medicine_json(request, cur_user[0], cur_team, True)
        elif get_player_medicine_status == 1:
            return v_api.GET_get_player_medicine(request, cur_user[0], cur_team)
        elif get_med_all_diseases_status == 1:
            return v_api.GET_get_med_all_diseases(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)
