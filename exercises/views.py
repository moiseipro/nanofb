import json
from tkinter.messagebox import NO
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from users.models import User
from exercises.models import UserFolder, ClubFolder, AdminFolder, UserExercise, AdminExercise
from exercises.models import UserExerciseParam, UserExerciseParamTeam
from references.models import ExsBall, ExsGoal, ExsCognitiveLoad, ExsAgeCategory
from references.models import ExsAddition, ExsPurpose, ExsStressType, ExsCoaching
from references.models import UserSeason, UserTeam



LANG_CODE_DEFAULT = "en"

def get_by_language_code(value, code):
    res = ""
    try:
        res = value[code]
    except:
        pass
    if res == "":
        try:
            res = value[LANG_CODE_DEFAULT]
        except:
            pass
    return res


def set_by_language_code(elem, code, value, value2 = None):
    if value2:
        value = value2 if value2 != "" else value
    if type(elem) is dict:
        elem[code] = value
    else:
        elem = {code: value}
    return elem


def set_value_as_int(request, name, def_value = None):
    res = def_value
    try:
        res = int(request.POST.get(name, def_value))
    except:
        pass
    return res


def set_value_as_list(request, name, name2 = None, def_value = None):
    res = def_value
    value_from_req = request.POST.getlist(name, def_value)
    value2_from_req = request.POST.getlist(name2, def_value)
    if name2 and type(value2_from_req) is list and len(value2_from_req) > 0:
        value_from_req = value2_from_req
    if type(value_from_req) is list and len(value_from_req) > 0:
        res = value_from_req
    return res


def set_refs_translations(data, lang_code):
    for key in data:
        elems = data[key]
        for elem in elems:
            title = get_by_language_code(elem['translation_names'], lang_code)
            elem['title'] = title if title != "" else elem['name']
    return data


def set_exs_team_params(request, name):
    lang = request.LANGUAGE_CODE
    data1 = request.POST.getlist(f"{name}", [])
    data2 = request.POST.getlist(f"{name}[]", [])
    print(data1, data2)
    res = {'data': []}
    return res


def get_exercises_params(request, user, team):
    folders = []
    nfb_folders = []
    refs = {}
    if user.exists() and user[0].club_id != None:
        # добавить проверку на клуб версию
        folders = UserFolder.objects.filter(user=user[0], team=team, visible=True).values()
    nfb_folders = AdminFolder.objects.filter(visible=True).values()
    for elem in folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    for elem in nfb_folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    refs['exs_ball'] = ExsBall.objects.filter().values()
    refs['exs_goal'] = ExsGoal.objects.filter().values()
    refs['exs_cognitive_load'] = ExsCognitiveLoad.objects.filter().values()
    refs['exs_age_category'] = ExsAgeCategory.objects.filter().values()

    refs['exs_addition'] = ExsAddition.objects.filter().values()
    refs['exs_purpose'] = ExsPurpose.objects.filter().values()
    refs['exs_stress_type'] = ExsStressType.objects.filter().values()
    refs['exs_coaching'] = ExsCoaching.objects.filter().values()

    refs = set_refs_translations(refs, request.LANGUAGE_CODE)
    return [folders, nfb_folders, refs]



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
    found_folders, found_nfb_folders, refs = get_exercises_params(request, cur_user, cur_team)
    return render(request, 'exercises/base_exercises.html', {
        'folders': found_folders, 
        'folders_only_view': True, 
        'nfb_folders': found_nfb_folders, 
        'refs': refs, 
        'is_exercises': True,
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user)
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
    try:
        c_nfb = int(request.GET.get("nfb", 0))
    except:
        pass
    found_exercise = None
    if c_nfb == 1:
        if cur_user.exists():
            found_exercise = AdminExercise.objects.filter(id=c_id).values()
    else:
        if cur_user.exists() and cur_user[0].club_id != None:
            found_exercise = UserExercise.objects.filter(id=c_id, user=cur_user[0]).values()
    if not found_exercise and not is_new_exs:
        return redirect('/exercises')
    found_folders, found_nfb_folders, refs = get_exercises_params(request, cur_user, cur_team)
    return render(request, 'exercises/base_exercise.html', {
        'exs': found_exercise,
        'folders': found_folders, 
        'folders_only_view': True, 
        'nfb_folders': found_nfb_folders, 
        'refs': refs,
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user)
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
        'seasons_list': UserSeason.objects.filter(user_id=request.user),
        'teams_list': UserTeam.objects.filter(user_id=request.user)
    })



@csrf_exempt
def exercises_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        copy_exs_status = 0
        move_exs_status = 0
        edit_exs_status = 0
        delete_exs_status = 0
        edit_exs_user_params_status = 0
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
        if copy_exs_status == 1:
            exs_id = -1
            folder_id = -1
            is_nfb_folder = 0
            try:
                exs_id = int(request.POST.get("exs", -1))
            except:
                pass
            try:
                folder_id = int(request.POST.get("folder", -1))
            except:
                pass
            try:
                is_nfb_folder = int(request.POST.get("nfb_folder", 0))
            except:
                pass
            found_folder = UserFolder.objects.filter(id=folder_id)
            success_status = False
            if found_folder.exists() and found_folder[0].id != None:
                res_data = {'err': "NULL"}
                if is_nfb_folder == 1:
                    c_exs = AdminExercise.objects.filter(id=exs_id)
                    if c_exs.exists() and c_exs[0].id != None:
                        new_exs = UserExercise(user=cur_user[0])
                        for key in c_exs.values()[0]:
                            if key != "id" and key != "date_creation":
                                setattr(new_exs, key, c_exs.values()[0][key])
                        new_exs.folder = found_folder[0]
                        try:
                            new_exs.save()
                            res_data = {'id': new_exs.id}
                            success_status = True
                        except Exception as e:
                            res_data = {'id': new_exs.id, 'err': str(e)}
                else:
                    c_exs = UserExercise.objects.filter(id=exs_id)
                    if c_exs.exists() and c_exs[0].id != None:
                        new_exs = UserExercise(user=cur_user[0])
                        for key in c_exs.values()[0]:
                            if key != "id" and key != "date_creation":
                                setattr(new_exs, key, c_exs.values()[0][key])
                        new_exs.folder = found_folder[0]
                        try:
                            new_exs.save()
                            res_data = {'id': new_exs.id}
                            success_status = True
                        except Exception as e:
                            res_data = {'id': new_exs.id, 'err': str(e)}
                return JsonResponse({"data": res_data, "success": success_status}, status=200)
        elif move_exs_status == 1:
            exs_id = -1
            folder_id = -1
            try:
                exs_id = int(request.POST.get("exs", -1))
            except:
                pass
            try:
                folder_id = int(request.POST.get("folder", -1))
            except:
                pass
            found_folder = UserFolder.objects.filter(id=folder_id, user=cur_user[0])
            if found_folder.exists() and found_folder[0].id != None:
                found_exs = UserExercise.objects.filter(id=exs_id, user=cur_user[0])
                if found_exs.exists() and found_exs[0].id != None:
                    found_exs = found_exs[0]
                    found_exs.folder = found_folder[0]
                    try:
                        found_exs.save()
                        return JsonResponse({"data": {"id": found_exs.id}, "success": True}, status=200)
                    except:
                        pass
            return JsonResponse({"errors": "Can't move exercise"}, status=400)
        elif edit_exs_status == 1:
            exs_id = -1
            folder_id = -1
            try:
                exs_id = int(request.POST.get("exs", -1))
            except:
                pass
            try:
                folder_id = int(request.POST.get("data[folder_main]", -1))
            except:
                pass
            c_folder = UserFolder.objects.filter(id=folder_id)
            if not c_folder.exists() or c_folder[0].id == None:
                return JsonResponse({"err": "Folder not found.", "success": False}, status=200)
            c_exs = UserExercise.objects.filter(id=exs_id)
            if not c_exs.exists() or c_exs[0].id == None:
                c_exs = UserExercise(user=cur_user[0], folder=c_folder[0])
            else:
                c_exs = c_exs[0]
                c_exs.folder = c_folder[0]
            print(request.POST)
            c_exs.title = set_by_language_code(c_exs.title, request.LANGUAGE_CODE, request.POST.get("data[title]", ""))
            c_exs.keyword = set_by_language_code(c_exs.keyword, request.LANGUAGE_CODE, request.POST.getlist("data[keyword[]]", ""), request.POST.getlist("data[keyword[]][]", ""))
            c_exs.description = set_by_language_code(c_exs.description, request.LANGUAGE_CODE, request.POST.get("data[description]", ""))
            c_exs.ref_ball = set_value_as_int(request, "data[ref_ball]", None)
            c_exs.ref_goal = set_value_as_int(request, "data[ref_goal]", None)
            c_exs.ref_cognitive_load = set_value_as_int(request, "data[ref_cognitive_load]", None)
            c_exs.players_ages = set_value_as_list(request, "data[players_ages[]]", "data[players_ages[]][]", [])
            c_exs.ref_age_category = set_value_as_int(request, "data[ref_age_category]", None)
            c_exs.players_amount = set_value_as_list(request, "data[players_amount[]]", "data[players_amount[]][]", [])
            

            c_exs.condition = set_by_language_code(c_exs.condition, request.LANGUAGE_CODE, request.POST.getlist("data[conditions[]]", ""), request.POST.getlist("data[conditions[]][]", ""))
            c_exs.stress_type = set_by_language_code(c_exs.stress_type, request.LANGUAGE_CODE, request.POST.getlist("data[stress_type[]]", ""), request.POST.getlist("data[stress_type[]][]", ""))
            c_exs.purpose = set_by_language_code(c_exs.purpose, request.LANGUAGE_CODE, request.POST.getlist("data[purposes[]]", ""), request.POST.getlist("data[purposes[]][]", ""))
            c_exs.coaching = set_by_language_code(c_exs.coaching, request.LANGUAGE_CODE, request.POST.getlist("data[coaching[]]", ""), request.POST.getlist("data[coaching[]][]", ""))
            c_exs.notes = set_by_language_code(c_exs.notes, request.LANGUAGE_CODE, request.POST.getlist("data[notes[]]", ""), request.POST.getlist("data[notes[]][]", ""))
            
            try:
                c_exs.save()
                res_data = f'Exs with id: [{c_exs.id}] is added / edited successfully.'
            except Exception as e:
                return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
            adding_team_params = False
            found_team = UserTeam.objects.filter(id=cur_team)
            if found_team.exists() and found_team[0].id != None:
                c_exs_team_params = UserExerciseParamTeam.objects.filter(team=found_team[0], exercise_user=c_exs)
                if not c_exs_team_params.exists() or c_exs_team_params[0].id == None:
                    c_exs_team_params = UserExerciseParamTeam(team=found_team[0], exercise_user=c_exs)
                else:
                    c_exs_team_params = c_exs_team_params[0]
                additions_test = set_exs_team_params(request, "data[additions[]]")
                # c_exs_team_params.addition = set_exs_team_params()
                try:
                    c_exs_team_params.save()
                    res_data += '\nAdded team params for exs.'
                except:
                    pass
            if not adding_team_params:
                res_data += '\nCant add team params for exs.'
            return JsonResponse({"data": res_data, "success": True}, status=200)
        elif delete_exs_status == 1:
            exs_id = -1
            try:
                exs_id = int(request.POST.get("exs", -1))
            except:
                pass
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user[0])
            if not c_exs.exists() or c_exs[0].id == None:
                return JsonResponse({"errors": "access_error"}, status=400)
            else:
                try:
                    c_exs.delete()
                    return JsonResponse({"data": {"id": exs_id}, "success": True}, status=200)
                except:
                    return JsonResponse({"errors": "Can't delete exercise"}, status=400)
        elif edit_exs_user_params_status == 1:
            exs_id = -1
            c_nfb = 0
            post_key = request.POST.get("data[key]", "")
            post_value = 0
            try:
                exs_id = int(request.POST.get("exs", -1))
            except:
                pass
            try:
                c_nfb = int(request.POST.get("nfb", 0))
            except:
                pass
            try:
                post_value = int(request.POST.get("data[value]", 0))
            except:
                pass
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user[0])
            if c_exs.exists() and c_exs[0].id != None and c_nfb == 0:
                c_exs_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0], user=cur_user[0])
                if c_exs_params.exists() and c_exs_params[0].id != None:
                    c_exs_params = c_exs_params[0]
                    setattr(c_exs_params, post_key, post_value)
                    if post_key == "like":
                        c_exs_params.dislike = 0
                    if post_key == "dislike":
                        c_exs_params.like = 0
                    try:
                        c_exs_params.save()
                        return JsonResponse({"data": {"id": exs_id}, "success": True}, status=200)
                    except:
                        pass
                else:
                    new_params = UserExerciseParam(exercise_user=c_exs[0], user=cur_user[0])
                    setattr(new_params, post_key, post_value)
                    try:
                        new_params.save()
                        return JsonResponse({"data": {"id": exs_id}, "success": True}, status=200)
                    except:
                        pass
            return JsonResponse({"errors": "Can't edit exs param"}, status=400)
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_exs_all_status = 0
        get_exs_one_status = 0
        get_nfb_exs = 0
        cur_user = User.objects.filter(email=request.user).only("id")
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
            get_nfb_exs = int(request.GET.get("get_nfb", 0))
        except:
            pass
        if get_exs_all_status == 1:
            folder_id = -1
            try:
                folder_id = int(request.GET.get("folder", -1))
            except:
                pass
            # Check if folder is USER or CLUB
            res_exs = []
            if get_nfb_exs:
                cur_folder = AdminFolder.objects.filter(id=folder_id)
                if not cur_folder.exists() or cur_folder[0].id == None:
                    return JsonResponse({"errors": "trouble_with_folder"}, status=400)
                found_exercises = []
                child_folders = AdminFolder.objects.filter(parent=cur_folder[0].id)
                if child_folders.count() > 0:
                    found_exercises = AdminExercise.objects.filter(folder__in = child_folders)
                else:
                    found_exercises = AdminExercise.objects.filter(folder = cur_folder[0])
                for exercise in found_exercises:
                    exs_title = get_by_language_code(exercise.title, request.LANGUAGE_CODE)
                    res_exs.append({'id': exercise.id, 'folder': exercise.folder.id, 'user': "NFB", 'title': exs_title})
            else:
                cur_folder = UserFolder.objects.filter(id=folder_id, user=cur_user[0])
                if not cur_folder.exists() or cur_folder[0].id == None:
                    return JsonResponse({"errors": "trouble_with_folder"}, status=400)
                found_exercises = []
                child_folders = UserFolder.objects.filter(parent=cur_folder[0].id)
                if child_folders.count() > 0:
                    found_exercises = UserExercise.objects.filter(folder__in = child_folders)
                else:
                    found_exercises = UserExercise.objects.filter(folder = cur_folder[0])
                for exercise in found_exercises:
                    exs_title = get_by_language_code(exercise.title, request.LANGUAGE_CODE)
                    exs_data = {
                        'id': exercise.id, 
                        'folder': exercise.folder.id, 
                        'user': exercise.user.email, 
                        'title': exs_title
                    }
                    user_params = UserExerciseParam.objects.filter(exercise_user=exercise.id, user=cur_user[0])
                    if user_params.exists() and user_params[0].id != None:
                        user_params = user_params.values()[0]
                        exs_data['watched'] = user_params['watched']
                        exs_data['favorite'] = user_params['favorite']
                        exs_data['like'] = user_params['like']
                        exs_data['dislike'] = user_params['dislike']
                    res_exs.append(exs_data)
            return JsonResponse({"data": res_exs, "success": True}, status=200)
        elif get_exs_one_status == 1:
            exs_id = -1
            try:
                exs_id = int(request.GET.get("exs", -1))
            except:
                pass
            res_exs = {}
            if get_nfb_exs:
                c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
                if c_exs.exists() and c_exs[0].id != None:
                    res_exs = c_exs.values()[0]
                    res_exs['nfb'] = True
                    res_exs['folder_parent_id'] = c_exs[0].folder.parent
            else:
                c_exs = UserExercise.objects.filter(id=exs_id, visible=True)
                if c_exs.exists() and c_exs[0].id != None:
                    res_exs = c_exs.values()[0]
                    res_exs['nfb'] = False
                    res_exs['folder_parent_id'] = c_exs[0].folder.parent
                user_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0].id, user=cur_user[0])
                if user_params.exists() and user_params[0].id != None:
                    user_params = user_params.values()[0]
                    res_exs['watched'] = user_params['watched']
                    res_exs['favorite'] = user_params['favorite']
                    res_exs['like'] = user_params['like']
                    res_exs['dislike'] = user_params['dislike']
            res_exs['title'] = get_by_language_code(res_exs['title'], request.LANGUAGE_CODE)
            res_exs['description'] = get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)

            res_exs['keyword'] = get_by_language_code(res_exs['keyword'], request.LANGUAGE_CODE)

            res_exs['condition'] = get_by_language_code(res_exs['condition'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = get_by_language_code(res_exs['stress_type'], request.LANGUAGE_CODE)
            res_exs['purpose'] = get_by_language_code(res_exs['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = get_by_language_code(res_exs['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = get_by_language_code(res_exs['notes'], request.LANGUAGE_CODE)
            return JsonResponse({"data": res_exs, "success": True}, status=200)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)


@csrf_exempt
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
        
        if delete_status == 1:
            res_data = {'type': "error", 'err': "Cant delete record."}
            found_folder = UserFolder.objects.get(id=c_id, user=cur_user[0]) # либо проверка клубной папки
            if found_folder and found_folder.id != None:
                fId = found_folder.id
                try:
                    found_folder.delete()
                    res_data = {'id': fId, 'type': "delete"}
                except Exception as e:
                    res_data = {'id': fId, 'type': "error", 'err': str(e)}
            return JsonResponse({"data": res_data}, status=200)
        
        if change_order_status == 1:
            ids_data = request.POST.getlist("ids_arr[]", [])
            ordering_data = request.POST.getlist("order_arr[]", [])
            temp_res_arr = []
            for c_ind in range(len(ids_data)):
                t_id = -1
                t_order = 0
                try:
                    t_id = int(ids_data[c_ind])
                    t_order = int(ordering_data[c_ind])
                except:
                    pass
                found_folder = UserFolder.objects.get(id=t_id, user=cur_user[0])
                if found_folder and found_folder.id != None:
                    found_folder.order = t_order
                    try:
                        found_folder.save()
                        temp_res_arr.append(f'Folder [{found_folder.id}] is order changed: {t_order}')
                    except Exception as e:
                        temp_res_arr.append(f'Folder [{found_folder.id}] -> ERROR / Not access or another reason')
            res_data = {'res_arr': temp_res_arr, 'type': "change_order"}
            return JsonResponse({"data": res_data}, status=200)
        
        name = request.POST.get("name", "")
        short_name = request.POST.get("short_name", "")
        found_folder = None
        try:
            found_folder = UserFolder.objects.get(id=c_id, user=cur_user[0], team=cur_team) # либо проверка клубной папки
        except:
            pass
        res_data = {'type': "error", 'err': "Cant create or edit record."}
        if found_folder and found_folder.id != None:
            found_folder.short_name = short_name
            found_folder.name = name
            try:
                found_folder.save()
                res_data = {'id': found_folder.id, 'name': name, 'short_name': short_name, 'type': "edit"}
            except Exception as e:
                res_data = {'id': found_folder.id, 'type': "error", 'err': str(e)}
        else:
            try:
                found_team = UserTeam.objects.get(id=cur_team, user_id=cur_user[0])
                new_folder = UserFolder(name=name, short_name=short_name, parent=parent_id, user=cur_user[0], team=found_team)
                new_folder.save()
                new_folder.order = new_folder.id
                new_folder.save()
                res_data = {'id': new_folder.id, 'parent_id': parent_id, 'name': name, 'short_name': short_name, 'type': "add"}
            except Exception as e:
                res_data = {'type': "error", 'err': str(e)}
        return JsonResponse({"data": res_data}, status=200)
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
            folders = AdminFolder.objects.only("short_name", "name", "parent")
            res_folders = []
            for folder in folders:
                res_folders.append({'id': folder.id, 'short_name': folder.short_name, 'name': folder.name, 'parent': folder.parent})
            res_data = {'folders': res_folders, 'type': "nfb_folders"}
            return JsonResponse({"data": res_data}, status=200)
        if nfb_folders_set_status == 1:
            is_success = True
            # Либо удалять, потом добавлять для клуба, в зависимости от вепсии пользователя и его прав
            user_old_folders = UserFolder.objects.filter(user=cur_user[0], team=cur_team)
            try:
                user_old_folders.delete()
            except Exception as e:
                res_data = {'type': "error", 'err': str(e)}
                is_success = False
            folders = []
            if is_success:
                folders = AdminFolder.objects.only("short_name", "name", "parent")
                for folder in folders:
                    try:
                        found_team = UserTeam.objects.get(id=cur_team, user_id=cur_user[0])
                        new_folder = UserFolder(name=folder.name, short_name=folder.short_name, parent=0, user=cur_user[0], team=found_team)
                        new_folder.save()
                        folder.new_id = new_folder.id
                    except Exception as e:
                        is_success = False
                        res_data = {'type': "error", 'err': str(e)}
                        break
            if is_success:
                for folder in folders:
                    for compare_folder in folders:
                        if folder.parent == compare_folder.id:
                            try:
                                c_folder = UserFolder.objects.get(id=folder.new_id, user=cur_user[0], team=cur_team)
                                if c_folder and c_folder.id != None:
                                    c_folder.parent = compare_folder.new_id
                                    c_folder.save()
                            except Exception as e:
                                is_success = False
                                res_data = {'while': "while change parent id", 'type': "error", 'err': str(e)}
                                break
                    if not is_success:
                        break
            if is_success:
                res_data = {'type': "nfb_folders_set"}
            return JsonResponse({"data": res_data}, status=200)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

