from django.shortcuts import render, redirect
from django.http import JsonResponse
from users.models import User
from exercises.models import UserFolder, ClubFolder, AdminFolder, UserExercise, AdminExercise
from references.models import UserSeason, UserTeam
import exercises.v_api as v_api
from system_icons.views import get_ui_elements



def exercises(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    found_folders = []
    found_nfb_folders = []
    refs = {}
    found_folders, found_nfb_folders, refs = v_api.get_exercises_params(request, cur_user, cur_team)
    return render(request, 'exercises/base_exercises.html', {
        'folders': found_folders, 
        'folders_only_view': True, 
        'nfb_folders': found_nfb_folders, 
        'refs': refs, 
        'is_exercises': True,
        'menu_exercises': 'active',
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
        'ui_elements': get_ui_elements(request)
    })


def exercise(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
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
    access_denied = False
    if folder_type == v_api.FOLDER_TEAM:
        if cur_user.exists() and not access_denied:
            found_exercise = UserExercise.objects.filter(id=c_id, user=cur_user[0]).values()
    elif folder_type == v_api.FOLDER_NFB:
        if cur_user.exists() and not access_denied and cur_user[0].is_superuser:
            found_exercise = AdminExercise.objects.filter(id=c_id).values()
    elif folder_type == v_api.FOLDER_CLUB:
        pass
    if not found_exercise and not is_new_exs:
        return redirect('/exercises')
    found_folders, found_nfb_folders, refs = v_api.get_exercises_params(request, cur_user, cur_team)
    return render(request, 'exercises/base_exercise.html', {
        'exs': found_exercise,
        'folders': found_folders, 
        'folders_only_view': True, 
        'nfb_folders': found_nfb_folders, 
        'refs': refs,
        'menu_exercises': 'active',
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
        'ui_elements': get_ui_elements(request)
    })


def folders(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    found_folders = []
    if cur_user.exists() and cur_user[0].club_id != None:
        # добавить проверку на клуб версию
        found_folders = UserFolder.objects.filter(user=cur_user[0], team=cur_team)
    return render(request, 'exercises/base_folders.html', {
        'folders': found_folders, 
        'folders_only_view': False, 
        'is_folders': True,
        'menu_exercises_folders': 'active',
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user),
        'ui_elements': get_ui_elements(request)
    })



def exercises_api(request):

    # Greate solution
    # Отдельное приложение, заточенное под API для любого раздела. Модель, содержащая в себе токен, доступные IPs,
    # ид или тип доступа для определения корректности полученного токена, если нужно будет сделать разные токены под
    # разные разделы, задачи

    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        copy_exs_status = 0
        move_exs_status = 0
        edit_exs_status = 0
        delete_exs_status = 0
        edit_exs_user_params_status = 0
        count_exs_status = 0
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
        if copy_exs_status == 1:
            return v_api.POST_copy_exs(request, cur_user[0], cur_team)
        elif move_exs_status == 1:
            return v_api.POST_move_exs(request, cur_user[0])
        elif edit_exs_status == 1:
            return v_api.POST_edit_exs(request, cur_user[0], cur_team)
        elif delete_exs_status == 1:
            return v_api.POST_delete_exs(request, cur_user[0])
        elif edit_exs_user_params_status == 1:
            return v_api.POST_edit_exs_user_params(request, cur_user[0])
        elif count_exs_status == 1:
            return v_api.POST_count_exs(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_exs_all_status = 0
        get_exs_one_status = 0
        get_exs_graphic_content_status = 0
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
        if get_exs_all_status == 1:
            return v_api.GET_get_exs_all(request, cur_user[0])
        elif get_exs_one_status == 1:
            return v_api.GET_get_exs_one(request, cur_user[0], cur_team)
        elif get_exs_graphic_content_status == 1:
            return v_api.GET_get_exs_graphic_content(request, cur_user[0], cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)


def folders_api(request):
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
        if nfb_folders_status == 1:
            return v_api.GET_nfb_folders()
        elif nfb_folders_set_status == 1:
            return v_api.GET_nfb_folders_set(request, cur_user, cur_team)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

