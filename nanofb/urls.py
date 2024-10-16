"""nanofb URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.i18n import i18n_patterns
from django.views.i18n import JavaScriptCatalog
from django.conf.urls.static import static
from django.conf import settings


handler404 = 'nanofootball.views.view_404' 

urlpatterns = [
    path('api-auth/', include(('rest_framework.urls', 'rest_framework'), namespace='rest_framework')),
    #path('auth/', include('djoser.urls')),
    #path('auth/', include('djoser.urls.jwt')),
    #path('auth/', include('djoser.urls.authtoken')),

    path('', include(('nanofootball.urls', 'nanofootball'), namespace='nanofootball')),
    path('admin/', admin.site.urls),
    path('login/', include(('authorization.urls', 'authorization'), namespace='authorization')),
    path('user/', include(('users.urls', 'users'), namespace='users')),
    path('version/', include(('version.urls', 'version'), namespace='version')),
    path('video/', include(('video.urls', 'video'), namespace='video')),
    path('exercises/', include(('exercises.urls', 'exercises'), namespace='exercises')),
    path('players/', include(('players.urls', 'players'), namespace='players')),
    path('matches/', include(('matches.urls', 'matches'), namespace='matches')),
    path('trainings/', include(('trainings.urls', 'trainings'), namespace='trainings')),
    path('events/', include(('events.urls', 'events'), namespace='events')),
    path('references/', include(('references.urls', 'references'), namespace='references')),
    path('analytics/', include(('analytics.urls', 'analytics'), namespace='analytics')),
    path('clubs/', include(('clubs.urls', 'clubs'), namespace='clubs')),
    path('federations/', include(('federations.urls', 'federations'), namespace='federations')),
    path('shared/', include(('shared.urls', 'shared'), namespace='shared')),
    path('presentation/', include(('presentation.urls', 'presentation'), namespace='presentation')),
    path('methodology/', include(('methodology.urls', 'methodology'), namespace='methodology')),
    path('medicine/', include(('medicine.urls', 'medicine'), namespace='medicine')),
    path('helper_football/', include(('helper_football.urls', 'helper_football'), namespace='helper_football')),
    path('helper_site/', include(('helper_site.urls', 'helper_site'), namespace='helper_site')),
    path('drawer/', include(('drawer.urls', 'drawer'), namespace='drawer')),
    path('notifications/', include(('notifications.urls', 'notifications'), namespace='notification')),

    path('i18n/', include('django.conf.urls.i18n')),
    path('schemeDrawer/', include(('schemeDrawer.urls', 'schemeDrawer'), namespace='schemeDrawer')),
    path('api/', include(('api.urls', 'api'), namespace='api')),
]

urlpatterns += i18n_patterns(
    # Translations in Javascript
    path('jsi18n/', JavaScriptCatalog.as_view(), name='javascript-catalog'),
)

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

