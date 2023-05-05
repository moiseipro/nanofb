"""
Django settings for nanofb project.

Generated by 'django-admin startproject' using Django 4.0.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.0/ref/settings/
"""
import os
from pathlib import Path
from django.utils.translation import gettext_lazy as _
from . import email_props



# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-(8i@$r9s^-es5gveieq%!ao9d&fvq(=*&s^s2w&c$!kgon&hdh'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'nanofb.pythonanywhere.com', '127.0.0.1', 'localhost', '91.245.227.74', 
    'nanofootball.com', 'www.nanofootball.com', 'http.nanofootball.com', 
    'https.nanofootball.com', 'https://www.nanofootball.com', 'https://nanofootball.com',
    'http://nanofootball.com'
]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'crispy_forms',
    'rest_framework',
    'rest_framework_datatables',
    'rest_framework.authtoken',
    'djoser',
    'taggit',
    'colorfield',
    'django_countries',
    'ckeditor',
    'ckeditor_uploader',
    'nanofootball.apps.NanofootballConfig',
    'users.apps.UsersConfig',
    'authorization.apps.AuthorizationConfig',
    'version.apps.VersionConfig',
    'video.apps.VideoConfig',
    'references.apps.ReferencesConfig',
    'exercises.apps.ExercisesConfig',
    'players.apps.PlayersConfig',
    'events.apps.EventsConfig',
    'matches.apps.MatchesConfig',
    'trainings.apps.TrainingsConfig',
    'clubs.apps.ClubsConfig',
    'schemeDrawer.apps.SchemedrawerConfig',
    'api.apps.ApiConfig',
    'analytics.apps.AnalyticsConfig',
    'system_icons.apps.SystemIconsConfig',
    'shared.apps.SharedConfig',
    'presentation.apps.PresentationConfig',
    'methodology.apps.MethodologyConfig',
    'helper_football.apps.HelperFootballConfig',
    'helper_site.apps.HelperSiteConfig',
]

CRISPY_TEMPLATE_PACK = 'bootstrap4'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # Custom
    'references.middleware.ReferencesMiddleware.TeamAndSeasons',
    'users.middleware.UsersMiddleware.LicenseValidityCheck'

]

ROOT_URLCONF = 'nanofb.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates']
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nanofb.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases
DB_localhost = {
   'ENGINE': 'django.db.backends.mysql',
    'NAME': 'nanofb',
    'USER': 'nanofb',
    'PASSWORD': 'UKQXfQ5b5U',
    'HOST': 'localhost',
    'PORT': '3306',
    'OPTIONS': {
        'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    },
}
DB_beget = {
    'ENGINE': 'django.db.backends.mysql',
    'NAME': 'nanofb_django_2',
    'USER': 'nanofb_django_2',
    'PASSWORD': 'OMGOqEokUU10',
    'HOST': 'nanofb.beget.tech',
    'PORT': '3306',
    'OPTIONS': {
        'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    },
}

DATABASES = {
    'default': DB_localhost
}


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'nanofb_cache',
    }
}


# EMAIL
EMAIL_HOST = email_props.HOST
EMAIL_PORT = email_props.PORT
EMAIL_HOST_USER = email_props.HOST_USER
EMAIL_HOST_PASSWORD = email_props.HOST_PASSWORD
EMAIL_USE_SSL = email_props.USE_SSL


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL="users.User"

# REST Framework

REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ],
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
        'rest_framework_datatables.renderers.DatatablesRenderer',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework_datatables.filters.DatatablesFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework_datatables.pagination.DatatablesPageNumberPagination',
    'PAGE_SIZE': 50,
    'DATETIME_FORMAT': "%d/%m/%Y %H:%M:%S",
    'DATE_FORMAT': "%d/%m/%Y",
    'DATE_INPUT_FORMATS': ["%d/%m/%Y"],
    'DATETIME_INPUT_FORMATS': ["%d/%m/%Y %H:%M"],
}

DJOSER = {
    'PASSWORD_RESET_CONFIRM_URL': 'login/reset_password/{uid}/{token}',
    'USERNAME_RESET_CONFIRM_URL': '#/username/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': 'login/activation/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
    'SERIALIZERS': {
        'user_create': 'authorization.serializers.UserCreateSerializer'
    },
    'EMAIL': {
        'activation': 'authorization.email.ActivationEmail',
        'confirmation': 'authorization.email.ConfirmationEmail',
    },
}

# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'ru'

LANGUAGES = (
    ('ru', _('Russian')),
    ('en', _('English')),
    ('pt', _('Portuguese')),
    ('es', _('Spanish')),
    ('de', _('German')),
    ('fr', _('French'))
)

LOCALE_PATHS = (
    os.path.join(BASE_DIR, "locale"),
)

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

MEDIA_URL = '/media/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, "static")

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CKEDITOR_UPLOAD_PATH = 'uploads/'


X_FRAME_OPTIONS = 'SAMEORIGIN'

