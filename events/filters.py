from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter

from events.models import UserEvent


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalDateFromToRangeFilter(GlobalFilter, filters.DateFromToRangeFilter):
    pass


class EventGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""

    date = GlobalDateFromToRangeFilter()

    class Meta:
        model = UserEvent
        fields = ['date']
