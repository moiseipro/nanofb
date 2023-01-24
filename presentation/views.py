from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
import nf_presentation
import json

from events.models import ClubEvent, UserEvent
from events.serializers import ClubEventSerializer, UserEventSerializer


class BasePresentationPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


# REST FRAMEWORK
class TrainingPresentationViewSet(viewsets.ModelViewSet):
    permission_classes = [BasePresentationPermissions]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        json_training = json.loads(JSONRenderer().render(serializer.data))
        #print(json_training)
        pptx_bytes = nf_presentation.from_event(input_data=json_training)
        response = HttpResponse(pptx_bytes, content_type='application/vnd.ms-powerpoint')
        response['Content-Disposition'] = 'attachement; filename="out.pptx"'
        return response

    def get_serializer_class(self):
        if self.request.user.club_id is not None:
            serial = ClubEventSerializer
        else:
            serial = UserEventSerializer
        return serial

    def get_queryset(self):
        if self.request.user.club_id is not None:
            events = ClubEvent.objects.filter(club_id=self.request.user.club_id)
        else:
            events = UserEvent.objects.filter(user_id=self.request.user)

        return events