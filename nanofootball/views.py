from django.shortcuts import render, redirect


def default_page(request):
    if request.user.is_authenticated:
        return redirect("users:profile")
    return render(request, 'base/base_page.html')


def view_404(request, exception=None):
    return redirect('nanofootball:default_page')
