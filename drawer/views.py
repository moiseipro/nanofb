from django.shortcuts import render, redirect
from django.http import JsonResponse
from users.models import User
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.contrib.staticfiles.utils import get_files
from django.contrib.staticfiles.storage import StaticFilesStorage
import os
from nanofb.settings import STATIC_URL
import xml.etree.ElementTree as ET
import base64

# https://konvajs.org/docs/index.html

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
            f_name = c_file.split('\\')[1]
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
    svg_path = svg_path[1:]
    print(style_str)
    svg = None
    try:
        ET.register_namespace('', "http://www.w3.org/2000/svg")
        tree = ET.parse(svg_path)
        root = tree.getroot()
        root.set('style', style_str)
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
    draw_id = request.GET.get("id", "")
    print(f"id: {draw_id}")
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


def drawer_api(request):
    pass
