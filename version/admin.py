from django.contrib import admin
from .models import Section, Version

# Register your models here.
admin.site.register([Section, Version])