from django.contrib import admin
from .models import Section, Access, Version

# Register your models here.
admin.site.register([Section, Access, Version])