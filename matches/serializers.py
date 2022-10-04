from rest_framework import serializers

from matches.models import UserMatch


class UserMatchSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = UserMatch
        fields = [
            'event_id', 'team_id', 'm_type'
        ]
        datatables_always_serialize = ('event_id', 'm_type')