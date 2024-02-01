import datetime
from django.http import JsonResponse
from django.db.models import Sum, Q
from users.models import User
from exercises.models import UserFolder, ClubFolder, AdminFolder, UserExercise, ClubExercise, AdminExercise, TrainerExercise, ExerciseVideo, ExerciseTag, ExerciseTagCategory
from exercises.models import UserExerciseParam, UserExerciseParamTeam
from exercises.models import AdminExerciseAdditionalParams, UserExerciseAdditionalParams, ClubExerciseAdditionalParams, ExerciseAdditionalParamValue
from references.models import ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad
from references.models import ExsKeyword, ExsStressType, ExsPurpose, ExsCoaching
from references.models import ExsCategory, ExsAdditionalData, ExsTitleName, ExsType, ExsPhysicalQualities
from references.models import UserSeason, ClubSeason, UserTeam, ClubTeam
from references.models import ExsDescriptionTemplate
from references.models import ExsFeatures, UserExsFeatures, ClubExsFeatures
from video.models import Video
from nanofootball.views import util_check_access
from video.views import delete_video_obj_nf
from trainings.models import UserTraining, ClubTraining, UserTrainingExercise, ClubTrainingExercise
import re
import requests
import nanofootball.utils as utils


NEW_SCHEME_DRAWER_URL = "https://nanofootballdraw.ru"


def set_value_as_ref(request, name, def_value = None):
    """
    Return new value as Reference Model Object. Using argument "name" the appropriate directory is selected.
    In case of success new value will be returned else returned default value.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param name: Name of getting request parameter.
    :type name: [str]
    :param def_value: Default value for new value.
    :type def_value: [int] or None
    :return: New value for setting to field.
    :rtype: [Model.object] or None

    """
    res = def_value
    ref_id = -1
    try:
        ref_id = int(request.POST.get(name, def_value))
    except:
        pass
    if name == "data[ref_goal]":
        res = ExsGoal.objects.filter(id=ref_id)
    elif name == "data[ref_ball]":
        res = ExsBall.objects.filter(id=ref_id)
    elif name == "data[ref_team_category]":
        res = ExsTeamCategory.objects.filter(id=ref_id)
    elif name == "data[ref_age_category]":
        res = ExsAgeCategory.objects.filter(id=ref_id)
    elif name == "data[ref_train_part]":
        res = ExsTrainPart.objects.filter(id=ref_id)
    elif name == "data[ref_cognitive_load]":
        res = ExsCognitiveLoad.objects.filter(id=ref_id)
    elif name == "data[ref_stress_type]":
        res = ExsStressType.objects.filter(id=ref_id)
    if res and res.exists() and res[0].id != None:
        res = res[0]
    else:
        res = None
    return res


def set_exs_additional_params(request, exs, folder_type):
    params = []
    params = exs.additional_params.filter()
    if folder_type == utils.FOLDER_NFB:
        params = exs.additional_params.through.objects.filter(exercise_nfb=exs, param_nfb__visible=True)
    elif folder_type == utils.FOLDER_TEAM and request.user.club_id is None:
        params = exs.additional_params.through.objects.filter(exercise_user=exs, param_user__visible=True)
    elif folder_type == utils.FOLDER_CLUB or folder_type == utils.FOLDER_TEAM and request.user.club_id is not None:
        params = exs.additional_params.through.objects.filter(exercise_club=exs, param_club__visible=True)
    for param in params:
        new_val = request.POST.get(f"data[additional_params__{param.id}]", "")
        param.value = new_val
        param.save()
    return exs


def get_exercises_params(request, user, team, only_child_folders=False):
    """
    Return data of User folders, NFB Folders, References.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param user: The current user of the system, who is currently authorized.
    :type user: <QuerySet>Model.object[User], not only ONE (Use Models.objects.filter NOT Models.objects.get to get user).
    :param team: The current team, that is selected by the user.
    :type team: [int]
    :return: List of three elements: Folders, NFB Folders, References.
    :rtype: list[object]

    """
    folders = []
    club_folders = []
    nfb_folders = []
    refs = {}
    if util_check_access(user, {
        'perms_user': ["exercises.view_userfolder"], 
        'perms_club': ["exercises.view_clubfolder"]
    }):
        if request.user.club_id is not None:
            folders = ClubFolder.objects.filter(club=request.user.club_id, visible=True)
            club_folders = ClubFolder.objects.filter(club=request.user.club_id, visible=True)
        else:
            folders = UserFolder.objects.filter(user=user, team=team, visible=True)
    nfb_folders = AdminFolder.objects.filter(visible=True)
    if not user.is_superuser:
        nfb_folders = nfb_folders.filter(active=True)
    if only_child_folders:
        try:
            folders = folders.filter(parent__isnull=False)
        except:
            pass
        try:
            club_folders = club_folders.filter(parent__isnull=False)
        except:
            pass
        try:
            nfb_folders = nfb_folders.filter(parent__isnull=False)
        except:
            pass
    for elem in folders:
        is_root = not (elem.parent and elem.parent != 0)
        setattr(elem, 'root', is_root)
    for elem in nfb_folders:
        is_root = not (elem.parent and elem.parent != 0)
        setattr(elem, 'root', is_root)
    refs['exs_goal'] = ExsGoal.objects.filter().values()
    refs['exs_ball'] = ExsBall.objects.filter().values()
    refs['exs_team_category'] = ExsTeamCategory.objects.filter().values()
    refs['exs_age_category'] = ExsAgeCategory.objects.filter().values()
    refs['exs_train_part'] = ExsTrainPart.objects.filter().values()
    refs['exs_cognitive_load'] = ExsCognitiveLoad.objects.filter().values()
    refs['exs_additional_data'] = ExsAdditionalData.objects.filter().values()
    refs['exs_keyword'] = ExsKeyword.objects.filter().values()
    refs['exs_keyword_keycodes'] = ExsKeyword.objects.filter().values('keycode').order_by('keycode').distinct()
    refs['exs_stress_type'] = ExsStressType.objects.filter().values()
    refs['exs_purpose'] = ExsPurpose.objects.filter().values()
    refs['exs_coaching'] = ExsCoaching.objects.filter().values()
    refs['exs_category'] = ExsCategory.objects.filter().values()
    refs['exs_types'] = ExsType.objects.filter().values()
    refs['exs_physical_qualities'] = ExsPhysicalQualities.objects.filter().values()
    refs['exs_title_names'] = ExsTitleName.objects.filter().values()
    refs = utils.set_refs_translations(refs, request.LANGUAGE_CODE)
    return [folders, club_folders, nfb_folders, refs]


def get_exs_scheme_data(data):
    """
    Return list of two schemas. Inaccessible scheme is changed to standard.

    :param data: Object with key "scheme_1" and "scheme_2". Values by these keys are html strings.
    :type data: [object]
    :return: List of schemas.
    :rtype: list[str]

    """
    empty_scheme = """
        <svg id="block" class="d-block bg-success mx-auto" viewBox="0 0 600 400" height="100%" width="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#000000"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="ffffffarrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#ffffff"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="ffff00arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#ffff00"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="ff0000arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#ff0000"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <marker id="000000arrow" markerWidth="15" markerHeight="12" refX="1" refY="6" orient="auto" markerUnits="userSpaceOnUse" fill="#000000"><polyline points="1 1, 16 5.5, 1 12"></polyline></marker>
                <filter id="f3" x="0" y="0" width="200%" height="200%"><feOffset result="offOut" in="SourceAlpha" dx="5" dy="5"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="3"></feGaussianBlur><feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter>
            </defs>
            <image id="plane" x="0" y="0" data-width="600" data-height="400" width="100%" height="100%" href="/static/exercises/img/field.svg"></image>
            <g id="selects"></g>
            <g id="figures"></g>
            <g id="lines"></g>
            <g id="objects"></g>
            <g id="dots"></g>
            <line id="xLine" x1="-1" y1="0" x2="-1" y2="1600" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
            <line id="yLine" x1="0" y1="-1" x2="2400" y2="-1" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
            <line id="xLine2" x1="-2400" y1="0" x2="-2400" y2="1600" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
            <line id="yLine2" x1="0" y1="-1600" x2="2400" y2="-1600" stroke="red" stroke-dasharray="10" stroke-width="1"></line>
        </svg>
    """
    res = []
    if data and data['scheme_1']:
        res.append(data['scheme_1'])
    else:
        res.append(empty_scheme)
    if data and data['scheme_2']:
        res.append(data['scheme_2'])
    else:
        res.append(empty_scheme)
    return res


def get_exs_video_data(data):
    """
    Return list of videos transforming incoming argument "data".

    """
    res = []
    if data and data['data']:
        res = data['data']
    return res


def get_exs_animation_data(data):
    """
    Return list of animations transforming incoming argument "data".

    """
    res = {'custom': '', 'default': []}
    if data and data['data']:
        res = data['data']
    return res


def get_exs_video_data2(data, exs, folder_type, club_id):
    """
    Return changed data with fields: "video_1", "video_2", "animation_1", "animation_2".
    Exercise has linked videos. Using exercise object and folder's type function add these new keys.

    :param data: Exercise object with all keys.
    :type data: Model.Field[object]
    :param exs: The current exercise.
    :type exs: Model.object[UserExercise] or Model.object[ClubExercise] or Model.object[AdminExercise].
    :param folder_type: The current folder, that is selected by the user.
    :type folder_type: [str]
    :return: Updated exercise.
    :rtype: Model.Field[object]

    """
    videos = []
    if folder_type == utils.FOLDER_NFB:
        videos = exs.videos.through.objects.filter(exercise_nfb=exs)
    elif folder_type == utils.FOLDER_TEAM and club_id is None:
        videos = exs.videos.through.objects.filter(exercise_user=exs)
    elif folder_type == utils.FOLDER_CLUB or folder_type == utils.FOLDER_TEAM and club_id is not None:
        videos = exs.videos.through.objects.filter(exercise_club=exs)
    elif folder_type == utils.FOLDER_TRAINER:
        videos = exs.videos.through.objects.filter(exercise_trainer=exs)
    for video in videos:
        t_key = ""
        if video.type == 1:
            t_key = 'video_1'
        elif video.type == 2:
            t_key = 'video_2'
        elif video.type == 3:
            t_key = 'animation_1'
        elif video.type == 4:
            t_key = 'animation_2'
        data[t_key] = {
            'id': video.video.id if video.video else -1, 
            'links': video.video.links if video.video else ""
        }
    return data


def get_tags_of_exercise(exs, use_lower=False):
    """
    Return tags of exercise.

    :param data: Exercise object with all keys.
    :type data: Model.Field[object]
    :param exs: The current exercise.
    :type exs: Model.object[UserExercise] or Model.object[ClubExercise] or Model.object[AdminExercise].
    :param folder_type: The current folder, that is selected by the user.
    :type folder_type: [str]
    :return: Updated exercise.
    :rtype: Model.Field[object]

    """
    data = []
    tags = exs.tags.all()
    for tag in tags:
        if not use_lower:
            data.append(tag.name)
        else:
            data.append(tag.lowercase_name)
    return data


def get_exs_additional_params(data, exs, folder_type, user, club_id, lang_code):
    """
    Return changed data with additional params.

    :param data: Exercise object with all keys.
    :type data: Model.Field[object]
    :param exs: The current exercise.
    :type exs: Model.object[UserExercise] or Model.object[ClubExercise] or Model.object[AdminExercise].
    :param folder_type: The current folder, that is selected by the user.
    :type folder_type: [str]
    :return: Updated exercise.
    :rtype: Model.Field[object]

    """
    t_params = []
    additional_params = []
    if folder_type == utils.FOLDER_NFB:
        nonexistent_params = AdminExerciseAdditionalParams.objects.exclude(exerciseadditionalparamvalue__exercise_nfb=exs)
        for param in nonexistent_params:
            new_param = ExerciseAdditionalParamValue(param_nfb=param, exercise_nfb=exs)
            new_param.save()
        t_params = exs.additional_params.through.objects.filter(exercise_nfb=exs, param_nfb__visible=True)
        t_params = t_params.order_by('param_nfb__order')
    elif folder_type == utils.FOLDER_TEAM and club_id is None:
        nonexistent_params = UserExerciseAdditionalParams.objects.exclude(exerciseadditionalparamvalue__exercise_user=exs, user=user)
        for param in nonexistent_params:
            new_param = ExerciseAdditionalParamValue(param_user=param, exercise_user=exs)
            new_param.save()
        t_params = exs.additional_params.through.objects.filter(exercise_user=exs, param_user__visible=True)
        t_params = t_params.order_by('param_user__order')
    elif folder_type == utils.FOLDER_CLUB or folder_type == utils.FOLDER_TEAM and club_id is not None:
        nonexistent_params = ClubExerciseAdditionalParams.objects.exclude(exerciseadditionalparamvalue__exercise_club=exs, club=club_id)
        for param in nonexistent_params:
            new_param = ExerciseAdditionalParamValue(param_club=param, exercise_club=exs)
            new_param.save()
        t_params = exs.additional_params.through.objects.filter(exercise_club=exs, param_club__visible=True)
        t_params = t_params.order_by('param_club__order')
    for param in t_params:
        c_title = ""
        if folder_type == utils.FOLDER_NFB:
            c_title = utils.get_by_language_code(param.param_nfb.field, lang_code)
        elif folder_type == utils.FOLDER_TEAM and club_id is None:
            c_title = utils.get_by_language_code(param.param_user.param.field, lang_code)
        elif folder_type == utils.FOLDER_CLUB or folder_type == utils.FOLDER_TEAM and club_id is not None:
            c_title = utils.get_by_language_code(param.param_club.param.field, lang_code)
        additional_params.append({
            'id': param.id,
            'title': c_title,
            'value': param.value
        })
    data['additional_params'] = additional_params
    return data


def get_excerises_data(folder_id=-1, folder_type="", req=None, cur_user=None, cur_team=None, to_count=False, count_for_tag=None, exercise_id=-1):
    """
    Return list of exercise objects. If filter options exist then current list will be filtered.
    Filter options are defined via next parameters of request: filter["filter_name"].

    :param folder_id: Folder's ID.
    :type folder_id: [int]
    :param folder_type: The current folder, that is selected by the user.
    :type folder_type: [str]
    :param req: Django HttpRequest.
    :type req: [HttpRequest] or None
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User] or None
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: List of filtered exercises (as objects).
    :rtype: list[object]

    """
    filter_goal = -1
    filter_ball = -1
    filter_favorite = -1
    filter_new_exs = -1
    filter_new_folder_exs = -1
    filter_editing_exs = -1
    filter_search = ""
    filter_tags = []
    filter_video_source = -1
    filter_age = -1
    filter_players = -1
    filter_pro = -1
    filter_u_big = -1
    filter_video_watched = -1
    filter_video_watched_not = -1
    filter_video_isvideo = -1
    filter_video_isanimation = -1
    try:
        if req.method == "GET":
            filter_goal = int(req.GET.get("filter[goal]", -1))
        elif req.method == "POST":
            filter_goal = int(req.POST.get("filter[goal]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_ball = int(req.GET.get("filter[ball]", -1))
        elif req.method == "POST":
            filter_ball = int(req.POST.get("filter[ball]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_favorite = int(req.GET.get("filter[favorite]", -1))
        elif req.method == "POST":
            filter_favorite = int(req.POST.get("filter[favorite]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_new_exs = int(req.GET.get("filter[new_exs]", -1))
        elif req.method == "POST":
            filter_new_exs = int(req.POST.get("filter[new_exs]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_new_folder_exs = int(req.GET.get("filter[new_folder_exs]", -1))
        elif req.method == "POST":
            filter_new_folder_exs = int(req.POST.get("filter[new_folder_exs]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_editing_exs = int(req.GET.get("filter[editing_exs]", -1))
        elif req.method == "POST":
            filter_editing_exs = int(req.POST.get("filter[editing_exs]", -1))
    except:
        pass
    
    try:
        if req.method == "GET":
            filter_search = req.GET.get("filter[_search]", "")
        elif req.method == "POST":
            filter_search = req.POST.get("filter[_search]", "")
    except:
        pass
    try:
        if req.method == "GET":
            filter_tags = req.GET.getlist("filter[tags][]")
        elif req.method == "POST":
            filter_tags = req.POST.getlist("filter[tags][]")
    except:
        pass
    try:
        if req.method == "GET":
            filter_video_source = int(req.GET.get("filter[video_sources]", -1))
        elif req.method == "POST":
            filter_video_source = int(req.POST.get("filter[video_sources]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_age = int(req.GET.get("filter[filter_age]", -1))
        elif req.method == "POST":
            filter_age = int(req.POST.get("filter[filter_age]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_players = int(req.GET.get("filter[filter_players]", -1))
        elif req.method == "POST":
            filter_players = int(req.POST.get("filter[filter_players]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_pro = int(req.GET.get("filter[pro]", -1))
        elif req.method == "POST":
            filter_pro = int(req.POST.get("filter[pro]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_u_big = int(req.GET.get("filter[u_big]", -1))
        elif req.method == "POST":
            filter_u_big = int(req.POST.get("filter[u_big]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_video_watched = int(req.GET.get("filter[video_watched]", -1))
        elif req.method == "POST":
            filter_video_watched = int(req.POST.get("filter[video_watched]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_video_watched_not = int(req.GET.get("filter[video_watched_not]", -1))
        elif req.method == "POST":
            filter_video_watched_not = int(req.POST.get("filter[video_watched_not]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_video_isvideo = int(req.GET.get("filter[video_isvideo]", -1))
        elif req.method == "POST":
            filter_video_isvideo = int(req.POST.get("filter[video_isvideo]", -1))
    except:
        pass
    try:
        if req.method == "GET":
            filter_video_isanimation = int(req.GET.get("filter[video_isanimation]", -1))
        elif req.method == "POST":
            filter_video_isanimation = int(req.POST.get("filter[video_isanimation]", -1))
    except:
        pass
    f_exercises = []
    c_folder = None
    child_folders = None
    if count_for_tag is not None:
        all_folders = get_exercises_params(req, cur_user, cur_team, True)
        team_folders = all_folders[0]
        club_folders = all_folders[1]
        nfb_folders = all_folders[2]
    if folder_type == utils.FOLDER_TEAM:
        if count_for_tag is None or (count_for_tag is not None and folder_id != -1):
            if req.user.club_id is not None:
                c_folder = ClubFolder.objects.filter(id=folder_id, club=req.user.club_id)
            else:
                c_folder = UserFolder.objects.filter(id=folder_id)
            if not c_folder.exists() or c_folder[0].id == None:
                return []
            if req.user.club_id is not None:
                child_folders = ClubFolder.objects.filter(parent=c_folder[0].id, club=req.user.club_id)
            else:
                child_folders = UserFolder.objects.filter(parent=c_folder[0].id)
            if child_folders.count() > 0:
                if req.user.club_id is not None:
                    f_exercises = ClubExercise.objects.filter(folder__in = child_folders, team=cur_team)
                else:
                    f_exercises = UserExercise.objects.filter(folder__in = child_folders)
            else:
                if req.user.club_id is not None:
                    f_exercises = ClubExercise.objects.filter(folder = c_folder[0], team=cur_team)
                else:
                    f_exercises = UserExercise.objects.filter(folder = c_folder[0])
            if exercise_id != -1:
                f_exercises = f_exercises.filter(id=exercise_id)
        else:
            if req.user.club_id is not None:
                f_exercises = ClubExercise.objects.filter(folder__in = team_folders, team=cur_team)
            else:
                f_exercises = UserExercise.objects.filter(folder__in = team_folders)
    elif folder_type == utils.FOLDER_NFB:
        if count_for_tag is None or (count_for_tag is not None and folder_id != -1):
            c_folder = AdminFolder.objects.filter(id=folder_id)
            if not c_folder.exists() or c_folder[0].id == None:
                return []
            child_folders = AdminFolder.objects.filter(parent=c_folder[0].id)
            if child_folders.count() > 0:
                f_exercises = AdminExercise.objects.filter(folder__in = child_folders)
            else:
                f_exercises = AdminExercise.objects.filter(folder = c_folder[0])
            if exercise_id != -1:
                f_exercises = f_exercises.filter(id=exercise_id)
        else:
            f_exercises = AdminExercise.objects.filter(folder__in = nfb_folders)
    elif folder_type == utils.FOLDER_CLUB:
        if count_for_tag is None or (count_for_tag is not None and folder_id != -1):
            if req.user.club_id is not None:
                c_folder = ClubFolder.objects.filter(id=folder_id, club=req.user.club_id)
                if not c_folder.exists() or c_folder[0].id == None:
                    return []
                child_folders = ClubFolder.objects.filter(parent=c_folder[0].id, club=req.user.club_id)
                if child_folders.count() > 0:
                    f_exercises = ClubExercise.objects.filter(folder__in = child_folders)
                else:
                    f_exercises = ClubExercise.objects.filter(folder = c_folder[0])
                if exercise_id != -1:
                    f_exercises = f_exercises.filter(id=exercise_id)
        else:
            if req.user.club_id is not None:
                f_exercises = ClubExercise.objects.filter(folder__in = club_folders)
    elif folder_type == utils.FOLDER_TRAINER:
        last_name = cur_user.personal.last_name.lower().replace(' ', '')
        f_exercises = TrainerExercise.objects.filter(user_name=last_name, user_birthdate=cur_user.personal.date_birthsday)
    if not cur_user.is_superuser:
        f_exercises = f_exercises.filter(visible=True)
    
    if filter_goal != -1:
        f_exercises = f_exercises.filter(
            Q(
                Q(field_goal__icontains="g_big") |
                Q(field_goal__icontains="g_small")
            )
        )
    if filter_ball != -1:
        f_exercises = f_exercises.filter(ref_ball__short_name="true")
    if len(filter_tags) > 0:
        for f_tag in filter_tags:
            f_exercises = f_exercises.filter(tags__lowercase_name__icontains=f_tag)
    if filter_new_exs != -1:
        enddate = datetime.date.today()
        startdate = enddate - datetime.timedelta(days=30)
        f_exercises = f_exercises.filter(date_creation__range=[startdate, enddate])
    if filter_new_folder_exs != -1:
        enddate = datetime.date.today()
        startdate = enddate - datetime.timedelta(days=30)
        f_exercises = f_exercises.filter(date_editing_folder__range=[startdate, enddate])
    if filter_editing_exs != -1:
        enddate = datetime.date.today()
        startdate = enddate - datetime.timedelta(days=30)
        f_exercises = f_exercises.filter(date_editing__range=[startdate, enddate])
        # f_exercises = f_exercises.filter(date_editing=enddate)
    if filter_favorite != -1:
        f_exercises = f_exercises.filter(
            Q(userexerciseparam__favorite=filter_favorite, userexerciseparam__user=cur_user)
        )
    if filter_search != "":
        filter_search_low = filter_search.lower()
        searh_regex = r'(.*)[\"]' + re.escape(req.LANGUAGE_CODE) + r'[\"][:](.*)[\"](.*)(' + re.escape(filter_search_low) + r')(.*)[\"]'
        f_exercises = f_exercises.filter(
            Q(title__iregex=searh_regex) |
            Q(field_keyword_a__iexact=filter_search_low) |
            Q(field_keyword_b__iexact=filter_search_low)
        )
    if filter_video_source != -1:
        if filter_video_source == -2:
            f_exercises = f_exercises.filter(
                Q(exercisevideo__video__isnull=False) & Q(exercisevideo__video__videosource_id__isnull=True)
            )
        else:
            f_exercises = f_exercises.filter(
                Q(exercisevideo__video__isnull=False) & Q(exercisevideo__video__videosource_id=filter_video_source)
            )
    if filter_age != -1:
        f_exercises = f_exercises.filter(
            Q(Q(field_age_a__isnull=False) & Q(field_age_b__isnull=True) & Q(field_age_a__lte=filter_age)) |
            Q(Q(field_age_a__isnull=True) & Q(field_age_b__isnull=False) & Q(field_age_b__gte=filter_age)) |
            Q(Q(field_age_a__isnull=False) & Q(field_age_b__isnull=False) & Q(field_age_a__lte=filter_age) & Q(field_age_b__gte=filter_age))
        )
    if filter_players != -1:
        f_exercises = f_exercises.filter(
            Q(Q(field_players_a__isnull=False) & Q(field_players_b__isnull=True) & Q(field_players_a__lte=filter_players)) |
            Q(Q(field_players_a__isnull=True) & Q(field_players_b__isnull=False) & Q(field_players_b__gte=filter_players)) |
            Q(Q(field_players_a__isnull=False) & Q(field_players_b__isnull=False) & Q(field_players_a__lte=filter_players) & Q(field_players_b__gte=filter_players))
        )
    if filter_pro != -1:
        f_exercises = f_exercises.filter(
            Q(field_categories__icontains="pro") 
        )
    if filter_u_big != -1:
        f_exercises = f_exercises.filter(
            Q(field_categories__icontains="u_big") 
        )
    if filter_video_watched != -1:
        f_exercises = f_exercises.filter(
            Q(userexerciseparam__video_1_watched=True, userexerciseparam__user=cur_user)
        ).distinct()
    if filter_video_watched_not != -1:
        f_exercises = f_exercises.filter(
            Q(
                ~Q(userexerciseparam__video_1_watched=True, userexerciseparam__user=cur_user) |
                Q(userexerciseparam__video_1_watched=False, userexerciseparam__user=cur_user)
            )
        ).distinct()
    if filter_video_isvideo != -1:
        f_exercises = f_exercises.filter(
            Q(exercisevideo__video__note__video=True)
        ).distinct()
    if filter_video_isanimation != -1:
        f_exercises = f_exercises.filter(
            Q(exercisevideo__video__note__animation=True)
        ).distinct()
    if count_for_tag:
        f_exercises = f_exercises.filter(tags__lowercase_name__in=[count_for_tag]).distinct()

    if not to_count:
        last_name = cur_user.personal.last_name.lower().replace(' ', '')
        f_exercises_list = [entry for entry in f_exercises.values()]
        for exercise in f_exercises_list:
            exercise['search_title'] = utils.get_by_language_code(exercise['title'], req.LANGUAGE_CODE).lower()
            exercise['has_video_1'] = False
            exercise['has_video_2'] = False
            exercise['has_animation_1'] = False
            exercise['has_animation_2'] = False
            exercise['trainings_count'] = -1
            exercise['nf_exs'] = folder_type == utils.FOLDER_NFB
            exercise['in_trainer_folder'] = TrainerExercise.objects.filter(user_name=last_name, user_birthdate=cur_user.personal.date_birthsday, exs_ref=exercise['id']).first() != None or folder_type == utils.FOLDER_TRAINER
            user_params = None
            video_1 = None
            video_2 = None
            anim_1 = None
            anim_2 = None
            f_season = None
            try:
                cur_season = int(req.session['season'])
                if req.user.club_id is not None:
                    f_season = ClubSeason.objects.get(id=cur_season, club_id=req.user.club_id)
                else:
                    f_season = UserSeason.objects.get(id=cur_season, user_id=cur_user)
            except:
                pass
            if folder_type == utils.FOLDER_TEAM:
                if req.user.club_id is not None:
                    user_params = UserExerciseParam.objects.filter(exercise_club=exercise['id'], user=cur_user)
                else:
                    user_params = UserExerciseParam.objects.filter(exercise_user=exercise['id'], user=cur_user)
                video_1 = ExerciseVideo.objects.filter(exercise_user=exercise['id'], type=1).first()
                video_2 = ExerciseVideo.objects.filter(exercise_user=exercise['id'], type=2).first()
                anim_1 = ExerciseVideo.objects.filter(exercise_user=exercise['id'], type=3).first()
                anim_2 = ExerciseVideo.objects.filter(exercise_user=exercise['id'], type=4).first()
                exercise['trainings_count'] = 0
                if f_season and f_season.id != None:
                    if req.user.club_id is not None:
                        exercise['trainings_count'] = ClubTrainingExercise.objects.filter(exercise_id=exercise['id'], training_id__event_id__club_id=req.user.club_id, training_id__team_id=cur_team, training_id__event_id__date__range=[f_season.date_with, f_season.date_by]).count()
                    else:
                        exercise['trainings_count'] = UserTrainingExercise.objects.filter(exercise_id=exercise['id'], training_id__event_id__user_id=cur_user, training_id__team_id=cur_team, training_id__event_id__date__range=[f_season.date_with, f_season.date_by]).count()
            elif folder_type == utils.FOLDER_NFB:
                user_params = UserExerciseParam.objects.filter(exercise_nfb=exercise['id'], user=cur_user)
                if cur_user.is_superuser:
                    notes = UserExerciseParamTeam.objects.filter(exercise_nfb=exercise['id']).only('id', 'note')
                    if notes.exists() and notes[0].id != None:
                        notes = notes[0].note
                        if notes and req.LANGUAGE_CODE in notes and notes[req.LANGUAGE_CODE] and len(notes[req.LANGUAGE_CODE]) > 0:
                            exercise['has_notes'] = True
                video_1 = ExerciseVideo.objects.filter(exercise_nfb=exercise['id'], type=1).first()
                video_2 = ExerciseVideo.objects.filter(exercise_nfb=exercise['id'], type=2).first()
                anim_1 = ExerciseVideo.objects.filter(exercise_nfb=exercise['id'], type=3).first()
                anim_2 = ExerciseVideo.objects.filter(exercise_nfb=exercise['id'], type=4).first()
            elif folder_type == utils.FOLDER_CLUB:
                user_params = UserExerciseParam.objects.filter(exercise_club=exercise['id'], user=cur_user)
                video_1 = ExerciseVideo.objects.filter(exercise_club=exercise['id'], type=1).first()
                video_2 = ExerciseVideo.objects.filter(exercise_club=exercise['id'], type=2).first()
                anim_1 = ExerciseVideo.objects.filter(exercise_club=exercise['id'], type=3).first()
                anim_2 = ExerciseVideo.objects.filter(exercise_club=exercise['id'], type=4).first()
            elif folder_type == utils.FOLDER_TRAINER:
                user_params = UserExerciseParam.objects.filter(exercise_trainer=exercise['id'])
                video_1 = ExerciseVideo.objects.filter(exercise_trainer=exercise['id'], type=1).first()
                video_2 = ExerciseVideo.objects.filter(exercise_trainer=exercise['id'], type=2).first()
                anim_1 = ExerciseVideo.objects.filter(exercise_trainer=exercise['id'], type=3).first()
                anim_2 = ExerciseVideo.objects.filter(exercise_trainer=exercise['id'], type=4).first()
                exercise['trainings_count'] = 0
            if video_1 and video_1.video:
                if video_1.video.note and video_1.video.note['video']:
                    exercise['has_video_1'] = True
                elif video_1.video.note and video_1.video.note['animation']:
                    exercise['has_animation_1'] = True
            if anim_1 and anim_1.video:
                if anim_1.video.note and anim_1.video.note['video']:
                    exercise['has_video_1'] = True
                elif anim_1.video.note and anim_1.video.note['animation']:
                    exercise['has_animation_1'] = True
            if user_params != None and user_params.exists() and user_params[0].id != None:
                user_params = user_params.values()[0]
                exercise['favorite'] = user_params['favorite']
                exercise['video_1_watched'] = user_params['video_1_watched']
                exercise['video_2_watched'] = user_params['video_2_watched']
                exercise['animation_1_watched'] = user_params['animation_1_watched']
                exercise['animation_2_watched'] = user_params['animation_2_watched']
            watched_status = 0
            if 'video_1_watched' in exercise:
                if exercise['has_video_1'] and exercise['video_1_watched']:
                    watched_status = 1
            if 'video_2_watched' in exercise:
                if exercise['has_video_2'] and exercise['video_2_watched']:
                    watched_status = 1
            if 'animation_1_watched' in exercise:
                if exercise['has_animation_1'] and exercise['animation_1_watched']:
                    watched_status = 1
            if 'animation_2_watched' in exercise:
                if exercise['has_animation_2'] and exercise['animation_2_watched']:
                    watched_status = 1
            favorite_status = 0
            if 'favorite' in exercise:
                favorite_status = 1 if exercise['favorite'] else 0
            exercise['watched_status'] = watched_status
            exercise['favorite_status'] = favorite_status
        return f_exercises_list
    return f_exercises


def check_video(id):
    """
    Return Video object if it existed by ID or None.

    :param id: Video's ID.
    :type id: [int]
    :return: Video object or None.
    :rtype: Model.object[Video]

    """
    f_video = Video.objects.filter(id=id)
    if f_video.exists() and f_video[0].id != None:
        return f_video[0]
    return None


def get_exercises_tags(request, user, team, only_visible=False):
    """
    Return data of Exercises' tags.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param user: The current user of the system, who is currently authorized.
    :type user: <QuerySet>Model.object[User], not only ONE (Use Models.objects.filter NOT Models.objects.get to get user).
    :param team: The current team, that is selected by the user.
    :type team: [int]
    :return: List of tags.
    :rtype: list[object]

    """
    tags = {'nfb': [], 'self': [], 'categories': {'nfb': [], 'self': []}}
    query_nfb_str = Q(is_nfb=True)
    query_club_str = Q(is_nfb=False, club=request.user.club_id)
    query_user_str = Q(is_nfb=False, user=user)
    if only_visible:
        query_nfb_str = query_nfb_str & Q(visible=True)
        query_club_str = query_club_str & Q(visible=True)
        query_user_str = query_user_str & Q(visible=True)
    tags['nfb'] = ExerciseTag.objects.filter(query_nfb_str)
    tags['categories']['nfb'] = ExerciseTagCategory.objects.filter(query_nfb_str)
    if request.user.club_id is not None:
        tags['self'] = ExerciseTag.objects.filter(query_club_str)
        tags['categories']['self'] = ExerciseTagCategory.objects.filter(query_club_str)
    else:
        tags['self'] = ExerciseTag.objects.filter(query_user_str)
        tags['categories']['self'] = ExerciseTagCategory.objects.filter(query_user_str)
    return tags


def get_exercises_additional_params(request, user):
    """
    Return data of Exercises' additional parametres.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param user: The current user of the system, who is currently authorized.
    :type user: <QuerySet>Model.object[User], not only ONE (Use Models.objects.filter NOT Models.objects.get to get user).
    :return: List of additional parametres.
    :rtype: list[object]

    """
    admin_params = []
    params = []
    if user.is_superuser:
        admin_params = AdminExerciseAdditionalParams.objects.all()
        for param in admin_params:
            field = utils.get_by_language_code(param.field, request.LANGUAGE_CODE)
            setattr(param, 'field', field)
    if request.user.club_id is not None:
        nonexistent_params = AdminExerciseAdditionalParams.objects.exclude(clubexerciseadditionalparams__club=request.user.club_id)
        for param in nonexistent_params:
            new_param = ClubExerciseAdditionalParams(param=param, club=request.user.club_id, order=param.order, visible=param.visible)
            new_param.save()
        params = ClubExerciseAdditionalParams.objects.filter(club=request.user.club_id, param__visible=True)
    else:
        nonexistent_params = AdminExerciseAdditionalParams.objects.exclude(userexerciseadditionalparams__user=user)
        for param in nonexistent_params:
            new_param = UserExerciseAdditionalParams(param=param, user=user, order=param.order, visible=param.visible)
            new_param.save()
        params = UserExerciseAdditionalParams.objects.filter(user=user, param__visible=True)
    for param in params:
        field = utils.get_by_language_code(param.param.field, request.LANGUAGE_CODE)
        setattr(param, 'field', field)
    return {'params': params, 'admin_params': admin_params}


def get_exercises_features(request, user, team):
    features = None
    if request.user.club_id is not None:
        features = ClubExsFeatures.objects.filter(club_id=request.user.club_id)
    else:
        features = UserExsFeatures.objects.filter(user_id=user)
    features = list(features.values()) if features is not None else []
    return features
# --------------------------------------------------
# EXERCISES API
def POST_copy_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Copy exercise". User can copy the exercise from
    NFB folder or from TEAM folder. Copied exercise from NFB Folder is not available to edit video, animation and schemas.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    exs_ids = []
    folder_id = -1
    folder_type = request.POST.get("type", "")
    move_move = request.POST.get("move_mode", "")
    is_to_trainer = request.POST.get("folder", "") == utils.FOLDER_TRAINER
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        exs_ids = request.POST.getlist("exs[]", [])
    except:
        pass
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    found_folder = None
    found_team = None
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
        'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if move_move != "all":
        exs_ids = [exs_id]
    if is_to_trainer:
        EXS_LIMIT = 1200
        last_name = cur_user.personal.last_name.lower().replace(' ', '')
        exs_count = TrainerExercise.objects.filter(user_name=last_name, user_birthdate=cur_user.personal.date_birthsday).count()
        if exs_count + len(exs_ids) > EXS_LIMIT:
            return JsonResponse({"errors": "Trainer's exercises limit. Max: 250!", "code": "limit", "value": EXS_LIMIT}, status=400)
    else:
        if request.user.club_id is not None:
            found_folder = ClubFolder.objects.filter(id=folder_id, club=request.user.club_id)
        else:
            found_folder = UserFolder.objects.filter(id=folder_id)
        if not (found_folder and found_folder.exists() and found_folder[0].id != None):
            return JsonResponse({"errors": "Can't copy exercise / exercises"}, status=400)
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if not found_team or not found_team.exists() or found_team[0].id == None:
        return JsonResponse({"err": "Cant find team.", "success": False}, status=400)
    success_status = False
    res_data = {'ids': [], 'exs_params': [], 'videos': [], 'err': []}
    for exs_id in exs_ids:
        c_exs = None
        new_exs = None
        if found_folder and found_folder.exists() and found_folder[0].id != None:
            if folder_type == utils.FOLDER_NFB:
                c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
                if c_exs.exists() and c_exs[0].id != None:
                    if request.user.club_id is not None:
                        new_exs = ClubExercise(user=cur_user, club=request.user.club_id, team=found_team[0])
                    else:
                        new_exs = UserExercise(user=cur_user)
                    for key in c_exs.values()[0]:
                        if key != "id" and key != "date_creation":
                            if key == "scheme_1" or key == "scheme_2":
                                new_scheme_id = ""
                                scheme_id = c_exs.values()[0][key]
                                response = requests.post(f'{NEW_SCHEME_DRAWER_URL}/api/canvas-draw/v1/canvas/duplicate', json={'id': scheme_id})
                                r_json = response.json()
                                if 'id' in r_json:
                                    new_scheme_id = r_json['id']
                                setattr(new_exs, key, new_scheme_id)
                            else:
                                setattr(new_exs, key, c_exs.values()[0][key])
                    new_exs.folder = found_folder[0]
                    new_exs.clone_nfb_id = exs_id
                    try:
                        new_exs.save()
                        res_data['ids'].append(new_exs.id)
                        success_status = True
                    except Exception as e:
                        res_data['ids'].append(new_exs.id)
                        res_data['err'].append(str(e))
                    exs_params = UserExerciseParamTeam.objects.filter(exercise_nfb=exs_id)
                    if exs_params.exists() and exs_params[0].id != None and success_status:
                        if found_team and found_team.exists() and found_team[0].id != None:
                            new_exs_params = None
                            if request.user.club_id is not None:
                                new_exs_params = UserExerciseParamTeam(exercise_club=new_exs, team_club=found_team[0])
                            else:
                                new_exs_params = UserExerciseParamTeam(exercise_user=new_exs, team=found_team[0])
                            for key in exs_params.values()[0]:
                                if key != "id" and key != "exercise_user_id" and key != "exercise_club_id" and key != "exercise_nfb_id" and key != "team_id":
                                    setattr(new_exs_params, key, exs_params.values()[0][key])
                            try:
                                new_exs_params.save()
                                res_data['exs_params'].append(new_exs_params.id)
                                success_status = True
                            except Exception as e:
                                success_status = False
                                res_data['ids'].append(new_exs.id)
                                res_data['err'].append(str(e))
            elif folder_type == utils.FOLDER_TEAM:
                c_exs = None
                if request.user.club_id is not None:
                    c_exs = ClubExercise.objects.filter(id=exs_id, team=found_team[0], club=request.user.club_id)
                else:
                    c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
                if c_exs.exists() and c_exs[0].id != None:
                    new_exs = None
                    if request.user.club_id is not None:
                        new_exs = ClubExercise(user=cur_user, club=request.user.club_id, team=found_team[0])
                    else:
                        new_exs = UserExercise(user=cur_user)
                    for key in c_exs.values()[0]:
                        if key != "id" and key != "date_creation":
                            if key == "scheme_1" or key == "scheme_2":
                                new_scheme_id = ""
                                scheme_id = c_exs.values()[0][key]
                                response = requests.post(f'{NEW_SCHEME_DRAWER_URL}/api/canvas-draw/v1/canvas/duplicate', json={'id': scheme_id})
                                r_json = response.json()
                                if 'id' in r_json:
                                    new_scheme_id = r_json['id']
                                setattr(new_exs, key, new_scheme_id)
                            else:
                                setattr(new_exs, key, c_exs.values()[0][key])
                    new_exs.folder = found_folder[0]
                    try:
                        new_exs.save()
                        res_data['ids'].append(new_exs.id)
                        success_status = True
                    except Exception as e:
                        res_data['ids'].append(new_exs.id)
                        res_data['err'].append(str(e))
            elif folder_type == utils.FOLDER_CLUB:
                pass
            elif folder_type == utils.FOLDER_TRAINER:
                last_name = cur_user.personal.last_name.lower().replace(' ', '')
                c_exs = TrainerExercise.objects.filter(user_name=last_name, user_birthdate=cur_user.personal.date_birthsday, id=exs_id)
                if c_exs.exists() and c_exs[0].id != None:
                    if request.user.club_id is not None:
                        new_exs = ClubExercise(user=cur_user, club=request.user.club_id, team=found_team[0])
                    else:
                        new_exs = UserExercise(user=cur_user)
                    for key in c_exs.values()[0]:
                        if key != "id" and key != "date_creation":
                            if key == "scheme_1" or key == "scheme_2":
                                new_scheme_id = ""
                                scheme_id = c_exs.values()[0][key]
                                response = requests.post(f'{NEW_SCHEME_DRAWER_URL}/api/canvas-draw/v1/canvas/duplicate', json={'id': scheme_id})
                                r_json = response.json()
                                if 'id' in r_json:
                                    new_scheme_id = r_json['id']
                                setattr(new_exs, key, new_scheme_id)
                            else:
                                setattr(new_exs, key, c_exs.values()[0][key])
                    new_exs.folder = found_folder[0]
                    new_exs.clone_nfb_id = exs_id
                    try:
                        new_exs.save()
                        res_data['ids'].append(new_exs.id)
                        success_status = True
                    except Exception as e:
                        res_data['ids'].append(new_exs.id)
                        res_data['err'].append(str(e))
        elif is_to_trainer:
            c_exs = None
            if request.user.club_id is not None:
                c_exs = ClubExercise.objects.filter(id=exs_id, team=found_team[0], club=request.user.club_id)
            else:
                c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
            if c_exs.exists() and c_exs[0].id != None:
                last_name = cur_user.personal.last_name.lower().replace(' ', '')
                new_exs = TrainerExercise(user_name=last_name, user_birthdate=cur_user.personal.date_birthsday)
                for key in c_exs.values()[0]:
                    if key == "id":
                        setattr(new_exs, 'exs_ref', c_exs.values()[0][key])
                    if key != "id" and key != "date_creation":
                        if key == "scheme_1" or key == "scheme_2":
                            new_scheme_id = ""
                            scheme_id = c_exs.values()[0][key]
                            response = requests.post(f'{NEW_SCHEME_DRAWER_URL}/api/canvas-draw/v1/canvas/duplicate', json={'id': scheme_id})
                            r_json = response.json()
                            if 'id' in r_json:
                                new_scheme_id = r_json['id']
                            setattr(new_exs, key, new_scheme_id)
                        else:
                            setattr(new_exs, key, c_exs.values()[0][key])
                try:
                    new_exs.save()
                    res_data['ids'].append(new_exs.id)
                    success_status = True
                except Exception as e:
                    res_data['ids'].append(new_exs.id)
                    res_data['err'].append(str(e))
        if c_exs and new_exs:
            try:
                videos = []
                if folder_type == utils.FOLDER_NFB:
                    videos = c_exs[0].videos.through.objects.filter(exercise_nfb=c_exs[0])
                elif folder_type == utils.FOLDER_TEAM:
                    if request.user.club_id is not None:
                        videos = c_exs[0].videos.through.objects.filter(exercise_club=c_exs[0])
                    else:
                        videos = c_exs[0].videos.through.objects.filter(exercise_user=c_exs[0])
                elif folder_type == utils.FOLDER_CLUB:
                    videos = c_exs[0].videos.through.objects.filter(exercise_club=c_exs[0])
                elif folder_type == utils.FOLDER_TRAINER:
                    videos = c_exs[0].videos.through.objects.filter(exercise_trainer=c_exs[0])
                for video in videos:
                    if video.type == 1 or video.type == 3:
                        if is_to_trainer:
                            new_exs.videos.through.objects.update_or_create(type=video.type, exercise_trainer=new_exs, defaults={"video": video.video})
                        else:
                            if request.user.club_id is not None:
                                new_exs.videos.through.objects.update_or_create(type=video.type, exercise_club=new_exs, defaults={"video": video.video})
                            else:
                                new_exs.videos.through.objects.update_or_create(type=video.type, exercise_user=new_exs, defaults={"video": video.video})
                res_data['videos'].append("OK")
            except Exception as e:
                res_data['err'].append(str(e))
    return JsonResponse({"data": res_data, "success": success_status}, status=200)
    

def POST_move_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Moving exercise". This works only for TEAM exercises.
    User can't move exercise from NFB folder to another.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    exs_ids = []
    folder_id = -1
    folder_type = request.POST.get("type", "")
    move_move = request.POST.get("move_mode", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        exs_ids = request.POST.getlist("exs[]", [])
    except:
        pass
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    found_folder = None
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userexercise"], 
        'perms_club': ["exercises.change_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        found_folder = ClubFolder.objects.filter(id=folder_id, club=request.user.club_id)
    else:
        found_folder = UserFolder.objects.filter(id=folder_id, user=cur_user)
    if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
        found_folder = AdminFolder.objects.filter(id=folder_id)
    if found_folder.exists() and found_folder[0].id != None:
        if move_move == "all":
            saved_ids = []
            is_success = False
            for elem in exs_ids:
                exs_id = -1
                try:
                    exs_id = int(elem)
                except:
                    pass
                found_exs = None
                if request.user.club_id is not None:
                    found_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=cur_team)
                else:
                    found_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
                if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
                    found_exs = AdminExercise.objects.filter(id=exs_id)
                if found_exs and found_exs.exists() and found_exs[0].id != None:
                    found_exs = found_exs[0]
                    found_exs.folder = found_folder[0]
                    try:
                        found_exs.save()
                        saved_ids.append(found_exs.id)
                        is_success = True
                    except:
                        pass
            return JsonResponse({"data": {"id": saved_ids}, "success": is_success}, status=200)
        else:
            found_exs = None
            if request.user.club_id is not None:
                found_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=cur_team)
            else:
                found_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
            if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
                found_exs = AdminExercise.objects.filter(id=exs_id)
            if found_exs and found_exs.exists() and found_exs[0].id != None:
                found_exs = found_exs[0]
                found_exs.folder = found_folder[0]
                try:
                    found_exs.save()
                    return JsonResponse({"data": {"id": found_exs.id}, "success": True}, status=200)
                except:
                    pass
    return JsonResponse({"errors": "Can't move exercise"}, status=400)


def POST_edit_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit exercise". Editing exercise's object, UserExerciseParamTeam's object.
    Only user with adminstrator status can edit NFB exercises.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    folder_id = -1
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        folder_id = int(request.POST.get("data[folder_main]", -1))
    except:
        pass
    c_exs = None
    access_denied = False
    copied_from_nfb = False
    found_team = None
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if folder_type == utils.FOLDER_TEAM:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
            'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = None
        if request.user.club_id is not None:
            c_folder = ClubFolder.objects.filter(id=folder_id, club=request.user.club_id)
        else:
            c_folder = UserFolder.objects.filter(id=folder_id, user=cur_user)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = None
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=found_team[0])
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
        if not c_exs.exists() or c_exs[0].id == None:
            if request.user.club_id is not None:
                c_exs = ClubExercise(user=cur_user, folder=c_folder[0], club=request.user.club_id, team=found_team[0])
            else:
                c_exs = UserExercise(user=cur_user, folder=c_folder[0])
            try:
                c_exs.save()
            except Exception as e:
                return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
        else:
            c_exs = c_exs[0]
            if c_exs.folder != c_folder[0]:
                c_exs.date_editing_folder = datetime.datetime.now()
            c_exs.folder = c_folder[0]
            copied_from_nfb = c_exs.clone_nfb_id != None
    elif folder_type == utils.FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_adminexercise", "exercises.add_adminexercise"], 
            'perms_club': ["exercises.change_adminexercise", "exercises.add_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = AdminFolder.objects.filter(id=folder_id, visible=True)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id)
        if not c_exs.exists() or c_exs[0].id == None:
            c_exs = AdminExercise(folder=c_folder[0])
            try:
                c_exs.save()
            except Exception as e:
                return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
        else:
            c_exs = c_exs[0]
            if c_exs.folder != c_folder[0]:
                c_exs.date_editing_folder = datetime.datetime.now()
            c_exs.folder = c_folder[0]
    elif folder_type == utils.FOLDER_CLUB:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if access_denied:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        pass
    if c_exs == None:
        return JsonResponse({"err": "Exercise not found.", "success": False}, status=400)
    
    is_can_edit_full = True
    nfb_id = -1
    try:
        nfb_id = int(c_exs.clone_nfb_id)
    except:
        pass
    found_admin_exercise = AdminExercise.objects.filter(id=nfb_id).first()
    is_can_edit_full = found_admin_exercise == None
    
    c_exs.title = utils.set_by_language_code(c_exs.title, request.LANGUAGE_CODE, request.POST.get("data[title]", ""))
    c_exs.ref_goal = set_value_as_ref(request, "data[ref_goal]", None)
    c_exs.ref_ball = set_value_as_ref(request, "data[ref_ball]", None)
    c_exs.ref_team_category = set_value_as_ref(request, "data[ref_team_category]", None)
    c_exs.ref_age_category = set_value_as_ref(request, "data[ref_age_category]", None)
    c_exs.ref_train_part = set_value_as_ref(request, "data[ref_train_part]", None)
    c_exs.ref_cognitive_load = set_value_as_ref(request, "data[ref_cognitive_load]", None)
    c_exs.ref_stress_type = set_value_as_ref(request, "data[ref_stress_type]", None)
    c_exs.field_players = utils.set_by_language_code(c_exs.field_players, request.LANGUAGE_CODE, request.POST.get("data[field_players]", ""))
    c_exs.field_goal = utils.set_by_language_code(c_exs.field_goal, request.LANGUAGE_CODE, request.POST.get("data[field_goal]", ""))
    c_exs.field_goalkeeper = utils.set_by_language_code(c_exs.field_goalkeeper, request.LANGUAGE_CODE, request.POST.get("data[field_goalkeeper]", ""))
    c_exs.field_age = utils.set_by_language_code(c_exs.field_age, request.LANGUAGE_CODE, request.POST.get("data[field_age]", ""))
    c_exs.field_task = utils.set_by_language_code(c_exs.field_task, request.LANGUAGE_CODE, request.POST.get("data[field_task]", ""))
    c_exs.description = utils.set_by_language_code(c_exs.description, request.LANGUAGE_CODE, request.POST.get("data[description]", ""))
    c_exs.description_trainer = utils.set_by_language_code(c_exs.description_trainer, request.LANGUAGE_CODE, request.POST.get("data[description_trainer]", ""))
    if cur_user.is_superuser:
        description_template = ExsDescriptionTemplate.objects.filter().first()
        if not description_template:
            description_template = ExsDescriptionTemplate()
        description_template.description = utils.set_by_language_code(description_template.description, request.LANGUAGE_CODE, request.POST.get("data[description_template]", ""))
        description_template.save()

    c_exs.date_editing = datetime.datetime.now()
    c_exs.field_age_a = utils.set_value_as_int(request, "data[field_age_a]", None)
    c_exs.field_age_b = utils.set_value_as_int(request, "data[field_age_b]", None)
    c_exs.field_players_a = utils.set_value_as_int(request, "data[field_players_a]", None)
    c_exs.field_players_b = utils.set_value_as_int(request, "data[field_players_b]", None)
    c_exs.field_keyword_a = request.POST.get("data[field_keyword_a]", None)
    c_exs.field_keyword_b = request.POST.get("data[field_keyword_b]", None)
    field_keywords = utils.set_value_as_list(request, "data[field_keywords]", "data[field_keywords][]", [])
    c_exs.field_keywords = field_keywords
    c_exs.field_exs_category_a = request.POST.get("data[field_exs_category_a]", None)
    c_exs.field_exs_category_b = request.POST.get("data[field_exs_category_b]", None)
    field_categories = utils.set_value_as_list(request, "data[field_categories]", "data[field_categories][]", [])
    c_exs.field_categories = field_categories
    field_types = utils.set_value_as_list(request, "data[field_types]", "data[field_types][]", [])
    c_exs.field_types = field_types
    field_physical_qualities = utils.set_value_as_list(request, "data[field_physical_qualities]", "data[field_physical_qualities][]", [])
    c_exs.field_physical_qualities = field_physical_qualities
    field_cognitive_loads = utils.set_value_as_list(request, "data[field_cognitive_loads]", "data[field_cognitive_loads][]", [])
    c_exs.field_cognitive_loads = field_cognitive_loads
    field_fields = utils.set_value_as_list(request, "data[field_fields]", "data[field_fields][]", [])
    c_exs.field_fields = field_fields

    if is_can_edit_full:
        video_links_links = utils.set_value_as_list(request, "data[video_links_link[]]", "data[video_links_link[]][]", [])
        video_links_names = utils.set_value_as_list(request, "data[video_links_name[]]", "data[video_links_name[]][]", [])
        video_links_notes = utils.set_value_as_list(request, "data[video_links_note[]]", "data[video_links_note[]][]", [])
        if len(video_links_links) == 2:
            video_links = []
            for _i in range(len(video_links_links)):
                video_links.append({
                    'link': video_links_links[_i],
                    'name': video_links_names[_i],
                    'note': video_links_notes[_i]
                })
                pass
            c_exs.video_links = video_links

        video1_id = -1
        video2_id = -1
        animation1_id = -1
        animation2_id = -1
        if not copied_from_nfb:
            c_exs.scheme_1 = request.POST.get("data[scheme_1]", None)
            c_exs.scheme_2 = request.POST.get("data[scheme_2]", None)
            if type(c_exs.scheme_data) is dict:
                c_exs.scheme_data['scheme_1'] = request.POST.get("data[scheme_1_old]")
                c_exs.scheme_data['scheme_2'] = request.POST.get("data[scheme_2_old]")
            else:
                c_exs.scheme_data = {
                    'scheme_1': request.POST.get("data[scheme_1_old]"),
                    'scheme_2': request.POST.get("data[scheme_2_old]")
                }   
            video1_id = int(request.POST.get("data[video_1]")) if request.POST.get("data[video_1]").isdigit() else -1
            # video2_id = int(request.POST.get("data[video_2]")) if request.POST.get("data[video_2]").isdigit() else -1
            if type(c_exs.video_data) is dict:
                c_exs.video_data['data'] = [video1_id, video2_id]
            else:
                c_exs.video_data = {'data': [video1_id, video2_id]}
            animation1_id = int(request.POST.get("data[animation_1]")) if request.POST.get("data[animation_1]").isdigit() else -1
            # animation2_id = int(request.POST.get("data[animation_2]")) if request.POST.get("data[animation_2]").isdigit() else -1
            if type(c_exs.animation_data) is dict:
                c_exs.animation_data['data']['default'] = [animation1_id, animation2_id]
            else:
                c_exs.animation_data = {'data': {'custom': "", 'default': [animation1_id, animation2_id]}}
      
    c_exs.tags.clear()
    tags_arr = utils.set_value_as_list(request, "data[tags]", "data[tags][]", [])
    for c_tag in tags_arr:
        c_tag_lower = c_tag.lower()
        f_tag = None
        try:
            if folder_type == utils.FOLDER_TEAM and request.user.club_id is None:
                f_tag = ExerciseTag.objects.filter(
                    Q(is_nfb=True, lowercase_name=c_tag_lower) | Q(is_nfb=False, user=cur_user, lowercase_name=c_tag_lower)
                )
                if f_tag.exists() and f_tag[0].id != None:
                    f_tag = f_tag[0]
                else:
                    f_tag = ExerciseTag(is_nfb=False, user=cur_user, name=c_tag, lowercase_name=c_tag_lower)
                    f_tag.save()
            elif folder_type == utils.FOLDER_NFB:
                f_tag = ExerciseTag.objects.filter(is_nfb=True, lowercase_name=c_tag_lower)
                if f_tag.exists() and f_tag[0].id != None:
                    f_tag = f_tag[0]
                else:
                    f_tag = ExerciseTag(is_nfb=True, name=c_tag, lowercase_name=c_tag_lower)
                    f_tag.save()
            elif folder_type == utils.FOLDER_CLUB or folder_type == utils.FOLDER_TEAM and request.user.club_id is not None:
                f_tag = ExerciseTag.objects.filter(
                    Q(is_nfb=True, lowercase_name=c_tag_lower) | Q(is_nfb=False, club=request.user.club_id, lowercase_name=c_tag_lower)
                )
                if f_tag.exists() and f_tag[0].id != None:
                    f_tag = f_tag[0]
                else:
                    f_tag = ExerciseTag(is_nfb=False, club=request.user.club_id, name=c_tag, lowercase_name=c_tag_lower)
                    f_tag.save()
        except:
            pass
        if f_tag is not None:
            c_exs.tags.add(f_tag)
    c_exs = set_exs_additional_params(request, c_exs, folder_type)
    try:
        c_exs.save()
        res_data = f'Exs with id: [{c_exs.id}] is added / edited successfully.'
    except Exception as e:
        print(e)
        return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
    
    if is_can_edit_full:
        video1_obj = check_video(video1_id)
        video2_obj = check_video(video2_id)
        animation1_obj = check_video(animation1_id)
        animation2_obj = check_video(animation2_id)
        try:
            if folder_type == utils.FOLDER_TEAM and request.user.club_id is None:
                c_exs.videos.through.objects.update_or_create(type=1, exercise_user=c_exs, defaults={"video": video1_obj})
                # c_exs.videos.through.objects.update_or_create(type=2, exercise_user=c_exs, defaults={"video": video2_obj})
                c_exs.videos.through.objects.update_or_create(type=3, exercise_user=c_exs, defaults={"video": animation1_obj})
                # c_exs.videos.through.objects.update_or_create(type=4, exercise_user=c_exs, defaults={"video": animation2_obj})
            elif folder_type == utils.FOLDER_NFB:
                c_exs.videos.through.objects.update_or_create(type=1, exercise_nfb=c_exs, defaults={"video": video1_obj})
                # c_exs.videos.through.objects.update_or_create(type=2, exercise_nfb=c_exs, defaults={"video": video2_obj})
                c_exs.videos.through.objects.update_or_create(type=3, exercise_nfb=c_exs, defaults={"video": animation1_obj})
                # c_exs.videos.through.objects.update_or_create(type=4, exercise_nfb=c_exs, defaults={"video": animation2_obj})
            elif folder_type == utils.FOLDER_CLUB or folder_type == utils.FOLDER_TEAM and request.user.club_id is not None:
                c_exs.videos.through.objects.update_or_create(type=1, exercise_club=c_exs, defaults={"video": video1_obj})
                # c_exs.videos.through.objects.update_or_create(type=2, exercise_club=c_exs, defaults={"video": video2_obj})
                c_exs.videos.through.objects.update_or_create(type=3, exercise_club=c_exs, defaults={"video": animation1_obj})
                # c_exs.videos.through.objects.update_or_create(type=4, exercise_club=c_exs, defaults={"video": animation2_obj})
        except Exception as e:
            print(e)
            res_data += f'Cant add link to <ExerciseVideo>.'

    if is_can_edit_full:
        if folder_type == utils.FOLDER_TEAM:
            if found_team.exists() and found_team[0].id != None:
                c_exs_team_params = None
                if request.user.club_id is not None:
                    c_exs_team_params = UserExerciseParamTeam.objects.filter(team_club=found_team[0], exercise_club=c_exs)
                else:
                    c_exs_team_params = UserExerciseParamTeam.objects.filter(team=found_team[0], exercise_user=c_exs)
                if not c_exs_team_params.exists() or c_exs_team_params[0].id == None:
                    if request.user.club_id is not None:
                        c_exs_team_params = UserExerciseParamTeam(team_club=found_team[0], exercise_club=c_exs)
                    else:
                        c_exs_team_params = UserExerciseParamTeam(team=found_team[0], exercise_user=c_exs)
                else:
                    c_exs_team_params = c_exs_team_params[0]
                c_exs_team_params.additional_data = utils.set_as_object(request, c_exs_team_params.additional_data, "additional_data", request.LANGUAGE_CODE)
                c_exs_team_params.keyword = utils.set_as_object(request, c_exs_team_params.keyword, "keyword", request.LANGUAGE_CODE)
                c_exs_team_params.stress_type = utils.set_as_object(request, c_exs_team_params.stress_type, "stress_type", request.LANGUAGE_CODE)
                c_exs_team_params.purpose = utils.set_as_object(request, c_exs_team_params.purpose, "purposes", request.LANGUAGE_CODE)
                c_exs_team_params.coaching = utils.set_as_object(request, c_exs_team_params.coaching, "coaching", request.LANGUAGE_CODE)
                c_exs_team_params.note = utils.set_as_object(request, c_exs_team_params.note, "notes", request.LANGUAGE_CODE)
                try:
                    c_exs_team_params.save()
                    res_data += '\nAdded team params for exs.'
                except:
                    res_data += '\nCant add team params for exs.'
        elif folder_type == utils.FOLDER_NFB:
            c_exs_team_params = UserExerciseParamTeam.objects.filter(exercise_nfb=c_exs)
            if not c_exs_team_params.exists() or c_exs_team_params[0].id == None:
                c_exs_team_params = UserExerciseParamTeam(exercise_nfb=c_exs)
            else:
                c_exs_team_params = c_exs_team_params[0]
            c_exs_team_params.additional_data = utils.set_as_object(request, c_exs_team_params.additional_data, "additional_data", request.LANGUAGE_CODE)
            c_exs_team_params.keyword = utils.set_as_object(request, c_exs_team_params.keyword, "keyword", request.LANGUAGE_CODE)
            c_exs_team_params.stress_type = utils.set_as_object(request, c_exs_team_params.stress_type, "stress_type", request.LANGUAGE_CODE)
            c_exs_team_params.purpose = utils.set_as_object(request, c_exs_team_params.purpose, "purposes", request.LANGUAGE_CODE)
            c_exs_team_params.coaching = utils.set_as_object(request, c_exs_team_params.coaching, "coaching", request.LANGUAGE_CODE)
            c_exs_team_params.note = utils.set_as_object(request, c_exs_team_params.note, "notes", request.LANGUAGE_CODE)
            try:
                c_exs_team_params.save()
                res_data += '\nAdded team params for exs.'
            except:
                res_data += '\nCant add team params for exs.'
        elif folder_type == utils.FOLDER_CLUB:
            pass
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_exs_custom(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit exercise custom using description or card". Editing exercise's object, UserExerciseParamTeam's object.
    Only user with adminstrator status can edit NFB exercises.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    folder_id = -1
    folder_type = request.POST.get("type", "")
    edit_mode = request.POST.get("mode", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        folder_id = int(request.POST.get("data[folder_main]", -1))
    except:
        pass
    c_exs = None
    access_denied = False
    copied_from_nfb = False
    found_team = None
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if folder_type == utils.FOLDER_TEAM:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
            'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = None
        if request.user.club_id is not None:
            c_folder = ClubFolder.objects.filter(id=folder_id, club=request.user.club_id)
        else:
            c_folder = UserFolder.objects.filter(id=folder_id, user=cur_user)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = None
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=found_team[0])
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
        if not c_exs.exists() or c_exs[0].id == None:
            if request.user.club_id is not None:
                c_exs = ClubExercise(user=cur_user, folder=c_folder[0], club=request.user.club_id, team=found_team[0])
            else:
                c_exs = UserExercise(user=cur_user, folder=c_folder[0])
            try:
                c_exs.save()
            except Exception as e:
                return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
        else:
            c_exs = c_exs[0]
            if c_exs.folder != c_folder[0]:
                c_exs.date_editing_folder = datetime.datetime.now()
            c_exs.folder = c_folder[0]
            copied_from_nfb = c_exs.clone_nfb_id != None
    elif folder_type == utils.FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_adminexercise", "exercises.add_adminexercise"], 
            'perms_club': ["exercises.change_adminexercise", "exercises.add_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = AdminFolder.objects.filter(id=folder_id, visible=True)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id)
        if not c_exs.exists() or c_exs[0].id == None:
            c_exs = AdminExercise(folder=c_folder[0])
            try:
                c_exs.save()
            except Exception as e:
                return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
        else:
            c_exs = c_exs[0]
            if c_exs.folder != c_folder[0]:
                c_exs.date_editing_folder = datetime.datetime.now()
            c_exs.folder = c_folder[0]
    elif folder_type == utils.FOLDER_CLUB:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if access_denied:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        pass
    if c_exs == None:
        return JsonResponse({"err": "Exercise not found.", "success": False}, status=400)
    
    is_can_edit_full = True
    nfb_id = -1
    try:
        nfb_id = int(c_exs.clone_nfb_id)
    except:
        pass
    found_admin_exercise = AdminExercise.objects.filter(id=nfb_id).first()
    is_can_edit_full = found_admin_exercise == None
    
    if edit_mode == "card":
        c_exs.title = utils.set_by_language_code(c_exs.title, request.LANGUAGE_CODE, request.POST.get("data[title]", ""))
        c_exs.field_task = utils.set_by_language_code(c_exs.field_task, request.LANGUAGE_CODE, request.POST.get("data[field_task]", ""))
        c_exs.field_age_a = utils.set_value_as_int(request, "data[field_age_a]", None)
        c_exs.field_age_b = utils.set_value_as_int(request, "data[field_age_b]", None)
        c_exs.field_players_a = utils.set_value_as_int(request, "data[field_players_a]", None)
        c_exs.field_players_b = utils.set_value_as_int(request, "data[field_players_b]", None)
        c_exs.field_keyword_a = request.POST.get("data[field_keyword_a]", None)
        c_exs.field_keyword_b = request.POST.get("data[field_keyword_b]", None)
        c_exs.ref_ball = set_value_as_ref(request, "data[ref_ball]", None)
        c_exs.field_goal = utils.set_by_language_code(c_exs.field_goal, request.LANGUAGE_CODE, request.POST.get("data[field_goal]", ""))
        c_exs.field_goalkeeper = utils.set_by_language_code(c_exs.field_goalkeeper, request.LANGUAGE_CODE, request.POST.get("data[field_goalkeeper]", ""))
        field_categories = utils.set_value_as_list(request, "data[field_categories]", "data[field_categories][]", [])
        c_exs.field_categories = field_categories
        field_types = utils.set_value_as_list(request, "data[field_types]", "data[field_types][]", [])
        c_exs.field_types = field_types
        field_physical_qualities = utils.set_value_as_list(request, "data[field_physical_qualities]", "data[field_physical_qualities][]", [])
        c_exs.field_physical_qualities = field_physical_qualities
        field_cognitive_loads = utils.set_value_as_list(request, "data[field_cognitive_loads]", "data[field_cognitive_loads][]", [])
        c_exs.field_cognitive_loads = field_cognitive_loads
        field_fields = utils.set_value_as_list(request, "data[field_fields]", "data[field_fields][]", [])
        c_exs.field_fields = field_fields

        c_exs.tags.clear()
        tags_arr = utils.set_value_as_list(request, "data[tags]", "data[tags][]", [])
        for c_tag in tags_arr:
            c_tag_lower = c_tag.lower()
            f_tag = None
            try:
                if folder_type == utils.FOLDER_TEAM and request.user.club_id is None:
                    f_tag = ExerciseTag.objects.filter(
                        Q(is_nfb=True, lowercase_name=c_tag_lower) | Q(is_nfb=False, user=cur_user, lowercase_name=c_tag_lower)
                    )
                    if f_tag.exists() and f_tag[0].id != None:
                        f_tag = f_tag[0]
                    else:
                        f_tag = ExerciseTag(is_nfb=False, user=cur_user, name=c_tag, lowercase_name=c_tag_lower)
                        f_tag.save()
                elif folder_type == utils.FOLDER_NFB:
                    f_tag = ExerciseTag.objects.filter(is_nfb=True, lowercase_name=c_tag_lower)
                    if f_tag.exists() and f_tag[0].id != None:
                        f_tag = f_tag[0]
                    else:
                        f_tag = ExerciseTag(is_nfb=True, name=c_tag, lowercase_name=c_tag_lower)
                        f_tag.save()
                elif folder_type == utils.FOLDER_CLUB or folder_type == utils.FOLDER_TEAM and request.user.club_id is not None:
                    f_tag = ExerciseTag.objects.filter(
                        Q(is_nfb=True, lowercase_name=c_tag_lower) | Q(is_nfb=False, club=request.user.club_id, lowercase_name=c_tag_lower)
                    )
                    if f_tag.exists() and f_tag[0].id != None:
                        f_tag = f_tag[0]
                    else:
                        f_tag = ExerciseTag(is_nfb=False, club=request.user.club_id, name=c_tag, lowercase_name=c_tag_lower)
                        f_tag.save()
            except:
                pass
            if f_tag is not None:
                c_exs.tags.add(f_tag)
    elif edit_mode == "description":
        c_exs.description = utils.set_by_language_code(c_exs.description, request.LANGUAGE_CODE, request.POST.get("data[description]", ""))
        c_exs.description_trainer = utils.set_by_language_code(c_exs.description_trainer, request.LANGUAGE_CODE, request.POST.get("data[description_trainer]", ""))

    c_exs.date_editing = datetime.datetime.now()
    res_data = ""
    try:
        c_exs.save()
        res_data = f'Exs with id: [{c_exs.id}] is edited successfully. Mode: {edit_mode}'
    except Exception as e:
        print(e)
        return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Delete exercise".
    Only user with adminstrator status can delete NFB exercises.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    exs_ids = []
    delete_type = 0
    delete_type_access = False
    folder_type = request.POST.get("type", "")
    is_multi_exs = request.POST.get("multi_exs", "false")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        exs_ids = request.POST.getlist("exs[]", [])
    except:
        pass
    try:
        delete_type = int(request.POST.get("delete_type", -1)) # delete only exercise, only video in it, or both
    except:
        pass
    if not is_multi_exs == "true":
        exs_ids = [exs_id]
    deleted_exs = []
    for exs_id in exs_ids:
        try:
            exs_id = int(exs_id)
        except:
            exs_id = -1
        c_exs = None
        f_exs_in_training = None
        if folder_type == utils.FOLDER_TEAM:
            if not util_check_access(cur_user, {
                'perms_user': ["exercises.delete_userexercise"], 
                'perms_club': ["exercises.delete_clubexercise"]
            }):
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            if request.user.club_id is not None:
                c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=cur_team)
                if c_exs.exists() and c_exs[0].id != None:
                    f_exs_in_training = ClubTraining.objects.filter(event_id__club_id=request.user.club_id, exercises__in=c_exs)
            else:
                c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
                if c_exs.exists() and c_exs[0].id != None:
                    f_exs_in_training = UserTraining.objects.filter(event_id__user_id=cur_user, exercises__in=c_exs)
        elif folder_type == utils.FOLDER_NFB:
            if not util_check_access(cur_user, {
                'perms_user': ["exercises.delete_adminexercise"], 
                'perms_club': ["exercises.delete_adminexercise"]
            }):
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            delete_type_access = True
            c_exs = AdminExercise.objects.filter(id=exs_id)
        elif folder_type == utils.FOLDER_CLUB:
            pass
        elif folder_type == utils.FOLDER_TRAINER:
            if not util_check_access(cur_user, {
                'perms_user': ["exercises.delete_userexercise"], 
                'perms_club': ["exercises.delete_clubexercise"]
            }):
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            last_name = cur_user.personal.last_name.lower().replace(' ', '')
            c_exs = TrainerExercise.objects.filter(id=exs_id, user_name=last_name, user_birthdate=cur_user.personal.date_birthsday)
        if c_exs == None or not c_exs.exists() or c_exs[0].id == None:
            return JsonResponse({"errors": "access_error"}, status=400)
        else:
            if f_exs_in_training != None and f_exs_in_training.exists() and f_exs_in_training[0].event_id != None:
                return JsonResponse({"errors": "access_error", "in_training": True}, status=400)
            try:
                if not delete_type_access:
                    c_exs.delete()
                else:
                    if delete_type == 0:
                        c_exs.delete()
                    elif delete_type > 0 and delete_type < 5:
                        exs_videos = c_exs[0].videos.through.objects.filter(exercise_nfb=c_exs[0], type=delete_type)
                        for video in exs_videos:
                            if video.video is not None:
                                ready_to_delete = delete_video_obj_nf(video.video)
                                if ready_to_delete:
                                    video.video.delete()
                    elif delete_type == 5:
                        exs_videos = c_exs[0].videos.through.objects.filter(exercise_nfb=c_exs[0])
                        for video in exs_videos:
                            if video.video is not None:
                                ready_to_delete = delete_video_obj_nf(video.video)
                                if ready_to_delete:
                                    video.video.delete()
                        c_exs.delete()
                deleted_exs.append(exs_id)
            except Exception as e:
                print(e)
                return JsonResponse({"errors": "Can't delete exercise"}, status=400)
    return JsonResponse({"data": {"ids": deleted_exs}, "success": True}, status=200)


def POST_edit_exs_user_params(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit exercise's user parameteres".
    These parameteres are the user's notes on this or that exercise.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    post_key = request.POST.get("data[key]", "")
    post_value = 0
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        post_value = int(request.POST.get("data[value]", 0))
    except:
        pass
    c_exs = None
    if folder_type == utils.FOLDER_TEAM:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=cur_team)
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
    elif folder_type == utils.FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_adminexercise"], 
            'perms_club': ["exercises.view_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id)
    elif folder_type == utils.FOLDER_CLUB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id)
        else:
            pass
    if c_exs != None and c_exs.exists() and c_exs[0].id != None:
        c_exs_params = None
        if folder_type == utils.FOLDER_TEAM:
            if request.user.club_id is not None:
                c_exs_params = UserExerciseParam.objects.filter(exercise_club=c_exs[0], user=cur_user)
            else:
                c_exs_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0], user=cur_user)
        elif folder_type == utils.FOLDER_NFB:
            c_exs_params = UserExerciseParam.objects.filter(exercise_nfb=c_exs[0], user=cur_user)
        elif folder_type == utils.FOLDER_CLUB:
            c_exs_params = UserExerciseParam.objects.filter(exercise_club=c_exs[0], user=cur_user)
        if c_exs_params != None and c_exs_params.exists() and c_exs_params[0].id != None:
            c_exs_params = c_exs_params[0]
            if post_key == "like":
                c_exs_params.dislike = 0
                post_value = 1
            if post_key == "dislike":
                c_exs_params.like = 0
                post_value = 1
            if post_key == "watched":
                post_key = "video_1_watched"
            if post_key == "favorite":
                c_exs = c_exs[0]
                for video in c_exs.videos.all():
                    video.favourites = post_value
                    try:
                        video.save()
                    except:
                        pass
            setattr(c_exs_params, post_key, post_value)
            try:
                c_exs_params.save()
                return JsonResponse({"data": {"id": exs_id, "value": post_value}, "success": True}, status=200)
            except:
                pass
        else:
            new_params = None
            if folder_type == utils.FOLDER_TEAM:
                if request.user.club_id is not None:
                    new_params = UserExerciseParam(exercise_club=c_exs[0], user=cur_user)
                else:
                    new_params = UserExerciseParam(exercise_user=c_exs[0], user=cur_user)
            elif folder_type == utils.FOLDER_NFB:
                new_params = UserExerciseParam(exercise_nfb=c_exs[0], user=cur_user)
            elif folder_type == utils.FOLDER_CLUB:
                new_params = UserExerciseParam(exercise_club=c_exs[0], user=cur_user)
            if post_key == "like":
                c_exs_params.dislike = 0
                post_value = 1
            if post_key == "dislike":
                c_exs_params.like = 0
                post_value = 1
            if post_key == "watched":
                post_key = "video_1_watched"
            if post_key == "favorite":
                c_exs = c_exs[0]
                for video in c_exs.videos.all():
                    video.favourites = post_value
                    try:
                        video.save()
                    except:
                        pass
            setattr(new_params, post_key, post_value)
            try:
                new_params.save()
                return JsonResponse({"data": {"id": exs_id, "value": post_value}, "success": True}, status=200)
            except:
                pass
    return JsonResponse({"errors": "Can't edit exs param"}, status=400)


def POST_count_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Count exercises in folder".
    Uses exercises.v_api.get_excerises_data(...)

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    folder_id = -1
    folder_type = ""
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    try:
        folder_type = request.POST.get("type", "")
    except:
        pass
    found_exercises = 0
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.view_userexercise"], 
        'perms_club': ["exercises.view_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    try:
        found_exercises = get_excerises_data(folder_id, folder_type, request, cur_user, cur_team, True, None).count()
        # found_exercises = len(get_excerises_data(folder_id, folder_type, request, cur_user, cur_team))
    except Exception as e:
        print(e)
        pass
    return JsonResponse({"data": found_exercises, "success": True}, status=200)


def POST_count_exs_in_tags_filter(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Count exercises in tags filter".
    Uses exercises.v_api.get_excerises_data(...)

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    tag = request.POST.get("tag", None)
    folder_id = -1
    folder_type = request.POST.get("type", "")
    exercise_id = -1
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    try:
        exercise_id = int(request.POST.get("exercise", -1))
    except:
        pass
    found_exercises = 0
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.view_userexercise"], 
        'perms_club': ["exercises.view_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    try:
        found_exercises = get_excerises_data(folder_id, folder_type, request, cur_user, cur_team, True, tag, exercise_id).count()
    except Exception as e:
        print(e)
        pass
    return JsonResponse({"data": found_exercises, "success": True}, status=200)


def POST_edit_exs_additional_param(request, cur_user):
    status = False
    disabled_status = True
    data = []
    mode = request.POST.get("mode", "")
    rowId = -1
    try:
        rowId = int(request.POST.get("row", -1))
    except:
        pass
    fieldValue = request.POST.get("field", None)
    visibleValue = request.POST.get("visible", None)
    foundRow = None
    if cur_user.is_superuser:
        foundRow = AdminExerciseAdditionalParams.objects.filter(id=rowId)
    else:
        if request.user.club_id is not None:
            foundRow = ClubExerciseAdditionalParams.objects.filter(id=rowId, club=request.user.club_id)
        else:
            foundRow = UserExerciseAdditionalParams.objects.filter(id=rowId, user=cur_user)
    if mode == "edit":
        if foundRow is not None and foundRow.exists() and foundRow[0].id != None:
            foundRow = foundRow[0]
            if cur_user.is_superuser:
                if not util_check_access(cur_user, {
                    'perms_user': ["exercises.change_adminexerciseadditionalparams"], 
                    'perms_club': ["exercises.change_adminexerciseadditionalparams"]
                }):
                    return JsonResponse({"err": "Access denied.", "success": False}, status=400)
                try:
                    if fieldValue != None:
                        foundRow.field = utils.set_by_language_code(foundRow.field, request.LANGUAGE_CODE, fieldValue, "")
                    if visibleValue != None:
                        visibleValue = True if visibleValue == "true" else False
                        foundRow.visible = visibleValue
                    foundRow.save()
                    status = True
                    disabled_status = False
                    data = get_exercises_additional_params(request, cur_user)
                    data = data['admin_params'] if cur_user.is_superuser else data['params']
                    data = [{'id': entry.id, 'field': entry.field, 'visible': entry.visible} for entry in data]
                except:
                    pass
            else:
                if not util_check_access(cur_user, {
                    'perms_user': ["exercises.change_userexerciseadditionalparams"], 
                    'perms_club': ["exercises.change_clubexerciseadditionalparams"]
                }):
                    return JsonResponse({"err": "Access denied.", "success": False}, status=400)
                if visibleValue != None:
                    try:
                        visibleValue = True if visibleValue == "true" else False
                        foundRow.visible = visibleValue
                        foundRow.save()
                        status = True
                        data = get_exercises_additional_params(request, cur_user)
                        data = data['admin_params'] if cur_user.is_superuser else data['params']
                        data = [{'id': entry.id, 'field': entry.field, 'visible': entry.visible} for entry in data]
                    except:
                        pass
        else:
            if not util_check_access(cur_user, {
                'perms_user': ["exercises.add_adminexerciseadditionalparams"], 
                'perms_club': ["exercises.add_adminexerciseadditionalparams"]
            }):
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            if cur_user.is_superuser:
                new_param = AdminExerciseAdditionalParams()
                try:
                    new_param.save()
                    status = True
                    mode = "add"
                    disabled_status = False
                    data = get_exercises_additional_params(request, cur_user)
                    data = data['admin_params'] if cur_user.is_superuser else data['params']
                    data = [{'id': entry.id, 'field': entry.field, 'visible': entry.visible} for entry in data]
                except:
                    pass
    elif mode == "delete":
        if foundRow is not None and foundRow.exists() and foundRow[0].id != None:
            foundRow = foundRow[0]
            if not util_check_access(cur_user, {
                'perms_user': ["exercises.delete_adminexerciseadditionalparams"], 
                'perms_club': ["exercises.delete_adminexerciseadditionalparams"]
            }):
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
            if cur_user.is_superuser:
                try:
                    foundRow.delete()
                    status = True
                    disabled_status = False
                    data = get_exercises_additional_params(request, cur_user)
                    data = data['admin_params'] if cur_user.is_superuser else data['params']
                    data = [{'id': entry.id, 'field': entry.field, 'visible': entry.visible} for entry in data]
                except:
                    pass
    else:
        return JsonResponse({"err": "Incorrect mode.", "success": False}, status=400) 
    return JsonResponse({"data": data, "success": status, "mode": mode, "disabled": disabled_status}, status=200)


def POST_change_order_exs_additional_param(request, cur_user):
    status = True
    disabled_status = True
    data = []
    ids_data = request.POST.getlist("ids_arr[]", [])
    ordering_data = request.POST.getlist("order_arr[]", [])
    logs_arr = []
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userexerciseadditionalparams"], 
        'perms_club': ["exercises.change_clubexerciseadditionalparams"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_param = None
        if cur_user.is_superuser:
            found_param = AdminExerciseAdditionalParams.objects.get(id=t_id)
        else:
            if request.user.club_id is not None:
                found_param = ClubExerciseAdditionalParams.objects.get(id=t_id, club=request.user.club_id)
            else:
                found_param = UserExerciseAdditionalParams.objects.get(id=t_id, user=cur_user)
        if found_param and found_param.id != None:
            found_param.order = t_order
            try:
                found_param.save()
                logs_arr.append(f'Folder [{found_param.id}] is order changed: {t_order}')
            except Exception as e:
                logs_arr.append(f'Folder [{found_param.id}] -> ERROR / Not access or another reason')
    data = get_exercises_additional_params(request, cur_user)
    data = data['admin_params'] if cur_user.is_superuser else data['params']
    data = [{'id': entry.id, 'field': entry.field, 'visible': entry.visible} for entry in data]
    return JsonResponse({"data": data, "success": status, "mode": "order", "disabled": disabled_status, "logs": logs_arr}, status=200)


def POST_edit_exs_tag_category(request, cur_user):
    status = False
    c_type = request.POST.get("type", "")
    c_id = -1
    delete_status = -1
    try:
        c_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        delete_status = int(request.POST.get("delete", -1))
    except:
        pass
    c_name = request.POST.get("name", "")
    c_color = request.POST.get("color", None)
    if c_type == "nfb":
        if cur_user.is_superuser:
            c_category = ExerciseTagCategory.objects.filter(id=c_id, is_nfb=True).first()
            if delete_status != 1:
                if c_category:
                    c_category.name = c_name
                    if c_color is not None:
                        c_category.color = c_color
                else:
                    c_category = ExerciseTagCategory(is_nfb=True)
                try:
                    c_category.save()
                    status = True
                except Exception as e:
                    pass
            else:
                if c_category:
                    try:
                        c_category.delete()
                        status = True
                    except Exception as e:
                        pass
    elif c_type == "self":
        c_category = None
        if request.user.club_id is not None:
            c_category = ExerciseTagCategory.objects.filter(id=c_id, is_nfb=False, club=request.user.club_id).first()
        else:
            c_category = ExerciseTagCategory.objects.filter(id=c_id, is_nfb=False, user=cur_user).first()
        if delete_status != 1:
            if c_category:
                c_category.name = c_name
                if c_color is not None:
                        c_category.color = c_color
            else:
                if request.user.club_id is not None:
                    c_category = ExerciseTagCategory(is_nfb=False, club=request.user.club_id)
                else:
                    c_category = ExerciseTagCategory(is_nfb=False, user=cur_user)
            try:
                c_category.save()
                status = True
            except Exception as e:
                pass
        else:
            if c_category:
                try:
                    c_category.delete()
                    status = True
                except Exception as e:
                    pass  
    return JsonResponse({"success": status, "type": c_type}, status=200)


def POST_change_order_exs_tag_category(request, cur_user):
    status = True
    ids_data = request.POST.getlist("ids_arr[]", [])
    ordering_data = request.POST.getlist("order_arr[]", [])
    c_type = request.POST.get("type", "")
    logs_arr = []
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_param = None
        if c_type == "nfb":
            if cur_user.is_superuser:
                found_param = ExerciseTagCategory.objects.filter(id=t_id, is_nfb=True).first()
        elif c_type == "self":
            if request.user.club_id is not None:
                found_param = ExerciseTagCategory.objects.filter(id=t_id, is_nfb=False, club=request.user.club_id).first()
            else:
                found_param = ExerciseTagCategory.objects.filter(id=t_id, is_nfb=False, user=cur_user).first()
        if found_param and found_param.id != None:
            found_param.order = t_order
            try:
                found_param.save()
                logs_arr.append(f'Folder [{found_param.id}] is order changed: {t_order}')
            except Exception as e:
                logs_arr.append(f'Folder [{found_param.id}] -> ERROR / Not access or another reason')
    return JsonResponse({"success": status, "type": c_type, "logs": logs_arr}, status=200)


def POST_edit_exs_tag_one(request, cur_user):
    status = False
    c_type = request.POST.get("type", "")
    c_id = -1
    c_category_id = -1
    delete_status = -1
    try:
        c_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        c_category_id = int(request.POST.get("category", -1))
    except:
        pass
    try:
        delete_status = int(request.POST.get("delete", -1))
    except:
        pass
    c_name = request.POST.get("name", "")
    lowercase_name = c_name.lower()
    if c_type == "nfb":
        if cur_user.is_superuser:
            c_tag = ExerciseTag.objects.filter(id=c_id, is_nfb=True).first()
            c_category = ExerciseTagCategory.objects.filter(id=c_category_id, is_nfb=True).first()
            if delete_status != 1:
                if c_tag:
                    c_tag.name = c_name
                    c_tag.lowercase_name = lowercase_name
                else:
                    c_tag = ExerciseTag(is_nfb=True, name=c_name, lowercase_name=lowercase_name, category=c_category)
                try:
                    c_tag.save()
                    status = True
                except Exception as e:
                    pass
            else:
                if c_tag:
                    try:
                        c_tag.delete()
                        status = True
                    except Exception as e:
                        pass
    elif c_type == "self":
        c_tag = None
        if request.user.club_id is not None:
            c_tag = ExerciseTag.objects.filter(id=c_id, is_nfb=False, club=request.user.club_id).first()
            c_category = ExerciseTagCategory.objects.filter(id=c_category_id, is_nfb=False, club=request.user.club_id).first()
        else:
            c_tag = ExerciseTag.objects.filter(id=c_id, is_nfb=False, user=cur_user).first()
            c_category = ExerciseTagCategory.objects.filter(id=c_category_id, is_nfb=False, user=cur_user).first()
        if delete_status != 1:
            if c_tag:
                c_tag.name = c_name
                c_tag.lowercase_name = lowercase_name
            else:
                if request.user.club_id is not None:
                    c_tag = ExerciseTag(is_nfb=False, club=request.user.club_id, name=c_name, lowercase_name=lowercase_name, category=c_category)
                else:
                    c_tag = ExerciseTag(is_nfb=False, user=cur_user, name=c_name, lowercase_name=lowercase_name, category=c_category)
            try:
                c_tag.save()
                status = True
            except Exception as e:
                pass
        else:
            if c_tag:
                try:
                    c_tag.delete()
                    status = True
                except Exception as e:
                    pass  
    return JsonResponse({"success": status, "type": c_type}, status=200)


def POST_change_order_exs_tag_one(request, cur_user):
    status = True
    ids_data = request.POST.getlist("ids_arr[]", [])
    ordering_data = request.POST.getlist("order_arr[]", [])
    c_type = request.POST.get("type", "")
    logs_arr = []
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_param = None
        if c_type == "nfb":
            if cur_user.is_superuser:
                found_param = ExerciseTag.objects.filter(id=t_id, is_nfb=True).first()
        elif c_type == "self":
            if request.user.club_id is not None:
                found_param = ExerciseTag.objects.filter(id=t_id, is_nfb=False, club=request.user.club_id).first()
            else:
                found_param = ExerciseTag.objects.filter(id=t_id, is_nfb=False, user=cur_user).first()
        if found_param and found_param.id != None:
            found_param.order = t_order
            try:
                found_param.save()
                logs_arr.append(f'Folder [{found_param.id}] is order changed: {t_order}')
            except Exception as e:
                logs_arr.append(f'Folder [{found_param.id}] -> ERROR / Not access or another reason')
    return JsonResponse({"success": status, "type": c_type, "logs": logs_arr}, status=200)


def POST_change_exs_tag_category(request, cur_user):
    status = False
    c_type = request.POST.get("type", "")
    c_id = -1
    c_category_id = -1
    try:
        c_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        c_category_id = int(request.POST.get("category", -1))
    except:
        pass
    if c_type == "nfb":
        if cur_user.is_superuser:
            c_tag = ExerciseTag.objects.filter(id=c_id, is_nfb=True).first()
            c_category = ExerciseTagCategory.objects.filter(id=c_category_id, is_nfb=True).first()
            if c_tag:
                c_tag.category = c_category
                try:
                    c_tag.save()
                    status = True
                except Exception as e:
                    pass
    elif c_type == "self":
        c_tag = None
        c_category = None
        if request.user.club_id is not None:
            c_tag = ExerciseTag.objects.filter(id=c_id, is_nfb=False, club=request.user.club_id).first()
            c_category = ExerciseTagCategory.objects.filter(id=c_category_id, is_nfb=False, club=request.user.club_id).first()
        else:
            c_tag = ExerciseTag.objects.filter(id=c_id, is_nfb=False, user=cur_user).first()
            c_category = ExerciseTagCategory.objects.filter(id=c_category_id, is_nfb=False, user=cur_user).first()
        if c_tag:
            c_tag.category = c_category
            try:
                c_tag.save()
                status = True
            except Exception as e:
                pass
    return JsonResponse({"success": status, "type": c_type}, status=200)


def POST_edit_exs_admin_options(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit exercise's admin options".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    post_key = request.POST.get("data[key]", "")
    post_value = 0
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        post_value = int(request.POST.get("data[value]", 0))
    except:
        pass
    if not cur_user.is_superuser:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    c_exs = None
    if folder_type == utils.FOLDER_TEAM:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userexercise"], 
            'perms_club': ["exercises.change_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=cur_team)
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
    elif folder_type == utils.FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_adminexercise"], 
            'perms_club': ["exercises.change_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id)
    elif folder_type == utils.FOLDER_CLUB:
        pass
    if c_exs != None and c_exs.exists() and c_exs[0].id != None:
        c_exs = c_exs[0]
        setattr(c_exs, post_key, post_value)
        try:
            c_exs.save()
            return JsonResponse({"data": {"id": exs_id, "value": post_value}, "success": True}, status=200)
        except:
            pass
    return JsonResponse({"errors": "Can't edit exs admin option"}, status=400)


def POST_edit_exs_full_name(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit exercise full name".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    exs_id = -1
    folder_type = request.POST.get("f_type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    key = request.POST.get("key", "")
    value = request.POST.get("value", "")
    lang = request.POST.get("lang", "")
    c_exs = None
    if not cur_user.is_superuser:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if folder_type == utils.FOLDER_TEAM:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
            'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=found_team[0])
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
    elif folder_type == utils.FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_adminexercise", "exercises.add_adminexercise"], 
            'perms_club': ["exercises.change_adminexercise", "exercises.add_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id)
    elif folder_type == utils.FOLDER_CLUB:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
    if c_exs == None:
            return JsonResponse({"err": "Exercise not found.", "success": False}, status=400)
    else:
        if c_exs.exists() and c_exs[0].id != None:
            c_exs = c_exs[0]
    if key == "title":
        c_exs.title = utils.set_by_language_code(c_exs.title, lang, value)
    elif key == "description":
        c_exs.description = utils.set_by_language_code(c_exs.description, lang, value)
    try:
        c_exs.save()
        res_data = f'Exs with id: [{c_exs.id}] is added / edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_edit_all_exs_titles(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Edit all exercises' titles from folder".

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
    folder_type = request.POST.get("f_type", "")
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    lang = request.POST.get("lang", "")
    to_copy = 0
    try:
        to_copy = int(request.POST.get("to_copy", 0))
    except:
        pass
    is_success = True
    res_data = ""
    if not cur_user.is_superuser:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if folder_type == utils.FOLDER_NFB:
        c_folder = AdminFolder.objects.filter(id=folder_id, parent__isnull=False)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exercises = AdminExercise.objects.filter(folder=c_folder[0])
        for exercise in c_exercises:
            exs_title = utils.get_by_language_code(exercise.title, request.LANGUAGE_CODE)
            if to_copy == 0:
                exercise.title = utils.set_by_language_code(exercise.title, request.LANGUAGE_CODE, "")
            exercise.title = utils.set_by_language_code(exercise.title, lang, exs_title)
            try:
                exercise.save()
                res_data += f'Exs with id: [{exercise.id}] is edited successfully.'
            except Exception as e:
                res_data += f'Exs with id: [{exercise.id}] cant be edited. Err.'
                is_success = False
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_move_video_from_exs_to_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Move video or animation from one exercise to another".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    from_exs = -1
    to_exs = -1
    try:
        from_exs = int(request.POST.get("from_exs", -1))
    except:
        pass
    try:
        to_exs = int(request.POST.get("to_exs", -1))
    except:
        pass
    c_content = request.POST.getlist("content[]", [])
    is_success = True
    res_data = ""
    if not cur_user.is_superuser:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    found_exercise_from = AdminExercise.objects.filter(id=from_exs).first()
    found_exercise_to = AdminExercise.objects.filter(id=to_exs).first()
    if not found_exercise_from or not found_exercise_to:
        return JsonResponse({"err": "Can't find one of the exercises.", "success": False}, status=400)
    is_success = False
    if "video_1" in c_content:
        exs_from_video = None
        video = None
        try:
            exs_from_video = found_exercise_from.videos.through.objects.filter(type=1, exercise_nfb=found_exercise_from).first()
            video = exs_from_video.video
        except:
            pass
        if exs_from_video and video:
            try:
                exs_from_video.delete()
                found_exercise_to.videos.through.objects.update_or_create(type=1, exercise_nfb=found_exercise_to, defaults={"video": video})
                is_success = True
            except:
                pass
    if "video_2" in c_content:
        exs_from_video = None
        video = None
        try:
            exs_from_video = found_exercise_from.videos.through.objects.filter(type=2, exercise_nfb=found_exercise_from).first()
            video = exs_from_video.video
        except:
            pass
        if exs_from_video and video:
            try:
                exs_from_video.delete()
                found_exercise_to.videos.through.objects.update_or_create(type=2, exercise_nfb=found_exercise_to, defaults={"video": video})
                is_success = True
            except:
                pass
    if "animation_1" in c_content:
        exs_from_video = None
        video = None
        try:
            exs_from_video = found_exercise_from.videos.through.objects.filter(type=3, exercise_nfb=found_exercise_from).first()
            video = exs_from_video.video
        except:
            pass
        if exs_from_video and video:
            try:
                exs_from_video.delete()
                found_exercise_to.videos.through.objects.update_or_create(type=3, exercise_nfb=found_exercise_to, defaults={"video": video})
                is_success = True
            except:
                pass
    if "animation_2" in c_content:
        exs_from_video = None
        video = None
        try:
            exs_from_video = found_exercise_from.videos.through.objects.filter(type=4, exercise_nfb=found_exercise_from).first()
            video = exs_from_video.video
        except:
            pass
        if exs_from_video and video:
            try:
                exs_from_video.delete()
                found_exercise_to.videos.through.objects.update_or_create(type=4, exercise_nfb=found_exercise_to, defaults={"video": video})
                is_success = True
            except:
                pass
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_copy_scheme_from_exs_to_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on POST operation "Copy scheme from one exercise to another".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    from_exs = -1
    to_exs = -1
    try:
        from_exs = int(request.POST.get("from_exs", -1))
    except:
        pass
    try:
        to_exs = int(request.POST.get("to_exs", -1))
    except:
        pass
    from_folder_type = request.POST.get("from_f_type", "")
    to_folder_type = request.POST.get("to_f_type", "")
    c_content = request.POST.getlist("content[]", [])
    is_success = True
    res_data = ""
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userexercise"], 
        'perms_club': ["exercises.change_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    found_exercise_from = None
    found_exercise_to = None
    if from_folder_type == utils.FOLDER_NFB:
        found_exercise_from = AdminExercise.objects.filter(id=from_exs).first()
    elif from_folder_type == utils.FOLDER_TEAM:
        if request.user.club_id is not None:
            found_exercise_from = ClubExercise.objects.filter(id=from_exs, team=cur_team, club=request.user.club_id).first()
        else:
            found_exercise_from = UserExercise.objects.filter(id=from_exs, user=cur_user).first()
    elif from_folder_type == utils.FOLDER_CLUB:
        if request.user.club_id is not None:
            found_exercise_from = ClubExercise.objects.filter(id=from_exs, club=request.user.club_id).first()
    
    if to_folder_type == utils.FOLDER_NFB:
        if cur_user.is_superuser:
            found_exercise_to = AdminExercise.objects.filter(id=to_exs).first()
    elif to_folder_type == utils.FOLDER_TEAM:
        if request.user.club_id is not None:
            found_exercise_to = ClubExercise.objects.filter(id=to_exs, team=cur_team, club=request.user.club_id).first()
        else:
            found_exercise_to = UserExercise.objects.filter(id=to_exs, user=cur_user).first()
    elif to_folder_type == utils.FOLDER_CLUB:
        if request.user.club_id is not None:
            found_exercise_to = ClubExercise.objects.filter(id=to_exs, club=request.user.club_id).first()
    if not found_exercise_from or not found_exercise_to:
        return JsonResponse({"err": "Can't find one of the exercises.", "success": False}, status=400)
    is_success = False
    if "scheme_1" in c_content:
        old_scheme = None
        new_scheme = ""
        try:
            old_scheme = found_exercise_from.scheme_data['scheme_1']
        except Exception as e:
            print(e)
            pass
        try:
            scheme_id = found_exercise_from.scheme_1
            response = requests.post(f'{NEW_SCHEME_DRAWER_URL}/api/canvas-draw/v1/canvas/duplicate', json={'id': scheme_id})
            r_json = response.json()
            if 'id' in r_json:
                new_scheme = r_json['id']
        except Exception as e:
            print(e)
            pass
        try:
            if old_scheme is not None:
                found_exercise_to.scheme_data['scheme_1'] = old_scheme
            if new_scheme is not None:
                found_exercise_to.scheme_1 = new_scheme
            is_success = True
        except Exception as e:
            print(e)
            pass
    if "scheme_2" in c_content:
        old_scheme = None
        new_scheme = ""
        try:
            old_scheme = found_exercise_from.scheme_data['scheme_2']
        except Exception as e:
            print(e)
            pass
        try:
            scheme_id = found_exercise_from.scheme_2
            response = requests.post(f'{NEW_SCHEME_DRAWER_URL}/api/canvas-draw/v1/canvas/duplicate', json={'id': scheme_id})
            r_json = response.json()
            if 'id' in r_json:
                new_scheme = r_json['id']
        except Exception as e:
            print(e)
            pass
        try:
            if old_scheme is not None:
                found_exercise_to.scheme_data['scheme_2'] = old_scheme
            if new_scheme is not None:
                found_exercise_to.scheme_2 = new_scheme
            is_success = True
        except Exception as e:
            print(e)
            pass
    try:
        found_exercise_to.save()
    except Exception as e:
        print(e)
        is_success = False
    return JsonResponse({"data": res_data, "success": is_success}, status=200)


def POST_create_exs_drawing_pic(request, cur_user, cur_team):
    exs_id = -1
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    c_img = request.FILES.get('file_image')
    c_exs = None
    found_team = None
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if folder_type == utils.FOLDER_TEAM:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
            'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=found_team[0]).first()
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user).first()
    elif folder_type == utils.FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_adminexercise", "exercises.add_adminexercise"], 
            'perms_club': ["exercises.change_adminexercise", "exercises.add_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id).first()
    img_url = ""
    if c_exs is not None:
        try:
            c_exs.scheme_img = c_img
            c_exs.save()
            img_url = c_exs.scheme_img.url
        except Exception as e:
            return JsonResponse({"err": f"Cant add image to exercise. ({e})", "success": False}, status=400)
    else:
        return JsonResponse({"err": "Exercise not found.", "success": False}, status=400)
    return JsonResponse({"data": img_url, "success": True}, status=200)


def POST_delete_exs_drawing_pic(request, cur_user, cur_team):
    exs_id = -1
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    c_exs = None
    found_team = None
    if request.user.club_id is not None:
        found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id)
    else:
        found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user)
    if folder_type == utils.FOLDER_TEAM:
        if not found_team or not found_team.exists() or found_team[0].id == None:
            return JsonResponse({"err": "Team not found.", "success": False}, status=400)
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userexercise", "exercises.add_userexercise"], 
            'perms_club': ["exercises.change_clubexercise", "exercises.add_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, club=request.user.club_id, team=found_team[0]).first()
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user).first()
    elif folder_type == utils.FOLDER_NFB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_adminexercise", "exercises.add_adminexercise"], 
            'perms_club': ["exercises.change_adminexercise", "exercises.add_adminexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id).first()
    img_url = ""
    if c_exs is not None:
        try:
            c_exs.scheme_img.delete(save=True)
            c_exs.save()
        except Exception as e:
            return JsonResponse({"err": f"Cant delete image from exercise. ({e})", "success": False}, status=400)
    else:
        return JsonResponse({"err": "Exercise not found.", "success": False}, status=400)
    return JsonResponse({"data": img_url, "success": True}, status=200)


def POST_edit_exs_feature_one(request, cur_user, cur_team):
    status = False
    errors = []
    c_id = -1
    delete_status = -1
    try:
        c_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        delete_status = int(request.POST.get("delete", -1))
    except:
        pass
    c_name = request.POST.get("name", "")
    c_feature = None
    if request.user.club_id is not None:
        c_feature = ClubExsFeatures.objects.filter(id=c_id, club_id=request.user.club_id).first()
    else:
        c_feature = UserExsFeatures.objects.filter(id=c_id, user_id=cur_user).first()
    if delete_status != 1:
        if c_feature:
            c_feature.name = c_name
        else:
            if request.user.club_id is not None:
                c_feature = ClubExsFeatures(club_id=request.user.club_id, name=c_name)
            else:
                c_feature = UserExsFeatures(user_id=cur_user, name=c_name)
        try:
            c_feature.save()
            status = True
        except Exception as e:
            errors.append(e)
            pass
    else:
        if c_feature:
            try:
                c_feature.delete()
                status = True
            except Exception as e:
                errors.append(e)
                pass
    return JsonResponse({"success": status, 'errs': errors}, status=200)


def POST_change_order_exs_features(request, cur_user, cur_team):
    status = True
    ids_data = request.POST.getlist("ids_arr[]", [])
    ordering_data = request.POST.getlist("order_arr[]", [])
    logs_arr = []
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_param = None
        if request.user.club_id is not None:
            found_param = ClubExsFeatures.objects.filter(id=t_id, club_id=request.user.club_id).first()
        else:
            found_param = UserExsFeatures.objects.filter(id=t_id, user_id=cur_user).first()
        if found_param and found_param.id != None:
            found_param.order = t_order
            try:
                found_param.save()
                logs_arr.append(f'Folder [{found_param.id}] is order changed: {t_order}')
            except Exception as e:
                logs_arr.append(f'Folder [{found_param.id}] -> ERROR / Not access or another reason')
    return JsonResponse({"success": status, "logs": logs_arr}, status=200)



def GET_link_video_exs(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Link videos from exercise video_data".
    Uses after parsing exercises from old site's version. Exercise has fields: "video_data" and "animation_data" which represented as
    list of video's ids. This function trying to find video objects by id and add to exercise in case success.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]]

    """
    folder_id = -1
    folder_type = ""
    try:
        folder_id = int(request.GET.get("folder", -1))
    except:
        pass
    try:
        folder_type = request.GET.get("f_type", "")
    except:
        pass
    try:
        found_exercises = get_excerises_data(folder_id, folder_type, request, cur_user, cur_team)
        logs = []
        for exercise in found_exercises:
            video_1 = None
            video_2 = None
            if exercise['video_data'] and exercise['video_data']['data'] and isinstance(exercise['video_data']['data'], list) and len(exercise['video_data']['data']) == 2:
                video_1 = check_video(exercise['video_data']['data'][0])
                video_2 = check_video(exercise['video_data']['data'][1])
            animation_1 = None
            animation_2 = None
            if exercise['animation_data'] and exercise['animation_data']['data'] and isinstance(exercise['animation_data']['data']['default'], list) and len(exercise['animation_data']['data']['default']) == 2:
                animation_1 = check_video(exercise['animation_data']['data']['default'][0])
                animation_2 = check_video(exercise['animation_data']['data']['default'][1])
            if folder_type == utils.FOLDER_TEAM:
                cur_exs = UserExercise.objects.filter(id=exercise['id'])
                if not cur_exs.exists() or cur_exs[0].id == None:
                    logs.append(f"Exercise with id: {exercise['id']} not found. Skipped.")
                    continue
                cur_exs[0].videos.through.objects.update_or_create(type=1, exercise_user=cur_exs[0], defaults={"video": video_1})
                cur_exs[0].videos.through.objects.update_or_create(type=2, exercise_user=cur_exs[0], defaults={"video": video_2})
                cur_exs[0].videos.through.objects.update_or_create(type=3, exercise_user=cur_exs[0], defaults={"video": animation_1})
                cur_exs[0].videos.through.objects.update_or_create(type=4, exercise_user=cur_exs[0], defaults={"video": animation_2})
                logs.append(f"Exercise with id: {exercise['id']} successfully changed.")
            elif folder_type == utils.FOLDER_NFB:
                cur_exs = AdminExercise.objects.filter(id=exercise['id'])
                if not cur_exs.exists() or cur_exs[0].id == None:
                    logs.append(f"Exercise with id: {exercise['id']} not found. Skipped.")
                    continue
                cur_exs[0].videos.through.objects.update_or_create(type=1, exercise_nfb=cur_exs[0], defaults={"video": video_1})
                cur_exs[0].videos.through.objects.update_or_create(type=2, exercise_nfb=cur_exs[0], defaults={"video": video_2})
                cur_exs[0].videos.through.objects.update_or_create(type=3, exercise_nfb=cur_exs[0], defaults={"video": animation_1})
                cur_exs[0].videos.through.objects.update_or_create(type=4, exercise_nfb=cur_exs[0], defaults={"video": animation_2})
                logs.append(f"Exercise with id: {exercise['id']} successfully changed.")
            elif folder_type == utils.FOLDER_CLUB:
                pass
        return JsonResponse({"logs": logs, "success": True}, status=200)
    except Exception as e:
        print(e)
        return JsonResponse({"ERR": f"Cant created or updated video in exs. {e}", "success": False}, status=400)


def GET_get_exs_all(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get all exercises from folder".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    folder_id = -1
    folder_type = ""
    try:
        folder_id = int(request.GET.get("folder", -1))
    except:
        pass
    try:
        folder_type = request.GET.get("f_type", "")
    except:
        pass
    res_exs = []
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.view_userexercise"], 
        'perms_club': ["exercises.view_clubexercise"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    found_exercises = get_excerises_data(folder_id, folder_type, request, cur_user, cur_team)
    for exercise in found_exercises:
        exs_title = utils.get_by_language_code(exercise['title'], request.LANGUAGE_CODE)
        exs_field_players = utils.get_by_language_code(exercise['field_players'], request.LANGUAGE_CODE)
        exs_field_goal = utils.get_by_language_code(exercise['field_goal'], request.LANGUAGE_CODE)
        exs_data = {
            'id': exercise['id'], 
            'folder': exercise['folder_id'] if 'folder_id' in exercise else utils.FOLDER_TRAINER, 
            'title': exs_title,
            'field_players': exs_field_players,
            'field_goal': exs_field_goal,
            'field_players_a': exercise['field_players_a'],
            'field_players_b': exercise['field_players_b'],
            'field_keyword_a': exercise['field_keyword_a'],
            'field_keyword_b': exercise['field_keyword_b'],
            'field_keywords': exercise['field_keywords'],
            'field_exs_category_a': exercise['field_exs_category_a'],
            'field_exs_category_b': exercise['field_exs_category_b'],
            'field_categories': exercise['field_categories'],
            'field_cognitive_loads': exercise['field_cognitive_loads'],
            'field_fields': exercise['field_fields'],
            'ref_ball_id': exercise['ref_ball_id'],
            'has_video_1': exercise['has_video_1'],
            'has_video_2': exercise['has_video_2'],
            'has_animation_1': exercise['has_animation_1'],
            'has_animation_2': exercise['has_animation_2'],
            'opt_has_video': exercise['opt_has_video'],
            'opt_has_animation': exercise['opt_has_animation'],
            'opt_has_description': exercise['opt_has_description'],
            'opt_has_scheme': exercise['opt_has_scheme'],
            'visible': exercise['visible'],
            'visible_demo': exercise['visible_demo'],
            'clone_nfb_id': exercise['clone_nfb_id'],
            'trainings_count': exercise['trainings_count'],
            'in_trainer_folder': exercise['in_trainer_folder'],
        }
        videos_arr = get_exs_video_data(exercise['video_data'])
        anims_arr = get_exs_video_data(exercise['animation_data'])
        if isinstance(anims_arr, dict):
            anims_arr = anims_arr['default']
        if folder_type == utils.FOLDER_TEAM:
            exs_data['user'] = exercise['user_id']
        elif folder_type == utils.FOLDER_NFB:
            exs_data['user'] = "NFB"
        elif folder_type == utils.FOLDER_CLUB:
            pass
        exs_data['favorite'] = exercise['favorite'] if 'favorite' in exercise else None
        exs_data['video_1_watched'] = exercise['video_1_watched'] if 'video_1_watched' in exercise else None
        exs_data['video_2_watched'] = exercise['video_2_watched'] if 'video_2_watched' in exercise else None
        exs_data['animation_1_watched'] = exercise['animation_1_watched'] if 'animation_1_watched' in exercise else None
        exs_data['animation_2_watched'] = exercise['animation_2_watched'] if 'animation_2_watched' in exercise else None
        goal_shortcode = ExsGoal.objects.filter(id = exercise['ref_goal_id']).only('id', 'short_name')
        if goal_shortcode.exists() and goal_shortcode[0].id != None:
            goal_shortcode = goal_shortcode[0].short_name
        else:
            goal_shortcode = None
        exs_data['goal_code'] = goal_shortcode
        exs_data['ball_val'] = exercise['ref_ball_id']
        exs_data['favorite'] = exercise['favorite'] if 'favorite' in exercise else None
        exs_data['has_notes'] = exercise['has_notes'] if 'has_notes' in exercise else None
        exs_data['blocked'] = not exercise['visible_demo'] if cur_user.is_demo_mode and exercise['nf_exs'] else False
        res_exs.append(exs_data)
    # sorting list by title:
    for elem in res_exs:
        if isinstance(elem['title'], str):
            elem['title_for_sort'] = elem['title'].replace(" ", "")
        else:
            elem['title'] = ""
            elem['title_for_sort'] = ""
    res_exs = sorted(res_exs, key=lambda d: d['title_for_sort'])
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_exs_one(request, cur_user, cur_team, additional={}):
    """
    Return JSON Response or object as result on GET operation "Get one exercise".
    If keys "f_type" and "exs" will be in <additional> dictionary then function return Object or None
    else JSON Response.

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param additional: Uses for custom change folder's type and exercise's id.
    :type additional: dict[]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as exercise's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object

    """
    exs_id = -1
    folder_type = request.GET.get("f_type", "")
    try:
        exs_id = int(request.GET.get("exs", -1))
    except:
        pass
    is_as_object = False
    if "f_type" in additional and "exs" in additional:
        folder_type = additional['f_type']
        exs_id = additional['exs']
        is_as_object = True
    res_exs = {}
    c_exs = None
    if request.user.is_anonymous:
        request.user.club_id = None
        if request.user.temp_club:
            request.user.club_id = request.user.temp_club
        cur_user = request.user.id
    if folder_type == utils.FOLDER_TEAM:
        if not request.user.is_anonymous and not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            if is_as_object:
                return None
            else:
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            if request.user.is_anonymous:
                c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id)
            else:
                c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id, team=cur_team)
        else:
            if request.user.is_anonymous:
                c_exs = UserExercise.objects.filter(id=exs_id, visible=True)
            else:
                c_exs = UserExercise.objects.filter(id=exs_id, visible=True, user=cur_user)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = False
            res_exs['folder_parent_id'] = c_exs[0].folder.parent
            res_exs['copied_from_nfb'] = c_exs[0].clone_nfb_id != None
        user_params = None
        if request.user.club_id is not None:
            user_params = UserExerciseParam.objects.filter(exercise_club=c_exs[0].id, user=cur_user)
        else:
            if request.user.is_anonymous:
                user_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0].id)
            else:
                user_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0].id, user=cur_user)
        if user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
        team_params = None
        if request.user.club_id is not None:
            team_params = UserExerciseParamTeam.objects.filter(exercise_club=c_exs[0].id, team_club=cur_team)
        else:
            if request.user.is_anonymous:
                team_params = UserExerciseParamTeam.objects.filter(exercise_user=c_exs[0].id)
            else:
                team_params = UserExerciseParamTeam.objects.filter(exercise_user=c_exs[0].id, team=cur_team)
        if team_params.exists() and team_params[0].id != None:
            team_params = team_params.values()[0]
            res_exs['additional_data'] = utils.get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = utils.get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = utils.get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = utils.get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = utils.get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = utils.get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    elif folder_type == utils.FOLDER_NFB:
        c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = True
            res_exs['folder_parent_id'] = c_exs[0].folder.parent
        user_params = UserExerciseParam.objects.filter(exercise_nfb=c_exs[0].id, user=cur_user)
        if user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
        team_params = UserExerciseParamTeam.objects.filter(exercise_nfb=c_exs[0].id)
        if team_params.exists() and team_params[0].id != None:
            team_params = team_params.values()[0]
            res_exs['additional_data'] = utils.get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = utils.get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = utils.get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = utils.get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = utils.get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = utils.get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    elif folder_type == utils.FOLDER_CLUB:
        if not request.user.is_anonymous and not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            if is_as_object:
                return None
            else:
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id)
        if c_exs and c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = False
            res_exs['folder_parent_id'] = c_exs[0].folder.parent
            res_exs['copied_from_nfb'] = c_exs[0].clone_nfb_id != None
        user_params = None
        if request.user.club_id is not None:
            user_params = UserExerciseParam.objects.filter(exercise_club=c_exs[0].id, user=cur_user)
        if user_params and user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
        team_params = None
        if request.user.club_id is not None:
            team_params = UserExerciseParamTeam.objects.filter(exercise_club=c_exs[0].id, team_club=cur_team)
        if team_params and team_params.exists() and team_params[0].id != None:
            team_params = team_params.values()[0]
            res_exs['additional_data'] = utils.get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = utils.get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = utils.get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = utils.get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = utils.get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = utils.get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    elif folder_type == utils.FOLDER_TRAINER:
        if not request.user.is_anonymous and not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            if is_as_object:
                return None
            else:
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        last_name = cur_user.personal.last_name.lower().replace(' ', '')
        c_exs = TrainerExercise.objects.filter(user_name=last_name, user_birthdate=cur_user.personal.date_birthsday, id=exs_id)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = False
            res_exs['folder_parent_id'] = ""
            res_exs['copied_from_nfb'] = ""
        user_params = UserExerciseParam.objects.filter(exercise_trainer=c_exs[0].id)
        if user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
    else:
        if is_as_object:
            return None
        else:
            return JsonResponse({"errors": "Exercise not found.", "success": False}, status=400)
    res_exs['title'] = utils.get_by_language_code(res_exs['title'], request.LANGUAGE_CODE)
    res_exs['description'] = utils.get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)
    res_exs['description_trainer'] = utils.get_by_language_code(res_exs['description_trainer'], request.LANGUAGE_CODE)
    res_exs['scheme_data'] = get_exs_scheme_data(res_exs['scheme_data'])
    res_exs['video_data'] = get_exs_video_data(res_exs['video_data'])
    res_exs['animation_data'] = get_exs_animation_data(res_exs['animation_data'])
    res_exs['ref_goal'] = res_exs['ref_goal_id']
    res_exs['ref_ball'] = res_exs['ref_ball_id']
    res_exs['ref_team_category'] = res_exs['ref_team_category_id']
    res_exs['ref_age_category'] = res_exs['ref_age_category_id']
    res_exs['ref_train_part'] = res_exs['ref_train_part_id']
    res_exs['ref_cognitive_load'] = res_exs['ref_cognitive_load_id']
    res_exs['ref_stress_type'] = res_exs['ref_stress_type_id']
    res_exs['field_players'] = utils.get_by_language_code(res_exs['field_players'], request.LANGUAGE_CODE)
    res_exs['field_goal'] = utils.get_by_language_code(res_exs['field_goal'], request.LANGUAGE_CODE)
    res_exs['field_goalkeeper'] = utils.get_by_language_code(res_exs['field_goalkeeper'], request.LANGUAGE_CODE)
    res_exs['field_age'] = utils.get_by_language_code(res_exs['field_age'], request.LANGUAGE_CODE)
    res_exs['field_task'] = utils.get_by_language_code(res_exs['field_task'], request.LANGUAGE_CODE)
    res_exs = get_exs_video_data2(res_exs, c_exs[0], folder_type, request.user.club_id)
    # res_exs = get_exs_additional_params(res_exs, c_exs[0], folder_type, cur_user, request.user.club_id, request.LANGUAGE_CODE)
    res_exs['tags'] = get_tags_of_exercise(c_exs[0])
    if is_as_object:
        return res_exs
    else:
        return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_exs_graphic_content(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get graphic content of exercise".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    exs_id = -1
    folder_type = request.GET.get("f_type", "")
    try:
        exs_id = int(request.GET.get("exs", -1))
    except:
        pass
    res_exs = {}
    c_exs = None
    if folder_type == utils.FOLDER_TEAM:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id, team=cur_team)
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, visible=True, user=cur_user)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    elif folder_type == utils.FOLDER_NFB:
        c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    elif folder_type == utils.FOLDER_CLUB:
        if request.user.club_id is not None:
            if not util_check_access(cur_user, {
                'perms_club': ["exercises.view_clubexercise"]
            }):
                return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    elif folder_type == utils.FOLDER_TRAINER:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        last_name = cur_user.personal.last_name.lower().replace(' ', '')
        c_exs = TrainerExercise.objects.filter(user_name=last_name, user_birthdate=cur_user.personal.date_birthsday, id=exs_id)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    else:
        return JsonResponse({"errors": "Exercise not found.", "success": False}, status=400)
    if c_exs is not None and c_exs.exists() and c_exs[0].id != None:
        res_exs['description'] = utils.get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)
        res_exs['description_trainer'] = utils.get_by_language_code(res_exs['description_trainer'], request.LANGUAGE_CODE)
        res_exs['scheme_data'] = get_exs_scheme_data(res_exs['scheme_data'])
        res_exs['video_data'] = get_exs_video_data(res_exs['video_data'])
        res_exs['animation_data'] = get_exs_animation_data(res_exs['animation_data'])
        res_exs = get_exs_video_data2(res_exs, c_exs[0], folder_type, request.user.club_id)
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_exs_all_tags(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get all exercises' tags".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    data = {'nfb': [], 'self': [], 'categories': {'nfb': [], 'self': []}}
    if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    tags = get_exercises_tags(request, cur_user, cur_team)
    for entry in tags['nfb']:
        data['nfb'].append({
            'id': entry.id,
            'name': entry.name,
            'lowercase_name': entry.lowercase_name,
            'category': entry.category.id if getattr(entry, 'category') is not None else "",
            'color': entry.category.color if getattr(entry, 'category') is not None else ""
        })
    for entry in tags['self']:
        data['self'].append({
            'id': entry.id,
            'name': entry.name,
            'lowercase_name': entry.lowercase_name,
            'category': entry.category.id if getattr(entry, 'category') is not None else "",
            'color': entry.category.color if getattr(entry, 'category') is not None else ""
        })
    for entry in tags['categories']['nfb']:
        data['categories']['nfb'].append({
            'id': entry.id,
            'name': entry.name,
            'color': entry.color
        })
    for entry in tags['categories']['self']:
        data['categories']['self'].append({
            'id': entry.id,
            'name': entry.name,
            'color': entry.color
        })
    return JsonResponse({"data": data, "success": True}, status=200)


def GET_get_exs_full_name(request, cur_user, cur_team):
    """
    Return JSON Response or object as result on GET operation "Get one exercise full name".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param additional: Uses for custom change folder's type and exercise's id.
    :type additional: dict[]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code) or as exercise's object.
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]] or JsonResponse[{"errors": [str]}, status=[int]] or Object

    """
    exs_id = -1
    folder_type = request.GET.get("f_type", "")
    try:
        exs_id = int(request.GET.get("exs", -1))
    except:
        pass
    res_exs = {}
    c_exs = None
    if not cur_user.is_superuser:
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if folder_type == utils.FOLDER_TEAM:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id, team=cur_team)
        else:
            c_exs = UserExercise.objects.filter(id=exs_id, visible=True, user=cur_user)
        if c_exs.exists() and c_exs[0].id != None:
            c_exs = c_exs[0]
            res_exs['title'] = c_exs.title
            res_exs['description'] = c_exs.description
            res_exs['description_trainer'] = c_exs.description_trainer
    elif folder_type == utils.FOLDER_NFB:
        c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            c_exs = c_exs[0]
            res_exs['title'] = c_exs.title
            res_exs['description'] = c_exs.description
            res_exs['description_trainer'] = c_exs.description_trainer
    elif folder_type == utils.FOLDER_CLUB:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        if request.user.club_id is not None:
            c_exs = ClubExercise.objects.filter(id=exs_id, visible=True, club=request.user.club_id)
        if c_exs and c_exs.exists() and c_exs[0].id != None:
            c_exs = c_exs[0]
            res_exs['title'] = c_exs.title
            res_exs['description'] = c_exs.description
            res_exs['description_trainer'] = c_exs.description_trainer
    else:
        return JsonResponse({"errors": "Exercise not found.", "success": False}, status=400)
    return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_exs_all_features(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Get all exercises' features".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "success" flag (True or False) and "status" (response code).
    :rtype: JsonResponse[{"data": [obj], "success": [bool]}, status=[int]]

    """
    if not util_check_access(cur_user, {
            'perms_user': ["exercises.view_userexercise"], 
            'perms_club': ["exercises.view_clubexercise"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    features = get_exercises_features(request, cur_user, cur_team)
    return JsonResponse({"data": features, "success": True}, status=200)

# --------------------------------------------------
# FOLDERS API
def POST_edit_folder(request, cur_user, cur_team, c_id, parent_id):
    """
    Return JSON Response as result on POST operation "Edit folder".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :param c_id: The ID of current folder, that is selected by the user.
    :type c_id: [int]
    :param parent_id: The ID of parent folder in case of creating folder.
    :type parent_id: [int]
    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    name = request.POST.get("name", "")
    short_name = request.POST.get("short_name", "")
    folder_type = request.POST.get("f_type", "")
    found_folder = None
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userfolder", "exercises.add_userfolder"], 
        'perms_club': ["exercises.change_clubfolder", "exercises.add_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    try:
        if request.user.club_id is not None:
            found_folder = ClubFolder.objects.filter(id=c_id, club=request.user.club_id).first()
        else:
            found_folder = UserFolder.objects.filter(id=c_id, user=cur_user, team=cur_team).first()
    except:
        pass
    if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
        found_folder = AdminFolder.objects.filter(id=c_id).first()
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
            if request.user.club_id is not None:
                found_team = ClubTeam.objects.filter(id=cur_team, club_id=request.user.club_id).first()
                new_folder = ClubFolder(name=name, short_name=short_name, parent=parent_id, club=request.user.club_id)
            else:
                found_team = UserTeam.objects.filter(id=cur_team, user_id=cur_user).first()
                new_folder = UserFolder(name=name, short_name=short_name, parent=parent_id, user=cur_user, team=found_team)
            if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
                new_folder = AdminFolder(name=name, short_name=short_name, parent=parent_id)
            new_folder.save()
            new_folder.order = new_folder.id
            new_folder.save()
            res_data = {'id': new_folder.id, 'parent_id': parent_id, 'name': name, 'short_name': short_name, 'type': "add"}
        except Exception as e:
            res_data = {'type': "error", 'err': str(e)}
    res_data['is_nfb'] = folder_type == utils.FOLDER_NFB and cur_user.is_superuser
    return JsonResponse({"data": res_data}, status=200)


def POST_delete_folder(request, cur_user, c_id):
    """
    Return JSON Response as result on POST operation "Delete folder".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param c_id: The ID of current folder, that is selected by the user.
    :type c_id: [int]
    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    res_data = {'type': "error", 'err': "Cant delete record."}
    folder_type = request.POST.get("f_type", "")
    found_folder = None
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.delete_userfolder"], 
        'perms_club': ["exercises.delete_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    if request.user.club_id is not None:
        found_folder = ClubFolder.objects.filter(id=c_id, club=request.user.club_id).first()
    else:
        found_folder = UserFolder.objects.filter(id=c_id, user=cur_user).first()
    if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
        found_folder = AdminFolder.objects.filter(id=c_id).first()
    if found_folder and found_folder.id != None:
        fId = found_folder.id
        try:
            found_folder.delete()
            found_child_folders = None
            if request.user.club_id is not None:
                found_child_folders = ClubFolder.objects.filter(parent=c_id, club=request.user.club_id)
            else:
                found_child_folders = UserFolder.objects.filter(parent=c_id, user=cur_user)
            if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
                found_child_folders = AdminFolder.objects.filter(parent=c_id)
            for folder in found_child_folders:
                folder.delete()
            res_data = {'id': fId, 'type': "delete"}
        except Exception as e:
            res_data = {'id': fId, 'type': "error", 'err': str(e)}
    return JsonResponse({"data": res_data}, status=200)


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
    ids_data = request.POST.getlist("ids_arr[]", [])
    ordering_data = request.POST.getlist("order_arr[]", [])
    folder_type = request.POST.get("f_type", "")
    temp_res_arr = []
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.change_userfolder"], 
        'perms_club': ["exercises.change_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    for c_ind in range(len(ids_data)):
        t_id = -1
        t_order = 0
        try:
            t_id = int(ids_data[c_ind])
            t_order = int(ordering_data[c_ind])
        except:
            pass
        found_folder = None
        if request.user.club_id is not None:
            found_folder = ClubFolder.objects.filter(id=t_id, club=request.user.club_id).first()
        else:
            found_folder = UserFolder.objects.filter(id=t_id, user=cur_user).first()
        if folder_type == utils.FOLDER_NFB and cur_user.is_superuser:
            found_folder = AdminFolder.objects.filter(id=t_id).first()
        if found_folder and found_folder.id != None:
            found_folder.order = t_order
            try:
                found_folder.save()
                temp_res_arr.append(f'Folder [{found_folder.id}] is order changed: {t_order}')
            except Exception as e:
                temp_res_arr.append(f'Folder [{found_folder.id}] -> ERROR / Not access or another reason')
    res_data = {'res_arr': temp_res_arr, 'type': "change_order"}
    return JsonResponse({"data": res_data}, status=200)



def GET_nfb_folders(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get NFB folders".

    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    folders = AdminFolder.objects.filter(visible=True).only("short_name", "name", "parent")
    if not cur_user.is_superuser:
        folders = folders.filter(active=True)
    res_folders = []
    for folder in folders:
        res_folders.append({'id': folder.id, 'short_name': folder.short_name, 'name': folder.name, 'parent': folder.parent})
    res_data = {'folders': res_folders, 'type': "nfb_folders"}
    return JsonResponse({"data": res_data}, status=200)


def GET_nfb_folders_set(request, cur_user, cur_team):
    """
    Return JSON Response as result on GET operation "Set NFB folders' structure to TEAM / CLUB folders".

    :param request: Django HttpRequest.
    :type request: [HttpRequest]
    :param cur_user: The current user of the system, who is currently authorized.
    :type cur_user: Model.object[User]
    :param cur_team: The current team, that is selected by the user.
    :type cur_team: [int]
    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    is_success = True
    if cur_team == "__last_one":
        cur_team = UserTeam.objects.filter(user_id=cur_user).order_by('-id').first().id
    else:
        if not util_check_access(cur_user, {
            'perms_user': ["exercises.change_userfolder", "exercises.add_userfolder", "exercises.delete_userfolder"], 
            'perms_club': ["exercises.change_clubfolder", "exercises.add_clubfolder", "exercises.delete_clubfolder"]
        }):
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    old_folders = None
    if request.user.club_id is not None:
        old_folders = ClubFolder.objects.filter(club=request.user.club_id)
    else:
        old_folders = UserFolder.objects.filter(user=cur_user, team=cur_team)
    try:
        old_folders.delete()
    except Exception as e:
        res_data = {'type': "error", 'err': str(e)}
        is_success = False
    folders = []
    if is_success:
        folders = AdminFolder.objects.filter(visible=True, active=True).only("short_name", "name", "parent")
        for folder in folders:
            try:
                found_team = None
                new_folder = None
                if request.user.club_id is not None:
                    found_team = ClubTeam.objects.get(id=cur_team, club_id=request.user.club_id)
                    new_folder = ClubFolder(name=folder.name, short_name=folder.short_name, order=folder.order, parent=0, club=request.user.club_id, team=found_team)
                else:
                    found_team = UserTeam.objects.get(id=cur_team, user_id=cur_user)
                    new_folder = UserFolder(name=folder.name, short_name=folder.short_name, order=folder.order, parent=0, user=cur_user, team=found_team)
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
                        c_folder = None
                        if request.user.club_id is not None:
                            c_folder = ClubFolder.objects.get(id=folder.new_id, club=request.user.club_id)
                        else:
                            c_folder = UserFolder.objects.get(id=folder.new_id, user=cur_user, team=cur_team)
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


def GET_all_teams_folders(request, cur_user):
    """
    Return JSON Response as result on GET operation "Get all teams folders".

    :return: JsonResponse with "data", "status" (response code).
    :rtype: JsonResponse[{"data": [obj]}, status=[int]]

    """
    if not util_check_access(cur_user, {
        'perms_user': ["exercises.view_userfolder"], 
        'perms_club': ["exercises.view_clubfolder"]
    }):
        return JsonResponse({"err": "Access denied.", "success": False}, status=400)
    data_result = []
    if request.user.club_id is None:
        teams = UserTeam.objects.filter(user_id=cur_user)
        for team in teams:
            folders = UserFolder.objects.filter(
                Q(user=cur_user, team=team, visible=True) &
                Q(Q(parent=0) | Q(parent__isnull=True))
            )
            folders = [entry for entry in folders.values()]
            for folder in folders:
                subfolders = UserFolder.objects.filter(user=cur_user, team=team, visible=True, parent=folder['id'])
                folder['subfolders'] = [entry for entry in subfolders.values()]
            data_result.append({
                'team': {'id': team.id, 'name': team.name},
                'folders': folders
            })
    return JsonResponse({"data": data_result, "success": True}, status=200)
