from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core import serializers
from users.models import User
from exercises.models import UserFolder, AdminFolder


def exercises(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    return render(request, 'exercises/base_exercises.html')


def folders(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    found_folders = []
    if cur_user.exists() and cur_user[0].club_id != None:
        # добавить проверку на клуб версию
        found_folders = UserFolder.objects.filter(user_id=cur_user[0])
    return render(request, 'exercises/base_folders.html', {'folders': found_folders})


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
            found_folder = UserFolder.objects.get(id=c_id, user_id=cur_user[0]) # либо проверка клубной папки
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
                found_folder = UserFolder.objects.get(id=t_id, user_id=cur_user[0])
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
            found_folder = UserFolder.objects.get(id=c_id, user_id=cur_user[0]) # либо проверка клубной папки
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
            new_folder = UserFolder(name=name, short_name=short_name, parent=parent_id, user_id=cur_user[0])
            try:
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
            user_old_folders = UserFolder.objects.filter(user_id=cur_user[0])
            try:
                user_old_folders.delete()
            except Exception as e:
                res_data = {'type': "error", 'err': str(e)}
                is_success = False
            folders = []
            if is_success:
                folders = AdminFolder.objects.only("short_name", "name", "parent")
                for folder in folders:
                    new_folder = UserFolder(name=folder.name, short_name=folder.short_name, parent=0, user_id=cur_user[0])
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
                                c_folder = UserFolder.objects.get(id=folder.new_id, user_id=cur_user[0])
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
            print(res_data)
            return JsonResponse({"data": res_data}, status=200)
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

