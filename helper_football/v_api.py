import datetime
from django.http import JsonResponse
from django.db.models import Sum, Q
from users.models import User
from helper_football.models import AdminFolder, UserFolder, ClubFolder
from helper_football.models import AdminArticle, UserArticle, ClubArticle, UserArticleParam
from nanofootball.views import util_check_access
import nanofootball.utils as utils


# --------------------------------------------------
# HELPER_FOOTBALL API
def POST_edit_folder(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit folder".
    Only user with adminstrator status can edit NF / admin folders.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    folder_id = -1
    folder_title = request.POST.get("title", "")
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.change_userfolder"], 
        'perms_club': ["helper_football.change_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    c_folder = None
    res_data = ""
    is_success = False
    if cur_user.is_superuser:
        c_folder = AdminFolder.objects.filter(id=folder_id).first()
        if c_folder is None:
            c_folder = AdminFolder(name=folder_title)
            try:
                res_data += "Added new folder.\n"
                c_folder.save()
            except Exception as e:
                return JsonResponse({"err": "Can't add the folder.", "success": False}, status=200)
        c_folder.translations_name = utils.set_by_language_code(c_folder.translations_name, request.LANGUAGE_CODE, folder_title)
        try:
            c_folder.save()
            res_data += f'Folder with id: [{c_folder.id}] is edited successfully.'
            is_success = True
        except Exception as e:
            return JsonResponse({"err": "Can't edit the folder.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_delete_folder(request, cur_user):
    """
    Return JSON Response as result on POST operation "Delete folder".
    Only user with adminstrator status can edit NF / admin folders.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    folder_id = -1
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.delete_userfolder"], 
        'perms_club': ["helper_football.delete_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    c_folder = None
    res_data = ""
    is_success = False
    if cur_user.is_superuser:
        c_folder = AdminFolder.objects.filter(id=folder_id).first()
        if c_folder is not None:
            try:
                c_folder.delete()
                res_data += f"Deleted folder (id: {folder_id}).\n"
                is_success = True
            except Exception as e:
                return JsonResponse({"err": "Can't delete the folder.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_change_order_folder(request, cur_user):
    """
    Return JSON Response as result on POST operation "Change folders's ordering".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    ids_data = request.POST.getlist("ids[]", [])
    ordering_data = request.POST.getlist("pos[]", [])
    temp_res_arr = []
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.change_userfolder"], 
        'perms_club': ["helper_football.change_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    is_success = False
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_folder = None
        if cur_user.is_superuser:
            found_folder = AdminFolder.objects.filter(id=t_id).first()
        if found_folder is not None:
            found_folder.order = t_order
            try:
                found_folder.save()
                temp_res_arr.append(f'Folder [{found_folder.id}] is order changed: {t_order}')
                is_success = True
            except Exception as e:
                temp_res_arr.append(f'Folder [{found_folder.id}] -> ERROR / Not access or another reason')
    res_data = {'res_arr': temp_res_arr, 'type': "change_order"}
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_edit_article(request, cur_user):
    """
    Return JSON Response as result on POST operation "Edit article".
    Only user with adminstrator status can edit NF / admin folders.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    article_id = -1
    article_folder = -1
    article_title = request.POST.get("title", "")
    article_content = request.POST.get("content", "")
    article_completed = 0
    try:
        article_id = int(request.POST.get("article", -1))
    except:
        pass
    try:
        article_folder = int(request.POST.get("folder", -1))
    except:
        pass
    try:
        article_completed = int(request.POST.get("completed", 0))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.change_userarticle"], 
        'perms_club': ["helper_football.change_clubarticle"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    c_article = None
    c_folder = None
    res_data = ""
    is_success = False
    if cur_user.is_superuser:
        c_folder = AdminFolder.objects.filter(id=article_folder).first()
        if c_folder is None:
            return JsonResponse({"err": "Can't find folder.", "success": False}, status=200)
        c_article = AdminArticle.objects.filter(id=article_id).first()
        if c_article is None:
            c_article = AdminArticle(folder=c_folder)
            try:
                res_data += "Added new article.\n"
                c_article.save()
            except Exception as e:
                return JsonResponse({"err": "Can't add the article.", "success": False}, status=200)
        c_article.title = utils.set_by_language_code(c_article.title, request.LANGUAGE_CODE, article_title)
        c_article.content = utils.set_by_language_code(c_article.content, request.LANGUAGE_CODE, article_content)
        c_article.folder = c_folder
        c_article.completed = article_completed
        try:
            c_article.save()
            res_data += f'Article with id: [{c_article.id}] is edited successfully.'
            is_success = True
        except Exception as e:
            return JsonResponse({"err": "Can't edit the article.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_delete_article(request, cur_user):
    """
    Return JSON Response as result on POST operation "Delete article".
    Only user with adminstrator status can edit NF / admin folders.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    article_id = -1
    try:
        article_id = int(request.POST.get("article", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.delete_userarticle"], 
        'perms_club': ["helper_football.delete_clubarticle"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    c_article = None
    res_data = ""
    is_success = False
    if cur_user.is_superuser:
        c_article = AdminArticle.objects.filter(id=article_id).first()
        if c_article is not None:
            try:
                c_article.delete()
                res_data += f"Deleted article (id: {article_id}).\n"
                is_success = True
            except Exception as e:
                return JsonResponse({"err": "Can't delete the article.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_change_order_article(request, cur_user):
    """
    Return JSON Response as result on POST operation "Change articles's ordering".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    ids_data = request.POST.getlist("ids[]", [])
    ordering_data = request.POST.getlist("pos[]", [])
    temp_res_arr = []
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.change_userarticle"], 
        'perms_club': ["helper_football.change_clubarticle"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    is_success = False
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_article = None
        if cur_user.is_superuser:
            found_article = AdminArticle.objects.filter(id=t_id).first()
        if found_article is not None:
            found_article.order = t_order
            try:
                found_article.save()
                temp_res_arr.append(f'Article [{found_article.id}] is order changed: {t_order}')
                is_success = True
            except Exception as e:
                temp_res_arr.append(f'Article [{found_article.id}] -> ERROR / Not access or another reason')
    res_data = {'res_arr': temp_res_arr, 'type': "change_order"}
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_change_user_param(request, cur_user):
    """
    Return JSON Response as result on POST operation "Change user's param".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    article_id = -1
    c_value = 0
    c_key = request.POST.get("key", "")
    try:
        article_id = int(request.POST.get("article", -1))
    except:
        pass
    try:
        c_value = int(request.POST.get("value", 0))
    except:
        pass
    res_data = []
    is_success = False
    c_article = AdminArticle.objects.filter(id=article_id).first()
    if c_article is None:
        return JsonResponse({"err": "Can't find the article.", "success": False}, status=400)
    c_param = UserArticleParam.objects.filter(article_nfb=c_article, user=cur_user).first()
    if c_param is None:
        c_param = UserArticleParam(article_nfb=c_article, user=cur_user)
        try:
            c_param.save()
            res_data.append(f"Created new UserArticleParam successfully.")
        except:
            res_data.append(f"Can't create new UserArticleParam.")
    if c_param is not None:
        setattr(c_param, c_key, c_value)
        try:
            c_param.save()
            res_data.append(f"Updated UserArticleParam successfully.")
            is_success = True
        except:
            res_data.append(f"Can't update UserArticleParam.")
    return JsonResponse({"data": res_data, "success": is_success}, status=200)



def GET_get_folders_all(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get all folders".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.view_userfolder"], 
        'perms_club': ["helper_football.view_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    res_exs = []
    # only admin folders temp:
    found_folders = AdminFolder.objects.filter(visible=True, active=True)
    for folder in found_folders:
        f_title = utils.get_by_language_code(folder.translations_name, request.LANGUAGE_CODE)
        folder_data = {
            'id': folder.id, 
            'title': f_title,
            'visible': folder.visible,
        }
        res_exs.append(folder_data)
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_articles_all(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get all articles".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.view_userarticle"], 
        'perms_club': ["helper_football.view_clubarticle"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    res_exs = []
    # only admin folders temp:
    found_articles = AdminArticle.objects.filter(visible=True)
    for article in found_articles:
        a_title = utils.get_by_language_code(article.title, request.LANGUAGE_CODE)
        a_favorite = False
        try:
            user_param = UserArticleParam.objects.filter(article_nfb=article, user=cur_user).first()
            if user_param is not None:
                a_favorite = user_param.favorite
        except Exception as e:
            print(e)
            pass
        article_data = {
            'id': article.id,
            'folder': article.folder.id,
            'title': a_title,
            'completed': article.completed,
            'favorite': a_favorite,
        }
        res_exs.append(article_data)
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_article_one(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get one article".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    article_id = -1
    try:
        article_id = int(request.GET.get("article", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["helper_football.view_userarticle"], 
        'perms_club': ["helper_football.view_clubarticle"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    data_res = {}
    # only admin folders temp:
    found_article = AdminArticle.objects.filter(id=article_id, visible=True).first()
    if found_article:
        a_title = utils.get_by_language_code(found_article.title, request.LANGUAGE_CODE)
        a_content = utils.get_by_language_code(found_article.content, request.LANGUAGE_CODE)
        data_res = {
            'id': found_article.id,
            'folder': found_article.folder.id,
            'title': a_title,
            'content': a_content,
            'completed': found_article.completed,
        }
    return JsonResponse({"data": data_res, "success": True}, status=200)
