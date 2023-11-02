from datetime import date, timedelta, datetime
from django.utils.timezone import now

from django.contrib.auth.models import Permission, Group
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
            #print(date.today()-timedelta(days=30))
            qs = qs.filter(date_joined__gte=date.today()-timedelta(days=30))
        return qs


class GlobalAccessToFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            print(date.today()+timedelta(days=30))
            qs = qs.filter(Q(club_id__isnull=True) & Q(registration_to__lte=date.today()+timedelta(days=30))).order_by('registration_to')

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
            perm = Group.objects.filter(permissions__codename__in=('club_admin', 'federation_admin'))
            qs = qs.filter(Q(is_staff=True) | Q(is_superuser=True) | Q(groups__in=perm)).distinct()
            print(qs)
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


class NotificationUserManagementGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""

    date_receiving = GlobalDateFilter()

    user = GlobalCharFilter(field_name='user', lookup_expr='exact')
    notification = GlobalCharFilter(field_name='notification', lookup_expr='exact')



    class Meta:
        #model = User
        fields = ['notification', 'user', 'date_receiving', 'viewed', 'favorites']