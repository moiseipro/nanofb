from django.db.models import Q
from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter

from users.models import User


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalNumberFilter(GlobalFilter, filters.NumberFilter):
    pass


class GlobalNameFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            qs = qs.filter(Q(personal__last_name__icontains=value) | Q(personal__first_name__icontains=value))
        return qs


class GlobalFlagFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            qs = qs.filter(Q(personal__last_name__icontains=value) | Q(personal__first_name__icontains=value))
        return qs


class GlobalModelMultipleChoiceFilter(filters.ModelMultipleChoiceFilter):
    pass


class GlobalAdminFilter(filters.CharFilter):
    def filter(self, qs, value):
        if value:
            chooses = [choose.strip() for choose in value.split(',')]
            print(chooses)
            qs = qs.order_by('user_permissions')

        return qs

    pass


class UserManagementGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""

    registration_to = filters.DateFilter()
    email = GlobalNameFilter(field_name='email', lookup_expr='icontains')
    date_last_login = filters.DateFilter()
    date_joined = filters.DateFilter()

    date_birthsday = filters.DateFilter(field_name='personal__date_birthsday')
    last_name = GlobalNameFilter(field_name='personal__last_name', lookup_expr='icontains')
    first_name = GlobalNameFilter(field_name='personal__first_name', lookup_expr='icontains')
    job_title = GlobalCharFilter(field_name='personal__job_title', lookup_expr='icontains')
    license = GlobalCharFilter(field_name='personal__license', lookup_expr='icontains')
    flag = GlobalCharFilter(field_name='personal__country_id', lookup_expr='icontains')
    license = GlobalCharFilter(field_name='personal__license', lookup_expr='icontains')
    license_date = filters.DateFilter(field_name='personal__license_date')
    phone = GlobalCharFilter(field_name='personal__phone', lookup_expr='icontains')

    club_name = GlobalCharFilter(field_name='club_id__name', lookup_expr='icontains')

    p_version = GlobalNumberFilter(field_name='p_version__id', lookup_expr='exact')



    class Meta:
        #model = User
        fields = ['registration_to', 'date_birthsday', 'last_name', 'first_name', 'job_title', 'license', 'p_version']