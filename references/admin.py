from django.contrib import admin
<<<<<<< HEAD
from references.models import VideoSource
from references.models import ExsBall, ExsGoal, ExsWorkoutPart, ExsCognitiveLoad, ExsCategory
from references.models import ExsPurpose, ExsStressType, ExsCoaching
=======
from references.models import VideoSource, ExsBall, UserSeason
>>>>>>> 9ded976b875389ff09a9a86bb3e7d17c615b80d6

# Register your models here.
admin.site.register([VideoSource, ExsBall])

<<<<<<< HEAD
admin.site.register(ExsBall)
admin.site.register(ExsGoal)
admin.site.register(ExsWorkoutPart)
admin.site.register(ExsCognitiveLoad)
admin.site.register(ExsCategory)

admin.site.register(ExsPurpose)
admin.site.register(ExsStressType)
admin.site.register(ExsCoaching)

=======
#For Test
admin.site.register([UserSeason])
>>>>>>> 9ded976b875389ff09a9a86bb3e7d17c615b80d6
