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


handler404 = 'nanofootball.views.view_404' 

urlpatterns = [
    path('api-auth/', include(('rest_framework.urls', 'rest_framework'), namespace='rest_framework')),

    path('', include(('nanofootball.urls', 'nanofootball'), namespace='nanofootball')),
    path('admin/', admin.site.urls),
    path('login/', include(('authorization.urls', 'authorization'), namespace='authorization')),
    path('user/', include(('users.urls', 'users'), namespace='users')),
    path('version/', include(('version.urls', 'version'), namespace='version')),
    path('video/', include(('video.urls', 'video'), namespace='video')),
    path('exercises/', include(('exercises.urls', 'exercises'), namespace='exercises')),
    path('matches/', include(('matches.urls', 'matches'), namespace='matches')),
    path('trainings/', include(('trainings.urls', 'trainings'), namespace='trainings')),
    path('events/', include(('events.urls', 'events'), namespace='events')),
    path('references/', include(('references.urls', 'references'), namespace='references')),

    path('i18n/', include('django.conf.urls.i18n')),
]

urlpatterns += i18n_patterns(
    # Translations in Javascript
    path('jsi18n/', JavaScriptCatalog.as_view(), name='javascript-catalog'),
)