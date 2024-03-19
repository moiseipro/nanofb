from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
import shared.v_api as v_api
import analytics.v_api as analytics_v_api
from users.models import User



def shared_link_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        add_link_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            add_link_status = int(request.POST.get("add_link", 0))
        except:
            pass
        if add_link_status == 1:
            return v_api.POST_add_link(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_link_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            get_link_status = int(request.GET.get("get_link", 0))
        except:
            pass
        if get_link_status == 1:
            return v_api.GET_get_link(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)


@csrf_exempt
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def shared_link(request):
    res = v_api.GET_get_link(request)
    if res:
        return v_api.GET_get_link(request)
    else:
        return redirect("authorization:login")


@csrf_exempt
@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def shared_link_api_anonymous(request):
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "GET" and is_ajax:
        get_analytics_all_status = 0
        get_analytics_blocks_status = 0
        try:
            get_analytics_all_status = int(request.GET.get("get_analytics_all", 0))
        except:
            pass
        try:
            get_analytics_blocks_status = int(request.GET.get("get_analytics_blocks", 0))
        except:
            pass
        if get_analytics_all_status == 1:
            user_id = 0
            team_id = 0
            season_id = 0
            try:
                user_id = int(request.GET.get("user", 0))
            except:
                pass
            try:
                team_id = int(request.GET.get("team", 0))
            except:
                pass
            try:
                season_id = int(request.GET.get("season", 0))
            except:
                pass
            return analytics_v_api.GET_get_analytics_in_team(request, None, None, None, {
                'user': user_id, 'club': request.GET.get("club", ""),
                'team': team_id, 'season': season_id,
                'season_type': request.GET.get("season_type", "")
            })
        elif get_analytics_blocks_status == 1:
            user_id = 0
            team_id = 0
            season_id = 0
            try:
                user_id = int(request.GET.get("user", 0))
            except:
                pass
            try:
                team_id = int(request.GET.get("team", 0))
            except:
                pass
            try:
                season_id = int(request.GET.get("season", 0))
            except:
                pass
            return analytics_v_api.GET_get_analytics_blocks(request, None, None, None, {
                'user': user_id, 'club': request.GET.get("club", ""),
                'team': team_id, 'season': season_id,
                'season_type': request.GET.get("season_type", "")
            })
    else:
        return JsonResponse({"errors": "access_error"}, status=400)
