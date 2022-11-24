from django.shortcuts import render, redirect
from django.contrib.auth.models import Group, Permission



def default_page(request):
    if request.user.is_authenticated:
        return redirect("users:profile")
    return render(request, 'base/base_page.html')


def view_404(request, exception=None):
    return redirect('nanofootball:default_page')




def util_check_access(user, permissions = {'group_user': None, 'group_club': None, 'perms_user': [], 'perms_club': []}):
    if user.club_id is not None:
        if 'group_club' in permissions and permissions['group_club']:
            p_group = Group.objects.get(text_id=permissions['group_club'])
            if p_group != None:
                for permission in p_group.permissions:
                    if not user.has_perm(permission):
                        return False
        if 'perms_club' in permissions and isinstance(permissions['perms_club'], list):
            for permission in permissions['perms_club']:
                    if not user.has_perm(permission):
                        return False
    else:
        if 'group_user' in permissions and permissions['group_user']:
            p_group = Group.objects.get(text_id=permissions['group_user'])
            if p_group != None:
                for permission in p_group.permissions:
                    if not user.has_perm(permission):
                        return False
        if 'perms_user' in permissions and isinstance(permissions['perms_user'], list):
            for permission in permissions['perms_user']:
                    if not user.has_perm(permission):
                        return False
    return True

