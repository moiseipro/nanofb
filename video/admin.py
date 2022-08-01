from django.contrib import admin
from video.models import Video, VideoTags

# Register your models here.
admin.site.register([Video, VideoTags])