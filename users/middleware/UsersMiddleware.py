from references.models import UserTeam, ClubTeam, ClubSeason, UserSeason

# The function of limiting the use of the program by subscription
class LicenseValidityCheck:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        if not request.user.is_anonymous:
            if request.user.club_id is not None:
                if request.user.has_perm('clubs.club_admin'):
                    request.teams_list = ClubTeam.objects.filter(club_id=request.user.club_id)
                else:
                    request.teams_list = ClubTeam.objects.filter(club_id=request.user.club_id, users=request.user)
                request.seasons_list = ClubSeason.objects.filter(club_id=request.user.club_id)
            else:
                request.teams_list = UserTeam.objects.filter(user_id=request.user)
                request.seasons_list = UserSeason.objects.filter(user_id=request.user)

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response