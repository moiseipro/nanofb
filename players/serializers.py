from rest_framework import serializers

from players.models import UserPlayer


class UserPlayerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    full_name = serializers.CharField(
        source="get_part_name",
        read_only=True
    )

    class Meta:
        model = UserPlayer
        fields = [
            'id', 'full_name'
        ]