from notifications.models import Notification, NotificationUser
from rest_framework import serializers


class NotificationBaseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'content'
        ]
        datatables_always_serialize = ('id',)


class NotificationSerializer(NotificationBaseSerializer):
    class Meta(NotificationBaseSerializer.Meta):
        pass

    Meta.fields += ('users', 'date_update')


class NotificationUserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(
        source='notification.title',
        read_only=True
    )
    # notification = serializers.IntegerField()
    # user = serializers.IntegerField()

    class Meta:
        model = NotificationUser
        fields = [
            'id', 'date_receiving', 'notification', 'title', 'user', 'viewed', 'favorites'
        ]
        datatables_always_serialize = ('id',)