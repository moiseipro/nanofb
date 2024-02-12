from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalNumberFilter(GlobalFilter, filters.NumberFilter):
    pass


class GlobalDateFilter(GlobalFilter, filters.DateFilter):
    pass


class ObjectivesGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""

    short_name = GlobalCharFilter(field_name='short_name', lookup_expr='icontains')
    name = GlobalCharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        #model = User
        fields = ['short_name', 'name']