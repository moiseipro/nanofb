import datetime
from django.http import JsonResponse
from django.db.models import Sum, Q
from users.models import User
from methodology.models import AdminFolder, UserFolder, ClubFolder
from methodology.models import AdminArticle, UserArticle, ClubArticle
from references.models import UserSeason, ClubSeason, UserTeam, ClubTeam
from references.models import ExsDescriptionTemplate
from nanofootball.views import util_check_access


LANG_CODE_DEFAULT = "en"


def get_by_language_code(value, code):
    """
    Return a value by current language's code.

    :param value: Dictionary with structure("code_1": "value_1",...) for different languages. Usually "value" is STRING.
    :type value: dict[str]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :raise None. In case of an exception, the result: "". 
        If it was not possible to find the desired value by the key, then an attempt will be made to take the default (LANG_CODE_DEFAULT).
    :return: Value, depending on the current language.
    :rtype: [str]

    """
    res = ""
    if not isinstance(value, dict):
        value = {}
    try:
        res = value[code]
    except:
        pass
    if res == "":
        try:
            res = value[LANG_CODE_DEFAULT]
        except:
            pass
    if res is None:
        res = ""
    return res


def set_by_language_code(elem, code, value, value2 = None):
    """
    Return edited object as dict where key: language code, value: string text.

    :param elem: Field of current model. Usually it defined as title, name or description.
    :type elem: [Model.field]
    :param code: String key of any language. For example: "engilsh" -> "en", "russian" -> "ru".
    :type code: [str]
    :param value: New value for returned dictionary.
    :type value: [str]
    :param value2: Additional value for replace "value".
    :type value2: [str] or None
    :return: Object which is field of the Model.
    :rtype: [object]

    """
    if value2:
        value = value2 if value2 != "" else value
    if type(elem) is dict:
        elem[code] = value
    else:
        elem = {code: value}
    return elem


# --------------------------------------------------
# METHODOLOGY API
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
        'perms_user': ["methodology.change_userfolder"], 
        'perms_club': ["methodology.change_clubfolder"]
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
        c_folder.translations_name = set_by_language_code(c_folder.translations_name, request.LANGUAGE_CODE, folder_title)
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
        'perms_user': ["methodology.delete_userfolder"], 
        'perms_club': ["methodology.delete_clubfolder"]
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
        'perms_user': ["methodology.change_userfolder"], 
        'perms_club': ["methodology.change_clubfolder"]
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
    try:
        article_id = int(request.POST.get("article", -1))
    except:
        pass
    try:
        article_folder = int(request.POST.get("folder", -1))
    except:
        pass
    if not util_check_access(cur_user, {
        'perms_user': ["methodology.change_userarticle"], 
        'perms_club': ["methodology.change_clubarticle"]
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
        c_article.title = set_by_language_code(c_article.title, request.LANGUAGE_CODE, article_title)
        c_article.content = set_by_language_code(c_article.content, request.LANGUAGE_CODE, article_content)
        c_article.folder = c_folder
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
        'perms_user': ["methodology.delete_userarticle"], 
        'perms_club': ["methodology.delete_clubarticle"]
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
        'perms_user': ["methodology.change_userarticle"], 
        'perms_club': ["methodology.change_clubarticle"]
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
        'perms_user': ["methodology.view_userfolder"], 
        'perms_club': ["methodology.view_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    res_exs = []
    # only admin folders temp:
    found_folders = AdminFolder.objects.filter(visible=True, active=True)
    for folder in found_folders:
        f_title = get_by_language_code(folder.translations_name, request.LANGUAGE_CODE)
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
        'perms_user': ["methodology.view_userarticle"], 
        'perms_club': ["methodology.view_clubarticle"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    res_exs = []
    # only admin folders temp:
    found_articles = AdminArticle.objects.filter(visible=True)
    for article in found_articles:
        a_title = get_by_language_code(article.title, request.LANGUAGE_CODE)
        article_data = {
            'id': article.id,
            'folder': article.folder.id,
            'title': a_title,
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
        'perms_user': ["methodology.view_userarticle"], 
        'perms_club': ["methodology.view_clubarticle"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    data_res = {}
    # only admin folders temp:
    found_article = AdminArticle.objects.filter(id=article_id, visible=True).first()
    if found_article:
        a_title = get_by_language_code(found_article.title, request.LANGUAGE_CODE)
        a_content = get_by_language_code(found_article.content, request.LANGUAGE_CODE)
        data_res = {
            'id': found_article.id,
            'folder': found_article.folder.id,
            'title': a_title,
            'content': a_content,
        }
    return JsonResponse({"data": data_res, "success": True}, status=200)

