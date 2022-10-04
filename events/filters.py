from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter

from events.models import UserEvent


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalDateTimeFromToRangeFilter(filters.DateTimeFromToRangeFilter):
    pass


class GlobalDateFromToRangeFilter(filters.DateFromToRangeFilter):
    pass


class EventGlobalFilter(DatatablesFilterSet):

    # date = GlobalDateTimeFromToRangeFilter(
    #     field_name="date",
    # )
    only_date = GlobalDateTimeFromToRangeFilter(
        field_name="only_date",

    )

    class Meta:
        model = UserEvent
        fields = ['only_date', 'date']
