from tkinter.messagebox import NO
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from users.models import User
from exercises.models import UserFolder, ClubFolder, AdminFolder, UserExercise, AdminExercise
from references.models import ExsBall, ExsGoal, ExsWorkoutPart, ExsCognitiveLoad, ExsCategory, ExsPurpose, ExsStressType, ExsCoaching


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


def exercises(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    found_folders = []
    found_nfb_folders = []
    refs = {}
    if cur_user.exists() and cur_user[0].club_id != None:
        # добавить проверку на клуб версию
        found_folders = UserFolder.objects.filter(user=cur_user[0], visible=True).values()
    found_nfb_folders = AdminFolder.objects.filter(visible=True).values()
    for elem in found_folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    for elem in found_nfb_folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    refs['exs_ball'] = ExsBall.objects.filter().values()
    refs['exs_goal'] = ExsGoal.objects.filter().values()
    refs['exs_workout_part'] = ExsWorkoutPart.objects.filter().values()
    refs['exs_cognitive_load'] = ExsCognitiveLoad.objects.filter().values()
    refs['exs_category'] = ExsCategory.objects.filter().values()
    refs['exs_purposes'] = ExsPurpose.objects.filter(user=cur_user[0]).values()
    refs['exs_stress_types'] = ExsStressType.objects.filter(user=cur_user[0]).values()
    refs['exs_coachings'] = ExsCoaching.objects.filter(user=cur_user[0]).values()
    refs = set_refs_translations(refs, request.LANGUAGE_CODE)
    return render(request, 'exercises/base_exercises.html', {'folders': found_folders, 'folders_only_view': True, 'nfb_folders': found_nfb_folders, 'refs': refs})


def folders(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    found_folders = []
    if cur_user.exists() and cur_user[0].club_id != None:
        # добавить проверку на клуб версию
        found_folders = UserFolder.objects.filter(user=cur_user[0])
    return render(request, 'exercises/base_folders.html', {'folders': found_folders, 'folders_only_view': False})


@csrf_exempt
def exercises_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        copy_exs_status = 0
        edit_exs_status = 0
        delete_exs_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            copy_exs_status = int(request.POST.get("copy_exs", 0))
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
            if found_folder.exists() and found_folder[0].id != None:
                res_data = {'success': False, 'err': "NULL"}
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
                            res_data = {'id': new_exs.id, 'success': True}
                        except Exception as e:
                            res_data = {'id': new_exs.id, 'success': False, 'err': str(e)}
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
                            res_data = {'id': new_exs.id, 'success': True}
                        except Exception as e:
                            res_data = {'id': new_exs.id, 'success': False, 'err': str(e)}
                return JsonResponse({"data": res_data}, status=200)
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
            c_exs.description = set_by_language_code(c_exs.description, request.LANGUAGE_CODE, request.POST.get("data[description]", ""))
            c_exs.ref_ball = set_value_as_int(request, "data[ref_ball]", None)
            c_exs.ref_goal = set_value_as_int(request, "data[ref_goal]", None)
            c_exs.ref_workout_part = set_value_as_int(request, "data[ref_workout_part]", None)
            c_exs.ref_cognitive_load = set_value_as_int(request, "data[ref_cognitive_load]", None)
            c_exs.ref_category = set_value_as_int(request, "data[ref_category]", None)
            try:
                t_vals = request.POST.getlist("data[age[]][]", "")
                t_val_str = f'{t_vals[0]},{t_vals[1]}'
                c_exs.age = t_val_str
            except:
                pass
            c_exs.organization = set_by_language_code(c_exs.organization, request.LANGUAGE_CODE, request.POST.getlist("data[organization[]]", ""), request.POST.getlist("data[organization[]][]", ""))
            c_exs.play_zone = set_by_language_code(c_exs.play_zone, request.LANGUAGE_CODE, request.POST.getlist("data[play_zone[]]", ""), request.POST.getlist("data[play_zone[]][]", ""))
            c_exs.players_amount = set_by_language_code(c_exs.players_amount, request.LANGUAGE_CODE, request.POST.getlist("data[players_amount[]]", ""), request.POST.getlist("data[players_amount[]][]", ""))
            c_exs.touches_amount = set_by_language_code(c_exs.touches_amount, request.LANGUAGE_CODE, request.POST.getlist("data[touches_amount[]]", ""), request.POST.getlist("data[touches_amount[]][]", ""))
            c_exs.iterations = set_by_language_code(c_exs.iterations, request.LANGUAGE_CODE, request.POST.getlist("data[iterations[]]", ""), request.POST.getlist("data[iterations[]][]", ""))
            c_exs.pauses = set_by_language_code(c_exs.pauses, request.LANGUAGE_CODE, request.POST.getlist("data[pauses[]]", ""), request.POST.getlist("data[pauses[]][]", ""))
            c_exs.series = set_by_language_code(c_exs.series, request.LANGUAGE_CODE, request.POST.getlist("data[series[]]", ""), request.POST.getlist("data[series[]][]", ""))
            c_exs.notes = set_by_language_code(c_exs.notes, request.LANGUAGE_CODE, request.POST.getlist("data[notes[]]", ""), request.POST.getlist("data[notes[]][]", ""))
            c_exs.ref_purpose = set_value_as_list(request, "data[ref_purposes[]]", "data[ref_purposes[]][]", None)
            c_exs.ref_stress_type = set_value_as_list(request, "data[ref_stress_type[]]", "data[ref_stress_type[]][]", None)
            c_exs.ref_coaching = set_value_as_list(request, "data[ref_coaching[]]", "data[ref_coaching[]][]", None)
            try:
                c_exs.save()
                res_data = f'Exs with id: [{c_exs.id}] is added / edited successfully.'
            except Exception as e:
                return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
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
                    res_exs.append({'id': exercise.id, 'folder': exercise.folder.id, 'user': "NFB"})
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
                    res_exs.append({'id': exercise.id, 'folder': exercise.folder.id, 'user': exercise.user.email})
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
            res_exs['title'] = get_by_language_code(res_exs['title'], request.LANGUAGE_CODE)
            res_exs['description'] = get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)

            res_exs['organization'] = get_by_language_code(res_exs['organization'], request.LANGUAGE_CODE)
            res_exs['play_zone'] = get_by_language_code(res_exs['play_zone'], request.LANGUAGE_CODE)
            res_exs['players_amount'] = get_by_language_code(res_exs['players_amount'], request.LANGUAGE_CODE)
            res_exs['touches_amount'] = get_by_language_code(res_exs['touches_amount'], request.LANGUAGE_CODE)
            res_exs['iterations'] = get_by_language_code(res_exs['iterations'], request.LANGUAGE_CODE)
            res_exs['pauses'] = get_by_language_code(res_exs['pauses'], request.LANGUAGE_CODE)
            res_exs['series'] = get_by_language_code(res_exs['series'], request.LANGUAGE_CODE)
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
            found_folder = UserFolder.objects.get(id=c_id, user=cur_user[0]) # либо проверка клубной папки
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
            new_folder = UserFolder(name=name, short_name=short_name, parent=parent_id, user=cur_user[0])
            try:
                new_folder.save()
                new_folder.order = new_folder.id
                new_folder.save()
                res_data = {'id': new_folder.id, 'parent_id': parent_id, 'name': name, 'short_name': short_name, 'type': "add"}
            except Exception as e:
                res_data = {'id': new_folder.id, 'type': "error", 'err': str(e)}
        return JsonResponse({"data": res_data}, status=200)
    elif request.method == "GET" and is_ajax:
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
            user_old_folders = UserFolder.objects.filter(user=cur_user[0])
            try:
                user_old_folders.delete()
            except Exception as e:
                res_data = {'type': "error", 'err': str(e)}
                is_success = False
            folders = []
            if is_success:
                folders = AdminFolder.objects.only("short_name", "name", "parent")
                for folder in folders:
                    new_folder = UserFolder(name=folder.name, short_name=folder.short_name, parent=0, user=cur_user[0])
                    try:
                        new_folder.save()
                        folder.new_id = new_folder.id
                    except Exception as e:
                        is_success = False
                        res_data = {'id': new_folder.id, 'type': "error", 'err': str(e)}
                        break
            if is_success:
                for folder in folders:
                    for compare_folder in folders:
                        if folder.parent == compare_folder.id:
                            try:
                                c_folder = UserFolder.objects.get(id=folder.new_id, user=cur_user[0])
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

