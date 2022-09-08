from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authtoken.models import Token
from api.models import APIToken
from users.models import User
import exercises.v_api as v_api



def check_token(get_token):
    f_user = False
    users_with_api = User.objects.filter(is_api_access=True).only("club_id")
    if users_with_api.exists() and users_with_api[0].id != None:
        for user in users_with_api:
            token, created = Token.objects.get_or_create(user=user)
            api_token, created = APIToken.objects.update_or_create(user=user, defaults={"token": token.key})
        found_api_token = APIToken.objects.filter(token=get_token)
        if found_api_token.exists() and found_api_token[0].id != None:
            f_user = found_api_token[0].user
    return f_user



@csrf_exempt
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def exercises(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    token = request.data.get('token', "")
    cur_user = check_token(token)
    if not cur_user or not is_ajax:
        return JsonResponse({"err": "Access denied!"}, status=400)
    request.GET = request.data
    get_exs_all_status = 0
    get_exs_one_status = 0
    try:
        get_exs_all_status = int(request.GET.get("get_exs_all", 0))
    except:
        pass
    try:
        get_exs_one_status = int(request.GET.get("get_exs_one", 0))
    except:
        pass
    if get_exs_all_status == 1:
        return v_api.GET_get_exs_all(request, cur_user)
    elif get_exs_one_status == 1:
        cur_team = -1
        try:
            cur_team = int(request.GET.get('team', -1))
        except:
            pass
        return v_api.GET_get_exs_one(request, cur_user, cur_team)
    return JsonResponse({"err": "Access denied!"}, status=400)

