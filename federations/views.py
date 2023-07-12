from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions


# Create your views here.
from rest_framework.response import Response

from federations.models import Federation
from federations.serializers import FederationSerializer


class FederationPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['federations.federation_admin'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['federations.federation_admin'],
        'PUT': ['federations.federation_admin'],
        'PATCH': ['federations.federation_admin'],
        'DELETE': ['federations.federation_admin'],
    }


class BaseFederationView(LoginRequiredMixin, TemplateView):
    redirect_field_name = "authorization:login"
    template_name = 'federations/federation_panel.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context


# class FederationUsersViewSet(viewsets.ModelViewSet):
#     filter_backends = (DatatablesFilterBackend,)
#     filterset_fields = '__all__'
#     filterset_class = VideoGlobalFilter
#
#     def create(self, request, *args, **kwargs):
#         print(request.data)
#         users = User.objects.filter(club_id=self.request.user.club_id)
#         if len(users) < self.request.user.club_id.user_limit:
#             print(request.data)
#             try:
#                 validate_email(request.data['email'])
#             except ValidationError as e:
#                 res_data = {'registration': _("A user with this Email already exists!")}
#                 return Response(res_data, status=status.HTTP_403_FORBIDDEN, headers=e)
#             serializer_personal = UserPersonalSerializer(data=request.data)
#             serializer_personal.is_valid(raise_exception=True)
#             serializer_personal.save()
#             print(serializer_personal.data)
#             password = User.objects.make_random_password()
#             userDict = dict(
#                 personal=serializer_personal.data['id'],
#                 email=request.data['email'],
#                 password=password,
#                 club_id=self.request.user.club_id.id
#             )
#             query_dict = QueryDict('', mutable=True)
#             query_dict.update(userDict)
#             print(query_dict)
#             serializer = ClubUserCreateSerializer(data=userDict)
#             serializer.is_valid(raise_exception=True)
#             self.perform_create(serializer)
#             headers = self.get_success_headers(serializer.data)
#
#             res_data = {'registration': _("Registration success!")}
#             res_data.update(serializer.data)
#             context = {'email': request.data['email'], 'password': password}
#             text_content = render_to_string('clubs/mail/email.txt', context)
#             html_content = render_to_string('clubs/mail/email.html', context)
#
#             email = EmailMultiAlternatives(_('Registration on the Nanofootball website'), text_content)
#             email.attach_alternative(html_content, "text/html")
#             email.to = [request.data['email']]
#             email.send()
#             return Response(res_data, status=status.HTTP_201_CREATED, headers=headers)
#         else:
#             return Response({'limit': 'user_limit'}, status=status.HTTP_403_FORBIDDEN)
#
#     @action(detail=True, methods=['post'])
#     def change_permission(self, request, pk=None):
#         data = request.data
#
#         user_edit = User.objects.get(id=pk, club_id=request.user.club_id)
#         print(user_edit.groups.all())
#         group = Group.objects.get(id=data['group_id'])
#         print(data)
#         if group in user_edit.groups.all():
#             user_edit.groups.remove(group)
#             return Response({'status': 'group_removed'})
#         else:
#             user_edit.groups.add(group)
#             return Response({'status': 'group_added'})
#
#     @action(detail=True, methods=['post'])
#     def edit_user(self, request, pk=None):
#         instance = User.objects.get(pk=pk)
#         serializer = UserEditSerializer(instance, data=self.request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             response = {
#                 'status': 'success',
#                 'message': _('User data is saved!'),
#                 'data': serializer.data
#             }
#             return Response(response, status=status.HTTP_200_OK)
#         else:
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     def retrieve(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance)
#         return Response(serializer.data)
#
#     def get_permissions(self):
#         permission_classes = [ClubPermissions]
#         return [permission() for permission in permission_classes]
#
#     def get_serializer_class(self):
#         return UserManagementSerializer
#
#     def get_queryset(self):
#         users = User.objects.filter(club_id=self.request.user.club_id)
#         result = users
#         print(result)
#         return result


class FederationViewSet(viewsets.ModelViewSet):

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_permissions(self):
        permission_classes = [FederationPermissions]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return FederationSerializer

    def get_queryset(self):
        club = Federation.objects.filter(id=self.request.user.club_id.id)
        result = club
        print(result)
        return result
