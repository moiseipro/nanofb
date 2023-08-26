from references.models import UserTeam, ClubTeam, ClubSeason, UserSeason


class TeamAndSeasons:
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


class AutoSelectTeamAndSeasons:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        if not request.user.is_anonymous:
            if 'season' not in request.session or request.session['season'] is None or request.session['season'] == '':
                if request.user.club_id is not None:
                    request.session['season'] = str(ClubSeason.objects.filter(club_id=request.user.club_id).last().id)
                else:
                    request.session['season'] = str(UserSeason.objects.filter(user_id=request.user).last().id)
            if 'team' not in request.session or request.session['team'] is None or request.session['team'] == '':
                if request.user.club_id is not None:
                    if request.user.has_perm('clubs.club_admin'):
                        request.session['team'] = str(ClubTeam.objects.filter(club_id=request.user.club_id).last().id)
                    else:
                        request.session['team'] = str(ClubTeam.objects.filter(club_id=request.user.club_id, users=request.user).last().id)
                else:
                    request.session['team'] = str(UserTeam.objects.filter(user_id=request.user).last().id)

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response