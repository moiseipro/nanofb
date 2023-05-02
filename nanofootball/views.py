from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import Group, Permission
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string


def default_page(request):
    if request.user.is_authenticated:
        return redirect("users:profile")
    return render(request, 'base/base_page.html')


def view_404(request, exception=None):
    return redirect('nanofootball:default_page')


@csrf_exempt
def send_feedback(request):
    is_success = False
    status_code = 400
    try:
        context = {
            'name': request.POST.get("name", ""),
            'email': request.POST.get("email", ""),
            'phone': request.POST.get("phone", ""),
            'club': request.POST.get("club", ""),
        }
        # text_content = render_to_string('nanofootball/mail/email.txt', context)
        # html_content = render_to_string('nanofootball/mail/email.html', context)
        text_content = f"""
            Запрос на регистрацию: (форма обратной связи)
                ФИО: {context['name']}
                Email: {context['email']}
                Телефон: {context['phone']}
                Клуб: {context['club']}
        """
        html_content = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Запрос на регистрацию: (форма обратной связи)</title>
            </head>
            <body>
                <p>Запрос на регистрацию: (форма обратной связи)</p>
                <p>
                    ФИО: {context['name']} <br>
                    Email: {context['email']} <br>
                    Телефон: {context['phone']} <br>
                    Клуб: {context['club']}
                </p>
            </body>
            </html>
        """
        email = EmailMultiAlternatives("Запрос на регистрацию: (форма обратной связи)", text_content)
        email.attach_alternative(html_content, "text/html")
        email.to = ["admin@nanofootball.ru"]
        email.send()
        is_success = True
        status_code = 200
    except Exception as e:
        pass
    return JsonResponse({"errors": "", "success": is_success}, status=status_code)



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

