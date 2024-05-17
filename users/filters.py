from datetime import date, timedelta, datetime
from django.utils.timezone import now

from django.contrib.auth.models import Permission, Group
from django.db.models import Q, Prefetch
from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter

from notifications.models import NotificationUser
from references.models import UserPaymentInformation, ClubPaymentInformation
from users.models import User


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalNumberFilter(GlobalFilter, filters.NumberFilter):
    pass


class GlobalDateFilter(GlobalFilter, filters.DateFilter):
    pass


class GlobalBoolCallFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        print(value)
        if value:
            if self.distinct:
                qs = qs.distinct()
            qs = qs.order_by("-marks__call", "-marks__call2")
        return qs


class GlobalBoolVipFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        print(value)
        if value:
            if self.distinct:
                qs = qs.distinct()
            qs = qs.order_by("-marks__vip")
        return qs


class GlobalNotificationsFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            qs = qs.filter(notificationuser__in=NotificationUser.objects.all()).distinct()
        return qs


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
        print(value)
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


class GlobalPaymentUserFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            if self.distinct:
                qs = qs.distinct()
            print(now()-timedelta(minutes=5))
            payments_user = UserPaymentInformation.objects.all().order_by('-payment_before')
            payments_club = ClubPaymentInformation.objects.all().order_by('-payment_before')
            # if payments.count() > 0:
            #     data = str(payments[0].payment)
            qs = qs.filter(Q(userpaymentinformation__in=payments_user) |
                           Q(club_id__clubpaymentinformation__in=payments_club)).distinct()
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

            is_empty_club = False

            for choose in chooses:
                if choose == '-1':
                    is_empty_club = True

            if is_empty_club:
                qs = qs.filter(club_id=None)
            else:
                qs = qs.filter(club_id_id__in=chooses)

        return qs


class GlobalGroupFilter(GlobalFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value:
            chooses = [choose.strip() for choose in value.split(',')]
            print(chooses)
            if self.distinct:
                qs = qs.distinct()

            is_empty_club = False

            for choose in chooses:
                if choose == '-1':
                    is_empty_club = True

            if is_empty_club:
                qs = qs.filter(group=None)
            else:
                qs = qs.filter(group__in=chooses)

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
    access_to = GlobalAccessToFilter(field_name='registration_to')
    notifications_count = GlobalNotificationsFilter()
    payment_user = GlobalPaymentUserFilter()

    date_birthsday = GlobalDateFilter(field_name='personal__date_birthsday')
    last_name = GlobalNameFilter(field_name='personal__last_name', lookup_expr='icontains')
    first_name = GlobalNameFilter(field_name='personal__first_name', lookup_expr='icontains')
    job_title = GlobalCharFilter(field_name='personal__job_title', lookup_expr='icontains')
    license = GlobalCharFilter(field_name='personal__license', lookup_expr='icontains')
    flag = GlobalFlagFilter(field_name='personal__country_id', lookup_expr='icontains')
    license_date = GlobalDateFilter(field_name='personal__license_date')
    phone = GlobalCharFilter(field_name='personal__phone', lookup_expr='icontains')
    region = GlobalCharFilter(field_name='personal__region', lookup_expr='icontains')

    club_name = GlobalCharFilter(field_name='club_id__name', lookup_expr='icontains')

    p_version = GlobalVersionFilter(field_name='p_version__id', lookup_expr='exact')
    club_id = GlobalClubFilter(field_name='club_id__id', lookup_expr='exact')
    group = GlobalGroupFilter(field_name='group', lookup_expr='exact')

    class Meta:
        #model = User
        fields = ['registration_to', 'date_birthsday', 'last_name', 'first_name', 'job_title', 'license', 'p_version',
                  'club_id', 'distributor', 'is_archive', 'online', 'access_to', 'notifications_count', 'group',
                  'payment_user', 'marks', 'marks.call', 'marks.call2']