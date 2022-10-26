from references.models import UserTeam, ClubTeam, ClubSeason, UserSeason


class TeamAndSeasons:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        if request.user.club_id is not None:
            request.teams_list = ClubTeam.objects.filter(club_id=request.user.club_id, users=request.user)
            request.seasons_list = ClubSeason.objects.filter(club_id=request.user.club_id)
        else:
            request.teams_list = UserTeam.objects.filter(user_id=request.user)
            request.seasons_list = UserSeason.objects.filter(user_id=request.user)

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response