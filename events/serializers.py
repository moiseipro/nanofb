from rest_framework import serializers

from events.models import UserMicrocycles


class UserMicrocyclesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserMicrocycles
        fields = [
            'id', 'name', 'date_with', 'date_by'
        ]
        datatables_always_serialize = ('id',)