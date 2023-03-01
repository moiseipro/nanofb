from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter

from users.models import User


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


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
    date_birthsday = filters.DateFilter(field_name='personal__date_birthsday')

    last_name = GlobalCharFilter(field_name='personal__last_name', lookup_expr='icontains')
    first_name = GlobalCharFilter(field_name='personal__first_name', lookup_expr='icontains')
    job_title = GlobalCharFilter(field_name='personal__job_title', lookup_expr='icontains')
    license = GlobalCharFilter(field_name='personal__license', lookup_expr='icontains')
    p_version = GlobalCharFilter(field_name='p_version__name', lookup_expr='icontains')


    class Meta:
        #model = User
        fields = ['registration_to', 'date_birthsday', 'last_name', 'first_name', 'job_title', 'license', 'p_version']