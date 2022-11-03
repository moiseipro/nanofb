import datetime
from django.http import JsonResponse
from users.models import User
from exercises.models import UserFolder, ClubFolder, AdminFolder, UserExercise, AdminExercise, ExerciseVideo
from exercises.models import UserExerciseParam, UserExerciseParamTeam
from references.models import ExsGoal, ExsBall, ExsTeamCategory, ExsAgeCategory, ExsTrainPart, ExsCognitiveLoad
from references.models import ExsKeyword, ExsStressType, ExsPurpose, ExsCoaching
from references.models import ExsCategory, ExsAdditionalData, ExsTitleName
from references.models import UserSeason, UserTeam
from video.models import Video


LANG_CODE_DEFAULT = "en"
FOLDER_TEAM = "team_folders"
FOLDER_NFB = "nfb_folders"
FOLDER_CLUB = "club_folders"



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


def set_value_as_ref(request, name, def_value = None):
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
    if res and res.exists() and res[0].id != None:
        res = res[0]
    else:
        res = None
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


def set_as_object(request, data, name, lang):
    value = []
    flag = True
    iterator = 0
    while flag:
        data_type = request.POST.get(f"data[{name}[]][{iterator}][type]")
        data_value = request.POST.get(f"data[{name}[]][{iterator}][value]")
        data_id = request.POST.get(f"data[{name}[]][{iterator}][id]")
        iterator += 1
        if iterator > 10 or data_type == None:
            flag = False
            break
        else:
            to_append = {'type': data_type, 'value': data_value}
            if data_id:
                to_append['id'] = data_id
            value.append(to_append)
    if type(data) is dict:
        data[lang] = value
    else:
        data = {lang: value}
    return data


def get_exercises_params(request, user, team):
    folders = []
    nfb_folders = []
    refs = {}
    if user.exists() and user[0].id != None:
        # добавить проверку на клуб версию
        folders = UserFolder.objects.filter(user=user[0], team=team, visible=True).values()
    nfb_folders = AdminFolder.objects.filter(visible=True).values()
    for elem in folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    for elem in nfb_folders:
        elem['root'] = False if elem['parent'] and elem['parent'] != 0 else True
    refs['exs_goal'] = ExsGoal.objects.filter().values()
    refs['exs_ball'] = ExsBall.objects.filter().values()
    refs['exs_team_category'] = ExsTeamCategory.objects.filter().values()
    refs['exs_age_category'] = ExsAgeCategory.objects.filter().values()
    refs['exs_train_part'] = ExsTrainPart.objects.filter().values()
    refs['exs_cognitive_load'] = ExsCognitiveLoad.objects.filter().values()
    refs['exs_additional_data'] = ExsAdditionalData.objects.filter().values()
    refs['exs_keyword'] = ExsKeyword.objects.filter().values()
    refs['exs_stress_type'] = ExsStressType.objects.filter().values()
    refs['exs_purpose'] = ExsPurpose.objects.filter().values()
    refs['exs_coaching'] = ExsCoaching.objects.filter().values()
    refs['exs_category'] = ExsCategory.objects.filter().values()
    refs['exs_title_names'] = ExsTitleName.objects.filter().values()
    refs = set_refs_translations(refs, request.LANGUAGE_CODE)
    return [folders, nfb_folders, refs]


def get_exs_scheme_data(data):
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
    res = []
    if data and data['data']:
        res = data['data']
    return res


def get_exs_animation_data(data):
    res = {'custom': '', 'default': []}
    if data and data['data']:
        res = data['data']
    return res


def get_exs_video_data2(data, exs, folder_type):
    videos = []
    if folder_type == FOLDER_NFB:
        videos = exs.videos.through.objects.filter(exercise_nfb=exs)
    elif folder_type == FOLDER_TEAM:
        videos = exs.videos.through.objects.filter(exercise_user=exs)
    elif folder_type == FOLDER_CLUB:
        videos = exs.videos.through.objects.filter(exercise_club=exs)
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
    # if video and video.exists() and video[0].id != None:
    #     data['video_1'] = {
    #         'id': video[0].video_1.id if video[0].video_1 else -1, 
    #         'links': video[0].video_1.links if video[0].video_1 else ""
    #     }
    #     data['video_2'] = {
    #         'id': video[0].video_2.id if video[0].video_2 else -1, 
    #         'links': video[0].video_2.links if video[0].video_2 else ""
    #     }
    #     data['animation_1'] = {
    #         'id': video[0].animation_1.id if video[0].animation_1 else -1, 
    #         'links': video[0].animation_1.links if video[0].animation_1 else ""
    #     }
    #     data['animation_2'] = {
    #         'id': video[0].animation_2.id if video[0].animation_2 else -1, 
    #         'links': video[0].animation_2.links if video[0].animation_2 else ""
    #     }
    return data


def get_excerises_data(folder_id = -1, folder_type = "", req = None, cur_user = None, cur_club = None):
    def days_between(date):
        return abs((datetime.date.today() - date).days)
    filter_goal = -1
    filter_ball = -1
    filter_watched = -1
    filter_favorite = -1
    filter_new_exs = -1
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
            filter_watched = int(req.GET.get("filter[watch]", -1))
        elif req.method == "POST":
            filter_watched = int(req.POST.get("filter[watch]", -1))
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

    f_exercises = []
    if folder_type == FOLDER_TEAM:
        c_folder = UserFolder.objects.filter(id=folder_id)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=200)
        child_folders = UserFolder.objects.filter(parent=c_folder[0].id)
        if child_folders.count() > 0:
            f_exercises = UserExercise.objects.filter(folder__in = child_folders)
        else:
            f_exercises = UserExercise.objects.filter(folder = c_folder[0])
    elif folder_type == FOLDER_NFB:
        c_folder = AdminFolder.objects.filter(id=folder_id)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=200)
        child_folders = AdminFolder.objects.filter(parent=c_folder[0].id)
        if child_folders.count() > 0:
            f_exercises = AdminExercise.objects.filter(folder__in = child_folders)
        else:
            f_exercises = AdminExercise.objects.filter(folder = c_folder[0])
    elif folder_type == FOLDER_CLUB:
        pass
    f_exercises = [entry for entry in f_exercises.values()]
    for exercise in f_exercises:
        exercise['has_video_1'] = False
        exercise['has_video_2'] = False
        exercise['has_animation_1'] = False
        exercise['has_animation_2'] = False
        videos_arr = get_exs_video_data(exercise['video_data'])
        anims_arr = get_exs_video_data(exercise['animation_data'])
        if isinstance(anims_arr, dict):
            anims_arr = anims_arr['default']
        if len(videos_arr) == 2:
            if videos_arr[0] != -1:
                exercise['has_video_1'] = True
            if videos_arr[1] != -1:
                exercise['has_video_2'] = True
        if len(anims_arr) == 2:
            if anims_arr[0] != -1:
                exercise['has_animation_1'] = True
            if anims_arr[1] != -1:
                exercise['has_animation_2'] = True
        user_params = None
        if folder_type == FOLDER_TEAM:
            user_params = UserExerciseParam.objects.filter(exercise_user=exercise['id'], user=cur_user)
        elif folder_type == FOLDER_NFB:
            user_params = UserExerciseParam.objects.filter(exercise_nfb=exercise['id'], user=cur_user)
            if cur_user.is_superuser:
                notes = UserExerciseParamTeam.objects.filter(exercise_nfb=exercise['id']).only('id', 'note')
                if notes.exists() and notes[0].id != None:
                    notes = notes[0].note
                    if notes and req.LANGUAGE_CODE in notes and notes[req.LANGUAGE_CODE] and len(notes[req.LANGUAGE_CODE]) > 0:
                        exercise['has_notes'] = True
        elif folder_type == FOLDER_CLUB:
            user_params = UserExerciseParam.objects.filter(exercise_club=exercise['id'], user=cur_user)
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

    if filter_goal != -1:
        f_exercises = list(filter(lambda c: c['ref_goal_id'] == filter_goal, f_exercises))
    if filter_ball != -1:
        f_exercises = list(filter(lambda c: c['ref_ball_id'] == filter_ball, f_exercises))
    if filter_watched != -1:
        f_exercises = list(filter(lambda c: c['watched_status'] == filter_watched, f_exercises))
    if filter_favorite != -1:
        f_exercises = list(filter(lambda c: c['favorite_status'] == filter_favorite, f_exercises))
    if filter_new_exs != -1:
        f_exercises = list(filter(lambda c: days_between(c['date_creation']) < 15, f_exercises))
    return f_exercises


def check_video(id):
    f_video = Video.objects.filter(id=id)
    if f_video.exists() and f_video[0].id != None:
        return f_video[0]
    return None
# --------------------------------------------------
# EXERCISES API
def POST_copy_exs(request, cur_user, cur_team):
    exs_id = -1
    folder_id = -1
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    try:
        folder_id = int(request.POST.get("folder", -1))
    except:
        pass
    found_folder = UserFolder.objects.filter(id=folder_id)
    success_status = False
    c_exs = None
    new_exs = None
    if found_folder.exists() and found_folder[0].id != None:
        res_data = {'err': "NULL"}
        if folder_type == FOLDER_NFB:
            c_exs = AdminExercise.objects.filter(id=exs_id)
            if c_exs.exists() and c_exs[0].id != None:
                new_exs = UserExercise(user=cur_user)
                for key in c_exs.values()[0]:
                    if key != "id" and key != "date_creation":
                        setattr(new_exs, key, c_exs.values()[0][key])
                new_exs.folder = found_folder[0]
                new_exs.old_id = exs_id
               
                # c_exs_video = ExerciseVideo.objects.filter(exercise_nfb=c_exs[0])
                # if c_exs_video.exists() and c_exs_video[0].id != None:
                    # new_exs_video = ExerciseVideo(exercise_user=new_exs)
                    # for key in c_exs_video.values()[0]:
                    #     if key != "id" and key != "exercise_user" and key != "exercise_club" and key != "exercise_nfb":
                    #         setattr(new_exs_video, key, c_exs_video.values()[0][key])
                try:
                    new_exs.save()
                    # new_exs_video.save()
                    res_data = {'id': new_exs.id}
                    success_status = True
                except Exception as e:
                    print(e)
                    res_data = {'id': new_exs.id, 'err': str(e)}
                exs_params = UserExerciseParamTeam.objects.filter(exercise_nfb=exs_id)
                if exs_params.exists() and exs_params[0].id != None and success_status:
                    found_team = UserTeam.objects.filter(id=cur_team)
                    if found_team.exists() and found_team[0].id != None:
                        new_exs_params = UserExerciseParamTeam(exercise_user=new_exs, team=found_team[0])
                        for key in exs_params.values()[0]:
                            if key != "id" and key != "exercise_user_id" and key != "exercise_club_id" and key != "exercise_nfb_id" and key != "team_id":
                                setattr(new_exs_params, key, exs_params.values()[0][key])
                        try:
                            new_exs_params.save()
                            res_data['exs_params'] = new_exs_params.id
                            success_status = True
                        except Exception as e:
                            success_status = False
                            res_data = {'id': new_exs.id, 'err': str(e)}
        elif folder_type == FOLDER_TEAM:
            c_exs = UserExercise.objects.filter(id=exs_id)
            if c_exs.exists() and c_exs[0].id != None:
                new_exs = UserExercise(user=cur_user)
                for key in c_exs.values()[0]:
                    if key != "id" and key != "date_creation":
                        setattr(new_exs, key, c_exs.values()[0][key])
                new_exs.folder = found_folder[0]
                # c_exs_video = ExerciseVideo.objects.filter(exercise_user=c_exs[0])
                # if c_exs_video.exists() and c_exs_video[0].id != None:
                #     new_exs_video = ExerciseVideo(exercise_user=new_exs)
                #     for key in c_exs_video.values()[0]:
                #         if key != "id" and key != "exercise_user" and key != "exercise_club" and key != "exercise_nfb":
                #             setattr(new_exs_video, key, c_exs_video.values()[0][key])
                try:
                    new_exs.save()
                    # new_exs_video.save()
                    res_data = {'id': new_exs.id}
                    success_status = True
                except Exception as e:
                    res_data = {'id': new_exs.id, 'err': str(e)}
        elif folder_type == FOLDER_CLUB:
            pass
        if c_exs and new_exs:
            try:
                videos = []
                if folder_type == FOLDER_NFB:
                    videos = c_exs[0].videos.through.objects.filter(exercise_nfb=c_exs[0])
                elif folder_type == FOLDER_TEAM:
                    videos = c_exs[0].videos.through.objects.filter(exercise_user=c_exs[0])
                elif folder_type == FOLDER_CLUB:
                    videos = c_exs[0].videos.through.objects.filter(exercise_club=c_exs[0])
                for video in videos:
                    video.pk = None
                    video.exercise_nfb = None
                    video.exercise_user = new_exs
                    video.exercise_club = None
                    video.save()
                    new_exs.videos.through.objects.add(video)
                res_data = {'videos': "OK"}
            except Exception as e:
                print(e)
                res_data = {'err': str(e)}
        return JsonResponse({"data": res_data, "success": success_status}, status=200)
    return JsonResponse({"errors": "Can't copy exercise"}, status=400)


def POST_move_exs(request, cur_user):
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
    found_folder = UserFolder.objects.filter(id=folder_id, user=cur_user)
    if found_folder.exists() and found_folder[0].id != None:
        found_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
        if found_exs.exists() and found_exs[0].id != None:
            found_exs = found_exs[0]
            found_exs.folder = found_folder[0]
            try:
                found_exs.save()
                return JsonResponse({"data": {"id": found_exs.id}, "success": True}, status=200)
            except:
                pass
    return JsonResponse({"errors": "Can't move exercise"}, status=400)


def POST_edit_exs(request, cur_user, cur_team):
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
    if folder_type == FOLDER_TEAM:
        if access_denied:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = UserFolder.objects.filter(id=folder_id)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = UserExercise.objects.filter(id=exs_id)
        if not c_exs.exists() or c_exs[0].id == None:
            c_exs = UserExercise(user=cur_user, folder=c_folder[0])
        else:
            c_exs = c_exs[0]
            c_exs.folder = c_folder[0]
            copied_from_nfb = c_exs.old_id != None
    elif folder_type == FOLDER_NFB:
        if access_denied or not cur_user.is_superuser:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        c_folder = AdminFolder.objects.filter(id=folder_id)
        if not c_folder.exists() or c_folder[0].id == None:
            return JsonResponse({"err": "Folder not found.", "success": False}, status=400)
        c_exs = AdminExercise.objects.filter(id=exs_id)
        if not c_exs.exists() or c_exs[0].id == None:
            c_exs = AdminExercise(folder=c_folder[0])
        else:
            c_exs = c_exs[0]
            c_exs.folder = c_folder[0]
    elif folder_type == FOLDER_CLUB:
        if access_denied:
            return JsonResponse({"err": "Access denied.", "success": False}, status=400)
        pass
    if c_exs == None:
            return JsonResponse({"err": "Exercise not found.", "success": False}, status=400)
    print(request.POST)
    c_exs.title = set_by_language_code(c_exs.title, request.LANGUAGE_CODE, request.POST.get("data[title]", ""))
    c_exs.description = set_by_language_code(c_exs.description, request.LANGUAGE_CODE, request.POST.get("data[description]", ""))
    c_exs.ref_goal = set_value_as_ref(request, "data[ref_goal]", None)
    c_exs.ref_ball = set_value_as_ref(request, "data[ref_ball]", None)
    c_exs.ref_team_category = set_value_as_ref(request, "data[ref_team_category]", None)
    c_exs.ref_age_category = set_value_as_ref(request, "data[ref_age_category]", None)
    c_exs.ref_train_part = set_value_as_ref(request, "data[ref_train_part]", None)
    c_exs.ref_cognitive_load = set_value_as_ref(request, "data[ref_cognitive_load]", None)

    video1_id = -1
    video2_id = -1
    animation1_id = -1
    animation2_id = -1
    if not copied_from_nfb:
        if type(c_exs.scheme_data) is dict:
            c_exs.scheme_data['scheme_1'] = request.POST.get("data[scheme_1]")
            c_exs.scheme_data['scheme_2'] = request.POST.get("data[scheme_2]")
        else:
            c_exs.scheme_data = {
                'scheme_1': request.POST.get("data[scheme_1]"),
                'scheme_2': request.POST.get("data[scheme_2]")
            }   
        video1_id = int(request.POST.get("data[video_1]")) if request.POST.get("data[video_1]").isdigit() else -1
        video2_id = int(request.POST.get("data[video_2]")) if request.POST.get("data[video_2]").isdigit() else -1
        if type(c_exs.video_data) is dict:
            c_exs.video_data['data'] = [video1_id, video2_id]
        else:
            c_exs.video_data = {'data': [video1_id, video2_id]}
        animation1_id = int(request.POST.get("data[animation_1]")) if request.POST.get("data[animation_1]").isdigit() else -1
        animation2_id = int(request.POST.get("data[animation_2]")) if request.POST.get("data[animation_2]").isdigit() else -1
        if type(c_exs.animation_data) is dict:
            c_exs.animation_data['data']['default'] = [animation1_id, animation2_id]
        else:
            c_exs.animation_data = {'data': {'custom': "", 'default': [animation1_id, animation2_id]}}
    # c_exs.notes = set_by_language_code(c_exs.notes, request.LANGUAGE_CODE, request.POST.getlist("data[notes[]]", ""), request.POST.getlist("data[notes[]][]", ""))
    try:
        c_exs.save()
        res_data = f'Exs with id: [{c_exs.id}] is added / edited successfully.'
    except Exception as e:
        return JsonResponse({"err": "Can't edit the exs.", "success": False}, status=200)
    
    video1_obj = check_video(video1_id)
    video2_obj = check_video(video2_id)
    animation1_obj = check_video(animation1_id)
    animation2_obj = check_video(animation2_id)
    try:
        if folder_type == FOLDER_TEAM:
            c_exs.videos.through.objects.update_or_create(type=1, exercise_user=c_exs, defaults={"video": video1_obj})
            c_exs.videos.through.objects.update_or_create(type=2, exercise_user=c_exs, defaults={"video": video2_obj})
            c_exs.videos.through.objects.update_or_create(type=3, exercise_user=c_exs, defaults={"video": animation1_obj})
            c_exs.videos.through.objects.update_or_create(type=4, exercise_user=c_exs, defaults={"video": animation2_obj})
        elif folder_type == FOLDER_NFB:
            c_exs.videos.through.objects.update_or_create(type=1, exercise_nfb=c_exs, defaults={"video": video1_obj})
            c_exs.videos.through.objects.update_or_create(type=2, exercise_nfb=c_exs, defaults={"video": video2_obj})
            c_exs.videos.through.objects.update_or_create(type=3, exercise_nfb=c_exs, defaults={"video": animation1_obj})
            c_exs.videos.through.objects.update_or_create(type=4, exercise_nfb=c_exs, defaults={"video": animation2_obj})
        elif folder_type == FOLDER_CLUB:
            c_exs.videos.through.objects.update_or_create(type=1, exercise_club=c_exs, defaults={"video": video1_obj})
            c_exs.videos.through.objects.update_or_create(type=2, exercise_club=c_exs, defaults={"video": video2_obj})
            c_exs.videos.through.objects.update_or_create(type=3, exercise_club=c_exs, defaults={"video": animation1_obj})
            c_exs.videos.through.objects.update_or_create(type=4, exercise_club=c_exs, defaults={"video": animation2_obj})
    except Exception as e:
        print(e)
        res_data += f'Cant add link to <ExerciseVideo>.'

    if folder_type == FOLDER_TEAM:
        found_team = UserTeam.objects.filter(id=cur_team)
        if found_team.exists() and found_team[0].id != None:
            c_exs_team_params = UserExerciseParamTeam.objects.filter(team=found_team[0], exercise_user=c_exs)
            if not c_exs_team_params.exists() or c_exs_team_params[0].id == None:
                c_exs_team_params = UserExerciseParamTeam(team=found_team[0], exercise_user=c_exs)
            else:
                c_exs_team_params = c_exs_team_params[0]
            c_exs_team_params.additional_data = set_as_object(request, c_exs_team_params.additional_data, "additional_data", request.LANGUAGE_CODE)
            c_exs_team_params.keyword = set_as_object(request, c_exs_team_params.keyword, "keyword", request.LANGUAGE_CODE)
            c_exs_team_params.stress_type = set_as_object(request, c_exs_team_params.stress_type, "stress_type", request.LANGUAGE_CODE)
            c_exs_team_params.purpose = set_as_object(request, c_exs_team_params.purpose, "purposes", request.LANGUAGE_CODE)
            c_exs_team_params.coaching = set_as_object(request, c_exs_team_params.coaching, "coaching", request.LANGUAGE_CODE)
            c_exs_team_params.note = set_as_object(request, c_exs_team_params.note, "notes", request.LANGUAGE_CODE)
            try:
                c_exs_team_params.save()
                res_data += '\nAdded team params for exs.'
            except:
                res_data += '\nCant add team params for exs.'
    elif folder_type == FOLDER_NFB:
        c_exs_team_params = UserExerciseParamTeam.objects.filter(exercise_nfb=c_exs)
        if not c_exs_team_params.exists() or c_exs_team_params[0].id == None:
            c_exs_team_params = UserExerciseParamTeam(exercise_nfb=c_exs)
        else:
            c_exs_team_params = c_exs_team_params[0]
        c_exs_team_params.additional_data = set_as_object(request, c_exs_team_params.additional_data, "additional_data", request.LANGUAGE_CODE)
        c_exs_team_params.keyword = set_as_object(request, c_exs_team_params.keyword, "keyword", request.LANGUAGE_CODE)
        c_exs_team_params.stress_type = set_as_object(request, c_exs_team_params.stress_type, "stress_type", request.LANGUAGE_CODE)
        c_exs_team_params.purpose = set_as_object(request, c_exs_team_params.purpose, "purposes", request.LANGUAGE_CODE)
        c_exs_team_params.coaching = set_as_object(request, c_exs_team_params.coaching, "coaching", request.LANGUAGE_CODE)
        c_exs_team_params.note = set_as_object(request, c_exs_team_params.note, "notes", request.LANGUAGE_CODE)
        try:
            c_exs_team_params.save()
            res_data += '\nAdded team params for exs.'
        except:
            res_data += '\nCant add team params for exs.'
    elif folder_type == FOLDER_CLUB:
        pass
    return JsonResponse({"data": res_data, "success": True}, status=200)


def POST_delete_exs(request, cur_user):
    exs_id = -1
    folder_type = request.POST.get("type", "")
    try:
        exs_id = int(request.POST.get("exs", -1))
    except:
        pass
    c_exs = None
    access_denied = False
    if folder_type == FOLDER_TEAM:
        if not access_denied:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
    elif folder_type == FOLDER_NFB:
        if not access_denied and cur_user.is_superuser:
            c_exs = AdminExercise.objects.filter(id=exs_id)
    elif folder_type == FOLDER_CLUB:
        pass
    if c_exs == None or not c_exs.exists() or c_exs[0].id == None:
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        try:
            c_exs.delete()
            return JsonResponse({"data": {"id": exs_id}, "success": True}, status=200)
        except:
            return JsonResponse({"errors": "Can't delete exercise"}, status=400)


def POST_edit_exs_user_params(request, cur_user):
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
    access_denied = False
    if folder_type == FOLDER_TEAM:
        if not access_denied:
            c_exs = UserExercise.objects.filter(id=exs_id, user=cur_user)
    elif folder_type == FOLDER_NFB:
        if not access_denied:
            c_exs = AdminExercise.objects.filter(id=exs_id)
    elif folder_type == FOLDER_CLUB:
        pass
    if c_exs != None and c_exs.exists() and c_exs[0].id != None:
        c_exs_params = None
        if folder_type == FOLDER_TEAM:
            c_exs_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0], user=cur_user)
        elif folder_type == FOLDER_NFB:
            c_exs_params = UserExerciseParam.objects.filter(exercise_nfb=c_exs[0], user=cur_user)
        elif folder_type == FOLDER_CLUB:
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
                post_value = 1
            if post_key == "watched_not":
                c_exs_params.watched = 0
                post_value = 1
            setattr(c_exs_params, post_key, post_value)
            try:
                c_exs_params.save()
                return JsonResponse({"data": {"id": exs_id, "value": post_value}, "success": True}, status=200)
            except:
                pass
        else:
            new_params = None
            if folder_type == FOLDER_TEAM:
                new_params = UserExerciseParam(exercise_user=c_exs[0], user=cur_user)
            elif folder_type == FOLDER_NFB:
                new_params = UserExerciseParam(exercise_nfb=c_exs[0], user=cur_user)
            elif folder_type == FOLDER_CLUB:
                new_params = UserExerciseParam(exercise_club=c_exs[0], user=cur_user)
            setattr(new_params, post_key, post_value)
            try:
                new_params.save()
                return JsonResponse({"data": {"id": exs_id, "value": post_value}, "success": True}, status=200)
            except:
                pass
    return JsonResponse({"errors": "Can't edit exs param"}, status=400)


def POST_count_exs(request, cur_user):
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
    try:
        found_exercises = len(get_excerises_data(folder_id, folder_type, request, cur_user))
    except:
        pass
    return JsonResponse({"data": found_exercises, "success": True}, status=200)


# Temp func
def GET_link_video_exs(request, cur_user):
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
        found_exercises = get_excerises_data(folder_id, folder_type, request, cur_user)
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
            if folder_type == FOLDER_TEAM:
                cur_exs = UserExercise.objects.filter(id=exercise['id'])
                if not cur_exs.exists() or cur_exs[0].id == None:
                    logs.append(f"Exercise with id: {exercise['id']} not found. Skipped.")
                    continue
                cur_exs[0].videos.through.objects.update_or_create(type=1, exercise_user=cur_exs[0], defaults={"video": video_1})
                cur_exs[0].videos.through.objects.update_or_create(type=2, exercise_user=cur_exs[0], defaults={"video": video_2})
                cur_exs[0].videos.through.objects.update_or_create(type=3, exercise_user=cur_exs[0], defaults={"video": animation_1})
                cur_exs[0].videos.through.objects.update_or_create(type=4, exercise_user=cur_exs[0], defaults={"video": animation_2})
                logs.append(f"Exercise with id: {exercise['id']} successfully changed.")
            elif folder_type == FOLDER_NFB:
                cur_exs = AdminExercise.objects.filter(id=exercise['id'])
                if not cur_exs.exists() or cur_exs[0].id == None:
                    logs.append(f"Exercise with id: {exercise['id']} not found. Skipped.")
                    continue
                cur_exs[0].videos.through.objects.update_or_create(type=1, exercise_nfb=cur_exs[0], defaults={"video": video_1})
                cur_exs[0].videos.through.objects.update_or_create(type=2, exercise_nfb=cur_exs[0], defaults={"video": video_2})
                cur_exs[0].videos.through.objects.update_or_create(type=3, exercise_nfb=cur_exs[0], defaults={"video": animation_1})
                cur_exs[0].videos.through.objects.update_or_create(type=4, exercise_nfb=cur_exs[0], defaults={"video": animation_2})
                logs.append(f"Exercise with id: {exercise['id']} successfully changed.")
            elif folder_type == FOLDER_CLUB:
                pass
        return JsonResponse({"logs": logs, "success": True}, status=200)
    except Exception as e:
        print(e)
        return JsonResponse({"ERR": f"Cant created or updated video in exs. {e}", "success": False}, status=400)


def GET_get_exs_all(request, cur_user):
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
    # Check if folder is USER or CLUB
    res_exs = []
    found_exercises = get_excerises_data(folder_id, folder_type, request, cur_user)
    for exercise in found_exercises:
        exs_title = get_by_language_code(exercise['title'], request.LANGUAGE_CODE)
        exs_data = {
            'id': exercise['id'], 
            'folder': exercise['folder_id'], 
            'title': exs_title,
            'has_video_1': exercise['has_video_1'],
            'has_video_2': exercise['has_video_2'],
            'has_animation_1': exercise['has_animation_1'],
            'has_animation_2': exercise['has_animation_2']
        }
        videos_arr = get_exs_video_data(exercise['video_data'])
        anims_arr = get_exs_video_data(exercise['animation_data'])
        if isinstance(anims_arr, dict):
            anims_arr = anims_arr['default']
        if folder_type == FOLDER_TEAM:
            exs_data['user'] = exercise['user_id']
        elif folder_type == FOLDER_NFB:
            exs_data['user'] = "NFB"
        elif folder_type == FOLDER_CLUB:
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
    if folder_type == FOLDER_TEAM:
        c_exs = UserExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
            res_exs['nfb'] = False
            res_exs['folder_parent_id'] = c_exs[0].folder.parent
            res_exs['copied_from_nfb'] = c_exs[0].old_id != None
        user_params = UserExerciseParam.objects.filter(exercise_user=c_exs[0].id, user=cur_user)
        if user_params.exists() and user_params[0].id != None:
            user_params = user_params.values()[0]
            res_exs['favorite'] = user_params['favorite']
            res_exs['video_1_watched'] = user_params['video_1_watched']
            res_exs['video_2_watched'] = user_params['video_2_watched']
            res_exs['animation_1_watched'] = user_params['animation_1_watched']
            res_exs['animation_2_watched'] = user_params['animation_2_watched']
        team_params = UserExerciseParamTeam.objects.filter(exercise_user=c_exs[0].id, team=cur_team)
        if team_params.exists() and team_params[0].id != None:
            team_params = team_params.values()[0]
            res_exs['additional_data'] = get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    elif folder_type == FOLDER_NFB:
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
            res_exs['additional_data'] = get_by_language_code(team_params['additional_data'], request.LANGUAGE_CODE)
            res_exs['keyword'] = get_by_language_code(team_params['keyword'], request.LANGUAGE_CODE)
            res_exs['stress_type'] = get_by_language_code(team_params['stress_type'], request.LANGUAGE_CODE)
            res_exs['purposes'] = get_by_language_code(team_params['purpose'], request.LANGUAGE_CODE)
            res_exs['coaching'] = get_by_language_code(team_params['coaching'], request.LANGUAGE_CODE)
            res_exs['notes'] = get_by_language_code(team_params['note'], request.LANGUAGE_CODE)
    elif folder_type == FOLDER_CLUB:
        pass
    else:
        if is_as_object:
            return None
        else:
            return JsonResponse({"errors": "Exercise not found.", "success": False}, status=400)
    res_exs['title'] = get_by_language_code(res_exs['title'], request.LANGUAGE_CODE)
    res_exs['description'] = get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)
    res_exs['scheme_data'] = get_exs_scheme_data(res_exs['scheme_data'])
    res_exs['video_data'] = get_exs_video_data(res_exs['video_data'])
    res_exs['animation_data'] = get_exs_animation_data(res_exs['animation_data'])
    res_exs['ref_goal'] = res_exs['ref_goal_id']
    res_exs['ref_ball'] = res_exs['ref_ball_id']
    res_exs['ref_team_category'] = res_exs['ref_team_category_id']
    res_exs['ref_age_category'] = res_exs['ref_age_category_id']
    res_exs['ref_train_part'] = res_exs['ref_train_part_id']
    res_exs['ref_cognitive_load'] = res_exs['ref_cognitive_load_id']
    res_exs = get_exs_video_data2(res_exs, c_exs[0], folder_type)

    # res_exs['stress_type'] = get_by_language_code(res_exs['stress_type'], request.LANGUAGE_CODE)
    if is_as_object:
        return res_exs
    else:
        return JsonResponse({"data": res_exs, "success": True}, status=200)


def GET_get_exs_graphic_content(request, cur_user, cur_team):
    exs_id = -1
    folder_type = request.GET.get("f_type", "")
    try:
        exs_id = int(request.GET.get("exs", -1))
    except:
        pass
    res_exs = {}
    if folder_type == FOLDER_TEAM:
        c_exs = UserExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    elif folder_type == FOLDER_NFB:
        c_exs = AdminExercise.objects.filter(id=exs_id, visible=True)
        if c_exs.exists() and c_exs[0].id != None:
            res_exs = c_exs.values()[0]
    elif folder_type == FOLDER_CLUB:
        pass
    else:
        return JsonResponse({"errors": "Exercise not found.", "success": False}, status=400)
    res_exs['description'] = get_by_language_code(res_exs['description'], request.LANGUAGE_CODE)
    res_exs['scheme_data'] = get_exs_scheme_data(res_exs['scheme_data'])
    res_exs['video_data'] = get_exs_video_data(res_exs['video_data'])
    res_exs['animation_data'] = get_exs_animation_data(res_exs['animation_data'])
    res_exs = get_exs_video_data2(res_exs, c_exs[0], folder_type)
    return JsonResponse({"data": res_exs, "success": True}, status=200)



# --------------------------------------------------
# FOLDERS API
def POST_edit_folder(request, cur_user, cur_team, c_id, parent_id):
    name = request.POST.get("name", "")
    short_name = request.POST.get("short_name", "")
    found_folder = None
    try:
        found_folder = UserFolder.objects.get(id=c_id, user=cur_user, team=cur_team) # либо проверка клубной папки
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
            found_team = UserTeam.objects.get(id=cur_team, user_id=cur_user)
            new_folder = UserFolder(name=name, short_name=short_name, parent=parent_id, user=cur_user, team=found_team)
            new_folder.save()
            new_folder.order = new_folder.id
            new_folder.save()
            res_data = {'id': new_folder.id, 'parent_id': parent_id, 'name': name, 'short_name': short_name, 'type': "add"}
        except Exception as e:
            res_data = {'type': "error", 'err': str(e)}
    return JsonResponse({"data": res_data}, status=200)


def POST_delete_folder(request, cur_user, c_id):
    res_data = {'type': "error", 'err': "Cant delete record."}
    found_folder = UserFolder.objects.get(id=c_id, user=cur_user) # либо проверка клубной папки
    if found_folder and found_folder.id != None:
        fId = found_folder.id
        try:
            found_folder.delete()
            res_data = {'id': fId, 'type': "delete"}
        except Exception as e:
            res_data = {'id': fId, 'type': "error", 'err': str(e)}
    return JsonResponse({"data": res_data}, status=200)


def POST_change_order_folder(request, cur_user):
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
        found_folder = UserFolder.objects.get(id=t_id, user=cur_user)
        if found_folder and found_folder.id != None:
            found_folder.order = t_order
            try:
                found_folder.save()
                temp_res_arr.append(f'Folder [{found_folder.id}] is order changed: {t_order}')
            except Exception as e:
                temp_res_arr.append(f'Folder [{found_folder.id}] -> ERROR / Not access or another reason')
    res_data = {'res_arr': temp_res_arr, 'type': "change_order"}
    return JsonResponse({"data": res_data}, status=200)


def GET_nfb_folders():
    folders = AdminFolder.objects.only("short_name", "name", "parent")
    res_folders = []
    for folder in folders:
        res_folders.append({'id': folder.id, 'short_name': folder.short_name, 'name': folder.name, 'parent': folder.parent})
    res_data = {'folders': res_folders, 'type': "nfb_folders"}
    return JsonResponse({"data": res_data}, status=200)


def GET_nfb_folders_set(request, cur_user, cur_team):
    is_success = True
    # Либо удалять, потом добавлять для клуба, в зависимости от вепсии пользователя и его прав
    user_old_folders = UserFolder.objects.filter(user=cur_user, team=cur_team)
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


