from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.db.models import Q, Count, F
from django.views.decorators.clickjacking import xframe_options_exempt
from users.models import User
from exercises.models import UserFolder, ClubFolder, AdminFolder, UserExercise, ClubExercise, AdminExercise
from references.models import UserSeason, UserTeam
from references.models import ExsDescriptionTemplate
from video.models import VideoSource
from taggit.models import Tag
from nanofootball.views import util_check_access
import exercises.v_api as v_api
from system_icons.views import get_ui_elements
from nf_presentation import from_single_exercise as nf_presentation__from_single_exercise
import json
import nanofootball.utils as utils


def exercises(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'folders' -> UserFolder or ClubFolder objects filtered by user and current team.
    * 'folders_only_view' -> True or False for folders_view_mode.
    * 'nfb_folders' -> AdminFolder objects.
    * 'refs' -> References of Exercises Section.
    * 'is_exercises' -> True or False for section "Exercises".
    * 'menu_exercises' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id", "personal__last_name", "personal__first_name")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["exercises.view_userexercise"], 'perms_club': ["exercises.view_clubexercise"]}
    ):
        return redirect("users:profile")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    is_show_club_folders = cur_user[0].is_superuser or request.user.club_id is not None
    is_show_club_folders = False
    found_folders = []
    found_club_folders = []
    found_nfb_folders = []
    refs = {}
    found_folders, found_club_folders, found_nfb_folders, refs = v_api.get_exercises_params(request, cur_user[0], cur_team)
    exs_tags = v_api.get_exercises_tags(request, cur_user[0], cur_team, True)
    exs_features = v_api.get_exercises_features(request, cur_user[0], cur_team)
    video_params = {}
    video_params['sources'] = VideoSource.objects.all().annotate(videos=Count('video')).order_by('-videos')

    impersonate_is_superuser = False
    if "impersonate_is_superuser" in request.session:
        impersonate_is_superuser = True
    return render(request, 'exercises/base_exercises.html', {
        'folders': found_folders,
        'club_folders': found_club_folders,
        'folders_only_view': True, 
        'nfb_folders': found_nfb_folders, 
        'refs': refs, 
        'is_exercises': True,
        'menu_exercises': 'active',
        'show_folders_button': True,
        'impersonate_is_superuser': impersonate_is_superuser,
        'exercises_tags': exs_tags,
        'exercises_features': exs_features,
        'video_params': video_params,
        'show_club_folders': is_show_club_folders,
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'user_name': f'{cur_user[0].personal.last_name} {cur_user[0].personal.first_name}',
        'ui_elements': get_ui_elements(request)
    })


@xframe_options_exempt
def exercise(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'exs' -> Found exercise.
    * 'folders' -> UserFolder or ClubFolder objects filtered by user and current team.
    * 'folders_only_view' -> True or False for folders_view_mode.
    * 'nfb_folders' -> AdminFolder objects.
    * 'refs' -> References of Exercises Section.
    * 'menu_exercises' -> Html tag class: "active" for Sidebar.
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
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    c_id = -1
    c_nfb = 0
    is_new_exs = request.GET.get("id", -1) == "new"
    try:
        c_id = int(request.GET.get("id", -1))
    except:
        pass
    folder_type = request.GET.get("type", "")
    found_exercise = None
    is_can_edit_exs = True
    is_can_edit_exs_full = True
    is_can_edit_exs_video_admin = cur_user[0].is_superuser
    if folder_type == utils.FOLDER_TEAM:
        if cur_user.exists():
            if request.user.club_id is not None:
                found_exercise = ClubExercise.objects.filter(id=c_id, club=request.user.club_id).values()
            else:
                found_exercise = UserExercise.objects.filter(id=c_id, user=cur_user[0]).values()
    elif folder_type == utils.FOLDER_NFB:
        if cur_user.exists():
            found_exercise = AdminExercise.objects.filter(id=c_id).values()
            if not cur_user[0].is_superuser:
                is_can_edit_exs = False
                is_can_edit_exs_full = False
    elif folder_type == utils.FOLDER_CLUB:
        if cur_user.exists():
            if request.user.club_id is not None:
                found_exercise = ClubExercise.objects.filter(id=c_id, club=request.user.club_id).values()
    if not found_exercise and not is_new_exs:
        return redirect('/exercises')
    if is_new_exs and folder_type == utils.FOLDER_NFB and not cur_user[0].is_superuser:
        return redirect(f'/exercises/exercise?id=new&type={utils.FOLDER_TEAM}')
    if is_can_edit_exs_full and not cur_user[0].is_superuser:
        nfb_id = -1
        try:
            nfb_id = int(found_exercise[0]['clone_nfb_id'])
        except:
            pass
        found_admin_exercise = AdminExercise.objects.filter(id=nfb_id).first()
        is_can_edit_exs_full = found_admin_exercise == None
    found_folders, found_club_folders, found_nfb_folders, refs = v_api.get_exercises_params(request, cur_user[0], cur_team)
    exs_tags = v_api.get_exercises_tags(request, cur_user[0], cur_team, True)
    exs_additional_params = v_api.get_exercises_additional_params(request, cur_user[0])
    video_params = {}
    video_params['sources'] = VideoSource.objects.all().annotate(videos=Count('video')).order_by('-videos')
    video_params['folders'] = AdminFolder.objects.exclude(parent=None).order_by('parent', 'order')
    video_params['tags'] = Tag.objects.all()
    description_template_str = ""
    try:
        description_template = ExsDescriptionTemplate.objects.filter().first()
        if description_template:
            description_template_str = v_api.get_by_language_code(description_template.description, request.LANGUAGE_CODE)
    except:
        pass
    return render(request, 'exercises/base_exercise.html', {
        'exs': found_exercise,
        'folders': found_folders, 
        'club_folders': found_club_folders, 
        'folders_only_view': True, 
        'nfb_folders': found_nfb_folders, 
        'refs': refs,
        'menu_exercises': 'active',
        'exercises_tags': exs_tags,
        'exercises_additional_params': exs_additional_params,
        'can_edit_exs': is_can_edit_exs,
        'can_edit_exs_full': is_can_edit_exs_full,
        'can_edit_exs_video_admin': is_can_edit_exs_video_admin,
        'video_params': video_params,
        'description_template': description_template_str,
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })


def exercise_download(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'exs' -> Found exercise.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["exercises.view_userexercise"], 'perms_club': ["exercises.view_clubexercise"]}
    ):
        return redirect("users:profile")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    c_id = -1
    try:
        c_id = int(request.GET.get("id", -1))
    except:
        pass
    folder_type = request.GET.get("type", "")
    render_options = {}
    try:
        render_options = json.loads(request.GET.get("render", "{}"))
    except:
        pass
    exs_json = v_api.GET_get_exs_one(request, cur_user[0], cur_team, additional={'f_type': folder_type, 'exs': c_id})
    if exs_json is None:
        return JsonResponse({"errors": "Can't find exercise"}, status=400)
    pptx_bytes = nf_presentation__from_single_exercise(input_data=exs_json, render_options=render_options)
    response = HttpResponse(pptx_bytes, content_type='application/vnd.ms-powerpoint')
    response['Content-Disposition'] = 'attachement; filename="out.pptx"'
    return response


def folders(request):
    """
    Return render page with given template. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :return: Return an HttpResponse whose content is filled with the result of calling django.template.loader.render_to_string() with the passed arguments.
    Next arguments:\n
    * 'folders' -> UserFolder or ClubFolder objects filtered by user and current team.
    * 'folders_only_view' -> True or False for folders_view_mode.
    * 'is_folders' -> True or False for section "Folders".
    * 'menu_exercises_folders' -> Html tag class: "active" for Sidebar.
    * 'seasons_list' -> List of user's or club's seasons available current user.
    * 'teams_list' -> List of user's or club's teams available current user.
    * 'ui_elements' -> List of UI elements registered in icons' system. Check Module.system_icons.views.get_ui_elements(request) for see more.
    :rtype: [HttpResponse]

    """
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    if not util_check_access(cur_user[0], 
        {'perms_user': ["exercises.change_userfolder"], 'perms_club': ["exercises.change_clubfolder"]}
    ):
        return redirect("users:profile")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    is_show_club_folders = cur_user[0].is_superuser or request.user.club_id is not None
    found_folders = []
    found_nfb_folders = []
    if cur_user.exists() and cur_user[0].id != None:
        if request.user.club_id is not None:
            found_folders = ClubFolder.objects.filter(club=request.user.club_id)
        else:
            found_folders = UserFolder.objects.filter(user=cur_user[0], team=cur_team)
    _, _, found_nfb_folders, _ = v_api.get_exercises_params(request, cur_user[0], cur_team)
    return render(request, 'exercises/base_folders.html', {
        'folders': found_folders, 
        'folders_only_view': False, 
        'nfb_folders': found_nfb_folders,
        'can_nf_folders_edit': cur_user[0].is_superuser,
        'is_folders': True,
        'menu_exercises_folders': 'active',
        'show_club_folders': is_show_club_folders,
        'seasons_list': request.seasons_list,
        'teams_list': request.teams_list,
        'ui_elements': get_ui_elements(request)
    })



def exercises_api(request):
    """
    Return JsonResponse depending on the request method and the parameter sent. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
        In case of any error client will get next response: JsonResponse({"errors": "access_error"}, status=400).\n
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
    * 'copy_exs' -> Copy exercise from one folder to another TEAM or CLUB folder.
    * 'move_exs' -> Move exercise from one folder to another TEAM or CLUB folder.
    * 'edit_exs' -> Edit exercise alse uses while creating exercise.
    * 'delete_exs' -> Delete exercise.
    * 'edit_exs_user_params' -> Edit exercise's user parameteres.
    * 'count_exs' -> Count exercises in chosen folder.
    * 'get_exs_all' -> Get all exercises from selected folder.
    * 'get_exs_one' -> Get one exercise by ID.
    * 'get_exs_graphic_content' -> Get graphic content (video, animation, schemas) of exercise.
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
        move_exs_status = 0
        edit_exs_status = 0 
        edit_exs_custom_status = 0 
        delete_exs_status = 0
        edit_exs_user_params_status = 0
        count_exs_status = 0
        count_exs_in_tags_filter_status = 0
        edit_exs_additional_param_status = 0
        delete_exs_additional_param_status = 0
        change_order_exs_additional_param_status = 0
        edit_exs_tag_category_status = 0
        change_order_exs_tag_category_status = 0
        edit_exs_tag_one_status = 0
        change_order_exs_tag_one_status = 0
        change_exs_tag_category_status = 0
        edit_exs_admin_options_status = 0
        edit_exs_full_name_status = 0
        edit_all_exs_titles_status = 0
        move_video_from_exs_to_exs_status = 0
        copy_scheme_from_exs_to_exs_status = 0
        create_exs_drawing_pic_status = 0
        delete_exs_drawing_pic_status = 0
        edit_exs_feature_one_status = 0
        change_order_exs_features_status = 0
        update_archived_exs_status = 0
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
        try:
            move_exs_status = int(request.POST.get("move_exs", 0))
        except:
            pass
        try:
            edit_exs_status = int(request.POST.get("edit_exs", 0))
        except:
            pass
        try:
            edit_exs_custom_status = int(request.POST.get("edit_exs_custom", 0))
        except:
            pass
        try:
            delete_exs_status = int(request.POST.get("delete_exs", 0))
        except:
            pass
        try:
            edit_exs_user_params_status = int(request.POST.get("edit_exs_user_params", 0))
        except:
            pass
        try:
            count_exs_status = int(request.POST.get("count_exs", 0))
        except:
            pass
        try:
            count_exs_in_tags_filter_status = int(request.POST.get("count_exs_in_tags_filter", 0))
        except:
            pass
        try:
            edit_exs_additional_param_status = int(request.POST.get("edit_exs_additional_param", 0))
        except:
            pass
        try:
            delete_exs_additional_param_status = int(request.POST.get("delete_exs_additional_param", 0))
        except:
            pass
        try:
            change_order_exs_additional_param_status = int(request.POST.get("change_order_exs_additional_param", 0))
        except:
            pass
        try:
            edit_exs_tag_category_status = int(request.POST.get("edit_exs_tag_category", 0))
        except:
            pass
        try:
            change_order_exs_tag_category_status = int(request.POST.get("change_order_exs_tag_category", 0))
        except:
            pass
        try:
            edit_exs_tag_one_status = int(request.POST.get("edit_exs_tag_one", 0))
        except:
            pass
        try:
            change_order_exs_tag_one_status = int(request.POST.get("change_order_exs_tag_one", 0))
        except:
            pass
        try:
            change_exs_tag_category_status = int(request.POST.get("change_exs_tag_category", 0))
        except:
            pass
        try:
            edit_exs_admin_options_status = int(request.POST.get("edit_exs_admin_options", 0))
        except:
            pass
        try:
            edit_exs_full_name_status = int(request.POST.get("edit_exs_full_name", 0))
        except:
            pass
        try:
            edit_all_exs_titles_status = int(request.POST.get("edit_all_exs_titles", 0))
        except:
            pass
        try:
            move_video_from_exs_to_exs_status = int(request.POST.get("move_video_from_exs_to_exs", 0))
        except:
            pass
        try:
            copy_scheme_from_exs_to_exs_status = int(request.POST.get("copy_scheme_from_exs_to_exs", 0))
        except:
            pass
        try:
            create_exs_drawing_pic_status = int(request.POST.get("create_exs_drawing_pic", 0))
        except:
            pass
        try:
            delete_exs_drawing_pic_status = int(request.POST.get("delete_exs_drawing_pic", 0))
        except:
            pass
        try:
            edit_exs_feature_one_status = int(request.POST.get("edit_exs_feature_one", 0))
        except:
            pass
        try:
            change_order_exs_features_status = int(request.POST.get("change_order_exs_features", 0))
        except:
            pass
        try:
            update_archived_exs_status = int(request.POST.get("update_archived_exs", 0))
        except:
            pass
        if copy_exs_status == 1:
            req_team_id = None
            try:
                req_team_id = int(request.POST.get("team", None))
            except:
                pass
            if req_team_id:
                cur_team = req_team_id
            return v_api.POST_copy_exs(request, cur_user[0], cur_team)
        elif move_exs_status == 1:
            return v_api.POST_move_exs(request, cur_user[0], cur_team)
        elif edit_exs_status == 1:
            return v_api.POST_edit_exs(request, cur_user[0], cur_team)
        elif edit_exs_custom_status == 1:
            return v_api.POST_edit_exs_custom(request, cur_user[0], cur_team)
        elif delete_exs_status == 1:
            return v_api.POST_delete_exs(request, cur_user[0], cur_team)
        elif edit_exs_user_params_status == 1:
            return v_api.POST_edit_exs_user_params(request, cur_user[0], cur_team)
        elif count_exs_status == 1:
            return v_api.POST_count_exs(request, cur_user[0], cur_team)
        elif count_exs_in_tags_filter_status == 1:
            return v_api.POST_count_exs_in_tags_filter(request, cur_user[0], cur_team)
        elif edit_exs_additional_param_status == 1:
            return v_api.POST_edit_exs_additional_param(request, cur_user[0])
        elif delete_exs_additional_param_status == 1:
            return v_api.POST_edit_exs_additional_param(request, cur_user[0])
        elif change_order_exs_additional_param_status == 1:
            return v_api.POST_change_order_exs_additional_param(request, cur_user[0])
        elif edit_exs_tag_category_status == 1:
            return v_api.POST_edit_exs_tag_category(request, cur_user[0])
        elif change_order_exs_tag_category_status == 1:
            return v_api.POST_change_order_exs_tag_category(request, cur_user[0])
        elif edit_exs_tag_one_status == 1:
            return v_api.POST_edit_exs_tag_one(request, cur_user[0])
        elif change_order_exs_tag_one_status == 1:
            return v_api.POST_change_order_exs_tag_one(request, cur_user[0])
        elif change_exs_tag_category_status == 1:
            return v_api.POST_change_exs_tag_category(request, cur_user[0])
        elif edit_exs_admin_options_status == 1:
            return v_api.POST_edit_exs_admin_options(request, cur_user[0], cur_team)
        elif edit_exs_full_name_status == 1:
            return v_api.POST_edit_exs_full_name(request, cur_user[0], cur_team)
        elif edit_all_exs_titles_status == 1:
            return v_api.POST_edit_all_exs_titles(request, cur_user[0], cur_team)
        elif move_video_from_exs_to_exs_status == 1:
            return v_api.POST_move_video_from_exs_to_exs(request, cur_user[0], cur_team)
        elif copy_scheme_from_exs_to_exs_status == 1:
            return v_api.POST_copy_scheme_from_exs_to_exs(request, cur_user[0], cur_team)
        elif create_exs_drawing_pic_status == 1:
            return v_api.POST_create_exs_drawing_pic(request, cur_user[0], cur_team)
        elif delete_exs_drawing_pic_status == 1:
            return v_api.POST_delete_exs_drawing_pic(request, cur_user[0], cur_team)
        elif edit_exs_feature_one_status == 1:
            return v_api.POST_edit_exs_feature_one(request, cur_user[0], cur_team)
        elif change_order_exs_features_status == 1:
            return v_api.POST_change_order_exs_features(request, cur_user[0], cur_team)
        elif update_archived_exs_status == 1:
            return v_api.POST_update_archived_exs(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_exs_all_status = 0
        get_exs_one_status = 0
        get_exs_graphic_content_status = 0
        get_exs_all_tags_status = 0
        get_exs_full_name_status = 0
        get_exs_all_features_status = 0
        check_copied_nf_exs_status = 0
        get_users_with_own_exs_status = 0
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
        try:
            get_exs_one_status = int(request.GET.get("get_exs_one", 0))
        except:
            pass
        try:
            get_exs_graphic_content_status = int(request.GET.get("get_exs_graphic_content", 0))
        except:
            pass
        try:
            get_exs_all_tags_status = int(request.GET.get("get_exs_all_tags", 0))
        except:
            pass
        try:
            get_exs_full_name_status = int(request.GET.get("get_exs_full_name", 0))
        except:
            pass
        try:
            get_exs_all_features_status = int(request.GET.get("get_exs_all_features", 0))
        except:
            pass
        try:
            check_copied_nf_exs_status = int(request.GET.get("check_copied_nf_exs", 0))
        except:
            pass
        try:
            get_users_with_own_exs_status = int(request.GET.get("get_users_with_own_exs", 0))
        except:
            pass
        if get_exs_all_status == 1:
            return v_api.GET_get_exs_all(request, cur_user[0], cur_team)
        elif get_exs_one_status == 1:
            return v_api.GET_get_exs_one(request, cur_user[0], cur_team)
        elif get_exs_graphic_content_status == 1:
            return v_api.GET_get_exs_graphic_content(request, cur_user[0], cur_team)
        elif get_exs_all_tags_status == 1:
            return v_api.GET_get_exs_all_tags(request, cur_user[0], cur_team)
        elif get_exs_full_name_status == 1:
            return v_api.GET_get_exs_full_name(request, cur_user[0], cur_team)
        elif get_exs_all_features_status == 1:
            return v_api.GET_get_exs_all_features(request, cur_user[0], cur_team)
        elif check_copied_nf_exs_status == 1:
            return v_api.GET_check_copied_nf_exs(request, cur_user[0], cur_team)
        elif get_users_with_own_exs_status == 1:
            return v_api.GET_get_users_with_own_exs(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)


def folders_api(request):
    """
    Return JsonResponse depending on the request method and the parameter sent. 
        If the user is not authorized, then there will be a redirect to the page with authorization.
        In case of any error client will get next response: JsonResponse({"errors": "access_error"}, status=400).\n
    Existing parameteres (Controlling Variable for any parameter is: 'parameter'_status):\n
    * 'edit' -> Edit current folder or create new folder.
    * 'delete' -> Delete current folder.
    * 'change_order' -> Change folders' ordering.
    * 'nfb_folders' -> Get all NFB folders.
    * 'nfb_folders_set' -> Set NFB folders' structure to own TEAM or CLUB folders with replacing existed folders.
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
        c_id = -1
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        parent_id = None
        edit_status = 0
        delete_status = 0
        change_order_status = 0
        try:
            c_id = int(request.POST.get("id", -1))
        except:
            pass
        try:
            parent_id = int(request.POST.get("parent_id", None))
        except:
            pass
        try:
            edit_status = int(request.POST.get("edit", 0))
        except:
            pass
        try:
            delete_status = int(request.POST.get("delete", 0))
        except:
            pass
        try:
            change_order_status = int(request.POST.get("change_order", 0))
        except:
            pass
        cur_user = User.objects.filter(email=request.user).only("id")
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        if edit_status == 1:
            return v_api.POST_edit_folder(request, cur_user[0], cur_team, c_id, parent_id)
        elif delete_status == 1:
            return v_api.POST_delete_folder(request, cur_user[0], c_id)
        elif change_order_status == 1:
            return v_api.POST_change_order_folder(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        nfb_folders_status = 0
        nfb_folders_set_status = 0
        all_team_folders_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            nfb_folders_status = int(request.GET.get("nfb_folders", 0))
        except:
            pass
        try:
            nfb_folders_set_status = int(request.GET.get("nfb_folders_set", 0))
        except:
            pass
        try:
            all_team_folders_status = int(request.GET.get("all_team_folders", 0))
        except:
            pass
        if nfb_folders_status == 1:
            return v_api.GET_nfb_folders(request, cur_user[0])
        elif nfb_folders_set_status == 1:
            return v_api.GET_nfb_folders_set(request, cur_user[0], cur_team)
        elif all_team_folders_status == 1:
            return v_api.GET_all_teams_folders(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

