from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.db.models import Q, Count, F
from django.views.decorators.clickjacking import xframe_options_sameorigin
from users.models import User
from nanofootball.views import util_check_access
import helper_football.v_api as v_api
from exercises.models import AdminFolder
from video.models import VideoSource
from taggit.models import Tag
from system_icons.views import get_ui_elements


@xframe_options_sameorigin
def helper_football(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'menu_helper_football' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["helper_football.view_userarticle"], 'perms_club': ["helper_football.view_clubarticle"]}
    ):
        return redirect("users:profile")
    video_params = {}
    video_params['sources'] = VideoSource.objects.all().annotate(videos=Count('video')).order_by('-videos')
    video_params['folders'] = AdminFolder.objects.exclude(parent=None).order_by('parent', 'order')
    video_params['tags'] = Tag.objects.all()
    return render(request, 'helper_football/base_helper_football.html', {
        'menu_helper_football': 'active',
        'video_params': video_params,
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })


def helper_football_api(request):
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
        edit_folder_status = 0
        delete_folder_status = 0
        change_order_folder_status = 0
        edit_article_status = 0
        delete_article_status = 0
        change_order_article_status = 0
        change_user_param_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            edit_folder_status = int(request.POST.get("edit_folder", 0))
        except:
            pass
        try:
            delete_folder_status = int(request.POST.get("delete_folder", 0))
        except:
            pass
        try:
            change_order_folder_status = int(request.POST.get("change_order_folder", 0))
        except:
            pass
        try:
            edit_article_status = int(request.POST.get("edit_article", 0))
        except:
            pass
        try:
            delete_article_status = int(request.POST.get("delete_article", 0))
        except:
            pass
        try:
            change_order_article_status = int(request.POST.get("change_order_article", 0))
        except:
            pass
        try:
            change_user_param_status = int(request.POST.get("change_user_param", 0))
        except:
            pass
        if edit_folder_status == 1:
            return v_api.POST_edit_folder(request, cur_user[0])
        if delete_folder_status == 1:
            return v_api.POST_delete_folder(request, cur_user[0])
        if change_order_folder_status == 1:
            return v_api.POST_change_order_folder(request, cur_user[0])
        if edit_article_status == 1:
            return v_api.POST_edit_article(request, cur_user[0])
        if delete_article_status == 1:
            return v_api.POST_delete_article(request, cur_user[0])
        if change_order_article_status == 1:
            return v_api.POST_change_order_article(request, cur_user[0])
        if change_user_param_status == 1:
            return v_api.POST_change_user_param(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_folders_all_status = 0
        get_articles_all_status = 0
        get_article_one_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            get_folders_all_status = int(request.GET.get("get_folders_all", 0))
        except:
            pass
        try:
            get_articles_all_status = int(request.GET.get("get_articles_all", 0))
        except:
            pass
        try:
            get_article_one_status = int(request.GET.get("get_article_one", 0))
        except:
            pass
        if get_folders_all_status == 1:
            return v_api.GET_get_folders_all(request, cur_user[0])
        if get_articles_all_status == 1:
            return v_api.GET_get_articles_all(request, cur_user[0])
        if get_article_one_status == 1:
            return v_api.GET_get_article_one(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)
