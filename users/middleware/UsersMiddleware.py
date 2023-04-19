from django.shortcuts import redirect

from references.models import UserTeam, ClubTeam, ClubSeason, UserSeason
from datetime import date

# The function of limiting the use of the program by subscription
class LicenseValidityCheck:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        print(request.path)
        if not request.path == "/user/profile":
            if not request.user.is_anonymous and not request.user.is_superuser:
                if request.user.is_archive == 1:
                    print("Пользователь в архиве")
                    return redirect('users:profile')
                elif request.user.club_id is not None:
                    if request.user.club_id.date_registration_to < date.today():
                        print("Лицензия клуба истекла")
                        return redirect('users:profile')
                else:
                    if request.user.registration_to < date.today():
                        print("Лицензия истекла")
                        return redirect('users:profile')

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response