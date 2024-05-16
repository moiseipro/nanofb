from datetime import date, timedelta, datetime
from django.utils.timezone import now

from django.contrib.auth.models import Permission, Group
from django.db.models import Q, Prefetch
from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalNumberFilter(GlobalFilter, filters.NumberFilter):
    pass


class GlobalDateFilter(GlobalFilter, filters.DateFilter):
    pass