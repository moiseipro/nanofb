from datetime import date, timedelta, datetime
from django.utils.timezone import now

from django.contrib.auth.models import Permission
from django.db.models import Q
from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter

from users.models import User


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalNumberFilter(GlobalFilter, filters.NumberFilter):
    pass


class GlobalDateFilter(GlobalFilter, filters.DateFilter):
    pass


class GlobalJoinDateFilter(GlobalFilter, filters.DateFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            print(date.today()-timedelta(days=3))
            qs = qs.filter(date_joined__gte=date.today()-timedelta(days=3))
        return qs


class GlobalArchiveFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            qs = qs.filter(is_archive=True)
        else:
            qs = qs.filter(is_archive=False)
        return qs


class GlobalOnlineFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            print(now()-timedelta(minutes=5))
            qs = qs.filter(date_last_login__gte=now()-timedelta(minutes=5))
        return qs


class GlobalDistributorFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            qs = qs.exclude(Q(distributor__isnull=True) | Q(distributor=''))
        return qs


class GlobalAdminTypeFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            perm = Permission.objects.filter(codename__in=('club_admin', 'federation_admin'))
            qs = qs.filter(Q(is_staff=True) | Q(is_superuser=True) | Q(user_permissions__in=perm))
        return qs


class GlobalClubFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            chooses = [choose.strip() for choose in value.split(',')]
            print(chooses)

            if self.distinct:
                qs = qs.distinct()

            qs = qs.filter(club_id_id__in=chooses)
        return qs


class GlobalVersionFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            chooses = [choose.strip() for choose in value.split(',')]
            print(chooses)

            if self.distinct:
                qs = qs.distinct()

            qs = qs.filter(p_version_id__in=chooses)
        return qs


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
            qs = qs.filter(personal__country_id=value)
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

    registration_to = GlobalDateFilter()
    email = GlobalNameFilter(field_name='email', lookup_expr='icontains')
    date_last_login = GlobalDateFilter()
    date_joined = GlobalJoinDateFilter()
    distributor = GlobalDistributorFilter()
    admin_type = GlobalAdminTypeFilter()
    is_archive = GlobalArchiveFilter()
    online = GlobalOnlineFilter()

    date_birthsday = GlobalDateFilter(field_name='personal__date_birthsday')
    last_name = GlobalNameFilter(field_name='personal__last_name', lookup_expr='icontains')
    first_name = GlobalNameFilter(field_name='personal__first_name', lookup_expr='icontains')
    job_title = GlobalCharFilter(field_name='personal__job_title', lookup_expr='icontains')
    license = GlobalCharFilter(field_name='personal__license', lookup_expr='icontains')
    flag = GlobalFlagFilter(field_name='personal__country_id', lookup_expr='icontains')
    license = GlobalCharFilter(field_name='personal__license', lookup_expr='icontains')
    license_date = GlobalDateFilter(field_name='personal__license_date')
    phone = GlobalCharFilter(field_name='personal__phone', lookup_expr='icontains')
    region = GlobalCharFilter(field_name='personal__region', lookup_expr='icontains')

    club_name = GlobalCharFilter(field_name='club_id__name', lookup_expr='icontains')

    p_version = GlobalVersionFilter(field_name='p_version__id', lookup_expr='exact')
    club_id = GlobalClubFilter(field_name='club_id__id', lookup_expr='exact')



    class Meta:
        #model = User
        fields = ['registration_to', 'date_birthsday', 'last_name', 'first_name', 'job_title', 'license', 'p_version',
                  'club_id', 'distributor', 'is_archive', 'online']