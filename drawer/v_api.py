from django.http import JsonResponse
from django.db.models import Sum, Q
from users.models import User
from drawer.models import AdminDraw, UserDraw, ClubDraw, AdminBackPicture, UserBackPicture, ClubBackPicture
import random, string
import base64
from django.core.files.base import ContentFile
import json



def get_random_string_sequence(length):
    characters = string.ascii_letters + string.digits
    result = ''.join(random.choice(characters) for i in range(length))
    return result


def img_url_convert(img_url):
    """
    Return converted url string in case success else empty string.

    """
    img_url = f"{img_url}"
    if "drawer/img/" not in img_url:
        return ""
    return f"/media/{img_url}"

# --------------------------------------------------
# DRAWER API
def POST_add_back_picture(request, cur_user):
    img_type = request.POST.get("i_type", "")
    c_img = request.FILES.get('file_image')
    if c_img is None or not c_img:
        return JsonResponse({"err": "img_none", "success": False}, status=400)
    img_instance = None
    if img_type == "nf":
        if not cur_user.is_superuser:
            return JsonResponse({"err": "access_denied", "success": False}, status=400)
        img_instance = AdminBackPicture()
        img_instance.name = get_random_string_sequence(16)
        img_instance.img = c_img
    elif img_type == "user":
        IMGS_MAX_COUNT = 10
        imgs_count = -1
        if request.user.club_id is not None:
            imgs_count = ClubBackPicture.objects.filter(club=request.user.club_id).count()
        else:
            imgs_count = UserBackPicture.objects.filter(user=cur_user).count()
        if imgs_count < 0 or imgs_count > IMGS_MAX_COUNT:
            return JsonResponse({"err": "max_count", "success": False}, status=400)
        if request.user.club_id is not None:
            img_instance = ClubBackPicture(club=request.user.club_id, user=cur_user)
        else:
            img_instance = UserBackPicture(user=cur_user)
        img_instance.name = get_random_string_sequence(16)
        img_instance.img = c_img
    if img_instance is not None:
        try:
            img_instance.save()
        except Exception as e:
            return JsonResponse({"err": "adding_err", "err_text": e, "success": False}, status=400)
        return JsonResponse({"err": "", "success": True}, status=200)
    return JsonResponse({"err": "type_err", "success": False}, status=400)


def POST_delete_back_picture(request, cur_user):
    img_name = request.POST.get("name", "")
    img_type = request.POST.get("i_type", "")
    img_instance = None
    if img_type == "nf":
        if not cur_user.is_superuser:
            return JsonResponse({"err": "access_denied", "success": False}, status=400)
        img_instance = AdminBackPicture.objects.filter(name=img_name).first()
    elif img_type == "user":
        if request.user.club_id is not None:
            img_instance = ClubBackPicture.objects.filter(name=img_name, club=request.user.club_id).first()
        else:
            img_instance = UserBackPicture.objects.filter(name=img_name, user=cur_user).first()
    if img_instance:
        try:
            img_instance.img.delete(save=True) # deleting image's file
            img_instance.delete()
        except Exception as e:
           return JsonResponse({"err": "deleting_err", "err_text": e, "success": False}, status=400)
        return JsonResponse({"err": "", "success": True}, status=200) 
    return JsonResponse({"err": "type_err", "success": False}, status=400)


def POST_save_drawing(request, cur_user):
    draw_id = request.POST.get("id", "")
    draw_data_str = request.POST.get("data", "")
    rendered_img = request.POST.get("rendered_img", "")
    draw_instance = None
    draw_data = None
    try:
        draw_data = json.loads(draw_data_str)
    except:
        pass
    if cur_user.is_superuser:
        draw_instance = AdminDraw.objects.filter(name=draw_id).first()
    else:
        if request.user.club_id is not None:
            draw_instance = ClubDraw.objects.filter(name=draw_id, club=request.user.club_id).first()
        else:
            draw_instance = UserDraw.objects.filter(name=draw_id, user=cur_user).first()
    if draw_instance is None:
        new_name = get_random_string_sequence(16)
        if cur_user.is_superuser:
            draw_instance = AdminDraw(name=new_name)
        else:
            if request.user.club_id is not None:
                draw_instance = ClubDraw(name=new_name, club=request.user.club_id)
            else:
                draw_instance = UserDraw(name=new_name, user=cur_user)
    draw_instance.elements = draw_data
    rendered_img_obj = None
    draw_name = ""
    try:
        format, imgstr = rendered_img.split(';base64,')
        ext = format.split('/')[-1]
        rendered_img_obj = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)
    except Exception as e:
        pass
    if rendered_img_obj:
        draw_instance.rendered_img = rendered_img_obj
    try:
        draw_instance.save()
        draw_name = draw_instance.name
    except Exception as e:
        return JsonResponse({"err": "saving_err", "err_text": e, "success": False}, status=400)
    
    return JsonResponse({"err": "", "id": draw_name, "success": True}, status=200)



def GET_get_back_pictures(request, cur_user):
    img_type = request.GET.get("i_type", "")
    res_data = []
    imgs = None
    if img_type == "nf":
        imgs = AdminBackPicture.objects.filter()
    elif img_type == "user":
        if request.user.club_id is not None:
            imgs = ClubBackPicture.objects.filter(club=request.user.club_id)
        else:
            imgs = UserBackPicture.objects.filter(user=cur_user)
    if imgs is not None:
        for img in imgs:
            res_data.append({'name': img.name, 'url': img_url_convert(img.img)})
    return JsonResponse({"data": res_data, "success": True}, status=200)


def GET_get_drawing(request, cur_user):
    draw_id = request.GET.get("id", "")
    draw_data = None
    draw_instance = None
    if cur_user.is_superuser:
        draw_instance = AdminDraw.objects.filter(name=draw_id).first()
    else:
        if request.user.club_id is not None:
            draw_instance = ClubDraw.objects.filter(name=draw_id, club=request.user.club_id).first()
        else:
            draw_instance = UserDraw.objects.filter(name=draw_id, user=cur_user).first()
    if draw_instance is not None:
        draw_data = draw_instance.elements
    return JsonResponse({"data": draw_data, "success": True}, status=200)
