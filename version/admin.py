from django.contrib import admin
from .models import Section, Access, Version, VersionAccess

# Register your models here.
admin.site.register([Section, Access, Version, VersionAccess])