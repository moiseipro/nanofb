from rest_framework import serializers

from matches.models import UserMatch


class UserMatchSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserMatch
        fields = [
            'event_id', 'team_id'
        ]
        datatables_always_serialize = ('event_id',)