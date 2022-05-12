from django.contrib import admin
from users.models import User, UserPersonal


admin.site.register(User)
admin.site.register(UserPersonal)