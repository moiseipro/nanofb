from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from users.models import User
from users.serializers import UserSerializer


# Create your views here.
class BaseClubView(LoginRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'clubs/admin_panel.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # context['update_form'] = UpdateVideoForm()
        return context


class ClubUsersViewSet(viewsets.ModelViewSet):
    # filter_backends = (DatatablesFilterBackend,)
    # filterset_class = VideoGlobalFilter

    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return UserSerializer

    def get_queryset(self):
        users = User.objects.filter(club_id=self.request.user.club_id)
        result = users
        print(result)
        return result