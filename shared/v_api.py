from datetime import datetime, date
from django.utils import timezone
import json
import random
import string
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.sites.shortcuts import get_current_site
from trainings.models import UserTraining, ClubTraining, LiteTraining
from trainings.serializers import UserTrainingSerializer, ClubTrainingSerializer, LiteTrainingSerializer
from shared.models import SharedLink
from exercises.models import AdminExercise, UserExercise, ClubExercise
import exercises.v_api as exercises_v_api
import analytics.v_api as analytics_v_api
from users.models import User
import nanofootball.utils as utils


def date_from_string(request, name, def_value = None):
    format_ddmmyyyy = "%d/%m/%Y"
    format_yyyymmdd = "%Y-%m-%d"
    res = def_value
    try:
        res = request.POST.get(name, def_value)
    except:
        pass
    flag = False
    t_date = None
    try:
        t_date = datetime.strptime(res, format_ddmmyyyy)
    except:
        flag = True
    try:
        t_date = datetime.strptime(res, format_yyyymmdd)
        flag = False
    except:
        flag = True if flag else False
    if flag:
        res = None
    if t_date:
        now = datetime.now()
        if now > t_date:
            res = None
        else:
            res = t_date.strftime(format_yyyymmdd)
    return res   


def generate_link_str(length=10):
    characters = string.ascii_letters + string.digits
    g_link = ''.join(random.choice(characters) for i in range(length))
    return g_link


def check_link_expiration(c_link):
    now = timezone.now()
    if now > c_link.expiration_date:
        try:
            c_link.delete()
        except Exception as e:
            print(e)
            pass
        return False
    return True
# --------------------------------------------------
# SHARED API
def POST_add_link(request, cur_user):
    c_id = -1
    c_type = request.POST.get("type", "")
    c_expire_date = date_from_string(request, "expire_date", None)
    c_options = {}
    try:
        c_id = int(request.POST.get("id", -1))
    except:
        pass
    try:
        c_options = json.loads(request.POST.get("options", "{}"))
    except:
        pass
    if not c_expire_date:
        return JsonResponse({"errors": "Expire date not correct.", "type": "date"}, status=400)
    c_dict = {
        'user': cur_user,
        'expiration_date': c_expire_date,
        'language': request.LANGUAGE_CODE,
        'options': c_options
    }
    f_obj = None
    if c_type == "exercise_team_folders":
        if request.user.club_id is not None:
            f_obj = ClubExercise.objects.get(id=c_id, club=request.user.club_id)
            if f_obj and f_obj.id != None:
                c_dict['exercise_club'] = f_obj
                c_dict['club'] = request.user.club_id
        else:
            f_obj = UserExercise.objects.get(id=c_id, user=cur_user)
            if f_obj and f_obj.id != None:
                c_dict['exercise_user'] = f_obj
    elif c_type == "exercise_nfb_folders":
        pass
    elif c_type == "exercise_club_folders":
        pass
    elif c_type == "training_user":
        f_obj = UserTraining.objects.get(event_id=c_id)
        if f_obj and f_obj.event_id != None:
            c_dict['training_user'] = f_obj
    elif c_type == "training_club":
        f_obj = ClubTraining.objects.get(event_id=c_id)
        if f_obj and f_obj.event_id != None:
            c_dict['training_club'] = f_obj
    elif c_type == "training_lite":
        f_obj = LiteTraining.objects.get(event_id=c_id)
        if f_obj and f_obj.event_id != None:
            c_dict['training_lite'] = f_obj
    elif c_type == "analytics":
        cur_team = -1
        cur_season = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        try:
            cur_season = int(request.session['season'])
        except:
            pass
        f_obj = "analytics"
        c_dict['analytics'] = {
            'table_type': request.POST.get("table_type", ""),
            'user': "",
            'club': "",
            'team': cur_team,
            'season': cur_season,
            'season_type': request.POST.get("season_type", "")
        }
        if request.user.club_id is not None:
            c_dict['analytics']['club'] = request.user.club_id
        else:
            c_dict['analytics']['user'] = cur_user.id
    if f_obj:
        new_link = SharedLink(**c_dict)
        try:
            new_link.link = generate_link_str(24)
            new_link.save()
            domain = get_current_site(request).domain
            t_link = f"http://{domain}/shared?link={new_link.link}"
            return JsonResponse({"data": {"link": t_link}, "success": True}, status=200)
        except Exception as e:
            pass
    return JsonResponse({"errors": "Can't create link", "type": "link"}, status=400)



def GET_get_link(request, cur_user=None):
    c_id = -1
    c_type = request.GET.get("type", "")
    try:
        c_id = int(request.GET.get("id", -1))
    except:
        pass
    c_link = None
    if cur_user:
        f_dict = {'user': cur_user}
        f_obj = None
        if c_type == "exercise_team_folders":
            if request.user.club_id is not None:
                f_obj = ClubExercise.objects.get(id=c_id, club=request.user.club_id)
                if f_obj and f_obj.id != None:
                    f_dict['exercise_club'] = f_obj
                    f_dict['club'] = request.user.club_id
            else:
                f_obj = UserExercise.objects.get(id=c_id, user=cur_user)
                if f_obj and f_obj.id != None:
                    f_dict['exercise_user'] = f_obj
        elif c_type == "exercise_nfb_folders":
            pass
        elif c_type == "exercise_club_folders":
            pass
        elif c_type == "training_user":
            f_obj = UserTraining.objects.get(event_id=c_id)
            if f_obj and f_obj.event_id != None:
                f_dict['training_user'] = f_obj
        elif c_type == "training_club":
            f_obj = ClubTraining.objects.get(event_id=c_id)
            if f_obj and f_obj.event_id != None:
                f_dict['training_club'] = f_obj
        elif c_type == "training_lite":
            f_obj = LiteTraining.objects.get(event_id=c_id)
            if f_obj and f_obj.event_id != None:
                f_dict['training_lite'] = f_obj
        elif c_type == "analytics":
            f_obj = "analytics"
            cur_team = -1
            cur_season = -1
            try:
                cur_team = int(request.session['team'])
            except:
                pass
            try:
                cur_season = int(request.session['season'])
            except:
                pass
            f_dict['analytics'] = {
                'table_type': request.GET.get("table_type", ""),
                'user': "",
                'club': "",
                'team': cur_team,
                'season': cur_season,
                'season_type': request.GET.get("season_type", "")
            }
            if request.user.club_id is not None:
                f_dict['analytics']['club'] = request.user.club_id
            else:
                f_dict['analytics']['user'] = cur_user.id
        if f_obj:
            c_link = SharedLink.objects.filter(**f_dict).first()
    else:
        link_text = request.GET.get("link", "")
        c_link = SharedLink.objects.filter(link=link_text).first()
    if c_link and c_link.id != None:
        is_link_valid = check_link_expiration(c_link)
        if is_link_valid:
            if cur_user:
                domain = get_current_site(request).domain
                t_link = f"http://{domain}/shared?link={c_link.link}"
                return JsonResponse({"data": {"link": t_link}, "success": True}, status=200)
            else:
                c_html_file = None
                request.LANGUAGE_CODE = c_link.language if c_link.language else utils.LANG_CODE_DEFAULT
                data = {'options': c_link.options}
                if c_link.exercise_nfb != None:
                    pass
                elif c_link.exercise_user != None:
                    c_html_file = "shared/base_shared_exercise.html"
                    request.user.temp_club = None
                    data['exercise'] = exercises_v_api.GET_get_exs_one(request, -1, -1, {'f_type': utils.FOLDER_TEAM, 'exs': c_link.exercise_user.id})
                elif c_link.exercise_club != None:
                    c_html_file = "shared/base_shared_exercise.html"
                    request.user.temp_club = c_link.club
                    data['exercise'] = exercises_v_api.GET_get_exs_one(request, -1, -1, {'f_type': utils.FOLDER_TEAM, 'exs': c_link.exercise_club.id})
                elif c_link.training_user != None:
                    c_html_file = "shared/base_shared_training.html"
                    c_data = c_link.training_user
                    cloned_data = {}
                    for _exercise in c_data.exercises.all():
                        if _exercise.clone_nfb_id == None:
                            continue
                        found_exs = None
                        try:
                            found_exs = AdminExercise.objects.filter(id=_exercise.clone_nfb_id, visible=True).first()
                        except:
                            pass
                        if found_exs:
                            cloned_data[_exercise.id] = {
                                'scheme_1': found_exs.scheme_1,
                                'scheme_2': found_exs.scheme_2,
                                'description': found_exs.description
                            }
                    data['training'] = UserTrainingSerializer(c_data).data
                    for _exercise in data['training']['exercises_info']:
                        if _exercise['exercise_id'] in cloned_data:
                            _exercise['scheme_1'] = cloned_data[_exercise['exercise_id']]['scheme_1']
                            _exercise['scheme_2'] = cloned_data[_exercise['exercise_id']]['scheme_2']
                            _exercise['description'] = cloned_data[_exercise['exercise_id']]['description']
                        _exercise['description'] = utils.get_by_language_code(_exercise['description'], request.LANGUAGE_CODE)
                elif c_link.training_club != None:
                    c_html_file = "shared/base_shared_training.html"
                    c_data = c_link.training_club
                    cloned_data = {}
                    for _exercise in c_data.exercises.all():
                        if _exercise.clone_nfb_id == None:
                            continue
                        found_exs = None
                        try:
                            found_exs = AdminExercise.objects.filter(id=_exercise.clone_nfb_id, visible=True).first()
                        except:
                            pass
                        if found_exs:
                            cloned_data[_exercise.id] = {
                                'scheme_1': found_exs.scheme_1,
                                'scheme_2': found_exs.scheme_2,
                                'description': found_exs.description
                            }
                    data['training'] = ClubTrainingSerializer(c_data).data
                    for _exercise in data['training']['exercises_info']:
                        if _exercise['exercise_id'] in cloned_data:
                            _exercise['scheme_1'] = cloned_data[_exercise['exercise_id']]['scheme_1']
                            _exercise['scheme_2'] = cloned_data[_exercise['exercise_id']]['scheme_2']
                            _exercise['description'] = cloned_data[_exercise['exercise_id']]['description']
                        _exercise['description'] = utils.get_by_language_code(_exercise['description'], request.LANGUAGE_CODE)
                elif c_link.training_lite != None:
                    c_html_file = "shared/base_shared_training.html"
                    c_data = c_link.training_lite
                    cloned_data = {}
                    for _exercise in c_data.exercises.all():
                        if _exercise.clone_nfb_id == None:
                            continue
                        found_exs = None
                        try:
                            found_exs = AdminExercise.objects.filter(id=_exercise.clone_nfb_id, visible=True).first()
                        except:
                            pass
                        if found_exs:
                            cloned_data[_exercise.id] = {
                                'scheme_1': found_exs.scheme_1,
                                'scheme_2': found_exs.scheme_2,
                                'description': found_exs.description
                            }
                    data['training'] = LiteTrainingSerializer(c_data).data
                    for _exercise in data['training']['exercises_info']:
                        if _exercise['exercise_id'] in cloned_data:
                            _exercise['scheme_1'] = cloned_data[_exercise['exercise_id']]['scheme_1']
                            _exercise['scheme_2'] = cloned_data[_exercise['exercise_id']]['scheme_2']
                            _exercise['description'] = cloned_data[_exercise['exercise_id']]['description']
                        _exercise['description'] = utils.get_by_language_code(_exercise['description'], request.LANGUAGE_CODE)
                elif c_link.analytics != None:
                    c_html_file = "shared/base_shared_analytics.html"
                    cur_user = User.objects.filter(id=c_link.analytics['user']).first()
                    request.user.club_id = c_link.analytics['club'] if c_link.analytics['club'] != "" else None
                    data['analytics'] = c_link.analytics
                    data['folders'] = analytics_v_api.get_exs_folders(request, cur_user, c_link.analytics['team'])
                    data['months'] = analytics_v_api.get_season_months(request, c_link.analytics['season'], cur_user)
                    data['training_blocks'] = analytics_v_api.get_trainings_blocks(request, cur_user)
                if c_html_file:
                    return render(request, c_html_file, data)
    if cur_user:
        return JsonResponse({"errors": "Can't find link"}, status=400)
    else:
        return False
