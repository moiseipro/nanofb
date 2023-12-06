from datetime import date, timedelta, datetime
from django.utils.timezone import now

from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalNumberFilter(GlobalFilter, filters.NumberFilter):
    pass


class GlobalDateFilter(GlobalFilter, filters.DateFilter):
    pass


class UserPaymentGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""

    date = GlobalDateFilter()
    payment_before = GlobalDateFilter()
    payment = GlobalCharFilter(lookup_expr='exact')
    user_id = GlobalCharFilter(lookup_expr='exact')



    class Meta:
        #model = User
        fields = ['date', 'payment_before', 'payment', 'user_id']


class ClubPaymentGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""

    date = GlobalDateFilter()
    payment_before = GlobalDateFilter()
    payment = GlobalCharFilter(lookup_expr='exact')
    club_id = GlobalCharFilter(lookup_expr='exact')



    class Meta:
        #model = User
        fields = ['date', 'payment_before', 'payment', 'club_id']
