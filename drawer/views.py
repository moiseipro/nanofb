from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from users.models import User
from drawer.models import AdminDraw, UserDraw, ClubDraw
import drawer.v_api as v_api
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.contrib.staticfiles.utils import get_files
from django.contrib.staticfiles.storage import StaticFilesStorage
from django.core.files.base import ContentFile
import os
from nanofb.settings import STATIC_URL
import xml.etree.ElementTree as ET
import base64

# https://nanofootballdraw.ru/canvas/edit/

def get_assets_paths(c_obj, group=None, g_type=None, g_type_2=None, c_style=""):
    data = []
    if group is None:
        return c_obj
    s = StaticFilesStorage()
    t_path = f'drawer/img/assets/{group}'
    if g_type is not None:
        t_path += f'/{g_type}'
        if g_type_2 is not None:
            t_path += f'/{g_type_2}'
    files = list(get_files(s, location=t_path))
    for c_file in files:
            f_path = os.path.join(STATIC_URL, c_file)
            f_name = os.path.basename(c_file)
            data.append({
                'name': f_name,
                'path': f_path,
                'group': group,
                'g_type': g_type,
                'g_type_2': g_type_2,
                'style_class': c_style
            })
    if g_type is not None:
        if not group in c_obj:
            c_obj[group] = {}
        if g_type_2 is not None:
            if not g_type in c_obj[group]:
                c_obj[group][g_type] = {}
            c_obj[group][g_type][g_type_2] = data
        else:
            c_obj[group][g_type] = data
    else:
        c_obj[group] = data
    return c_obj


def drawings(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    return render(request, 'drawer/base_drawings.html', {})


@xframe_options_sameorigin
def get_icon(request):
    svg_path = request.GET.get("url", "")
    style_str = request.GET.get("style", "")
    value_text_str = request.GET.get("value_text", "")
    svg_path = svg_path[1:]
    svg = None
    try:
        ET.register_namespace('', "http://www.w3.org/2000/svg")
        tree = ET.parse(svg_path)
        root = tree.getroot()
        root.set('style', style_str)
        if value_text_str != "":
            text_tag = root.find("{http://www.w3.org/2000/svg}text")
            text_tag.text = value_text_str
        svg = ET.tostring(root, encoding="unicode", method="html")
        svg = base64.b64encode(bytes(svg, 'utf-8'))
        svg = f"{svg}"
        svg = svg[2:len(svg)-1] # remove <b'> from start and <'> from end of svg's string
    except:
        return JsonResponse({"success": False}, status=400)
    return JsonResponse({"data": svg, "success": True}, status=200)


@xframe_options_sameorigin
def drawer(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    t_assets = {}
    t_assets = get_assets_paths(t_assets, "plane", None, None, "arat3_2")
    t_assets = get_assets_paths(t_assets, "gate", None, None, "arat1_1 darkback")
    t_assets = get_assets_paths(t_assets, "equipment", "ball", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "cone", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "small_cone", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "flag", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "beam", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "cone_beam", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "ring", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "stick", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "barrier", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "equipment", "ladder", None, "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult", "back", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult", "front", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult", "left", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult", "right", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult_goalkeeper", "back", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult_goalkeeper", "front", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult_goalkeeper", "left", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "adult_goalkeeper", "right", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child", "back", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child", "front", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child", "left", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child", "right", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child_goalkeeper", "back", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child_goalkeeper", "front", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child_goalkeeper", "left", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "child_goalkeeper", "right", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "referee", "back", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "referee", "front", "arat1_1")
    t_assets = get_assets_paths(t_assets, "player", "referee", "left", "arat1_1")
    t_assets = get_assets_paths(t_assets, "bezier", "with_arrow", None, "arat150_50 grayback")
    t_assets = get_assets_paths(t_assets, "bezier", "without_arrow", None, "arat150_50 grayback")
    t_assets = get_assets_paths(t_assets, "shape", None, None, "arat1_1 grayback")
    t_assets = get_assets_paths(t_assets, "caps", None, None, "")
    return render(request, 'drawer/modules/drawer.html', {'assets': t_assets})


@xframe_options_sameorigin
def rendered(request):
    if not request.user.is_authenticated:
        return redirect("authorization:login")
    cur_user = User.objects.filter(email=request.user).only("club_id")
    cur_team = -1
    try:
        cur_team = int(request.session['team'])
    except:
        pass
    draw_id = request.GET.get("id", "")
    draw_instance = None
    img_url = None
    if cur_user[0].is_superuser:
        draw_instance = AdminDraw.objects.filter(name=draw_id).first()
    else:
        if request.user.club_id is not None:
            draw_instance = ClubDraw.objects.filter(name=draw_id, club=request.user.club_id).first()
        else:
            draw_instance = UserDraw.objects.filter(name=draw_id, user=cur_user).first()
    try:
        if draw_instance is not None:
            img_url = draw_instance.rendered_img.url
    except Exception as e:
        pass
    response = redirect(img_url)
    return response


def drawer_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"errors": "authenticate_err"}, status=400)
    is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
    if request.method == "POST" and is_ajax:
        add_back_picture_status = 0
        delete_back_picture_status = 0
        save_drawing_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            add_back_picture_status = int(request.POST.get("add_back_picture", 0))
        except:
            pass
        try:
            delete_back_picture_status = int(request.POST.get("delete_back_picture", 0))
        except:
            pass
        try:
            save_drawing_status = int(request.POST.get("save_drawing", 0))
        except:
            pass
        if add_back_picture_status == 1:
            return v_api.POST_add_back_picture(request, cur_user[0])
        elif delete_back_picture_status == 1:
            return v_api.POST_delete_back_picture(request, cur_user[0])
        elif save_drawing_status == 1:
            return v_api.POST_save_drawing(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    elif request.method == "GET" and is_ajax:
        get_back_pictures_status = 0
        get_drawing_status = 0
        cur_user = User.objects.filter(email=request.user).only("id")
        cur_team = -1
        try:
            cur_team = int(request.session['team'])
        except:
            pass
        if not cur_user.exists() or cur_user[0].id == None:
            return JsonResponse({"errors": "trouble_with_user"}, status=400)
        try:
            get_back_pictures_status = int(request.GET.get("get_back_pictures", 0))
        except:
            pass
        try:
            get_drawing_status = int(request.GET.get("get_drawing", 0))
        except:
            pass
        if get_back_pictures_status == 1:
            return v_api.GET_get_back_pictures(request, cur_user[0])
        elif get_drawing_status == 1:
            return v_api.GET_get_drawing(request, cur_user[0])
        return JsonResponse({"errors": "access_error"}, status=400)
    else:
        return JsonResponse({"errors": "access_error"}, status=400)

