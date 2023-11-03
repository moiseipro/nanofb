from notifications.models import NotificationUser
from django.utils.timezone import now, localtime


class NotificationsCountMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        notifications_count = NotificationUser.objects.filter(user=request.user, viewed=False, date_receiving__lte=now()).count()
        request.notifications_count = notifications_count

        response = self.get_response(request)

        return response