from django.db.models import IntegerField
from django.db.models.functions import Cast
from django_filters import filters
from rest_framework_datatables.django_filters.filterset import DatatablesFilterSet
from rest_framework_datatables.django_filters.filters import GlobalFilter, SwitchRegexFilter
from taggit.models import Tag

from references.models import VideoSource
from video.models import Video


class GlobalCharFilter(GlobalFilter, filters.CharFilter):
    pass


class GlobalModelMultipleChoiceFilter(filters.ModelMultipleChoiceFilter):
    pass


class GlobalAllValuesMultipleFilter(filters.CharFilter):
    def filter(self, qs, value):
        if value:
            chooses = [choose.strip() for choose in value.split(',')]
            print(chooses)
            qs = qs.filter(id__in=chooses).distinct()

        return qs

    pass


class GlobalExerciseFilter(filters.CharFilter):
    def filter(self, qs, value):
        if value:
            short_name = value
            qs = qs.filter(adminexercise__folder__short_name__exact=short_name)
        return qs
    pass


class GlobalTagFilter(filters.CharFilter):
    def filter(self, qs, value):
        if value:
            tags = [tag.strip() for tag in value.split(',')]
            print(tags)
            qs = qs.filter(taggit__name__in=tags).distinct()

        return qs
    pass


class VideoGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""
    id = GlobalAllValuesMultipleFilter(
        field_name='id',
        #lookup_expr='icontains'
        #lookup_expr='in'
    )

    name = GlobalCharFilter(field_name='name', lookup_expr='icontains')
    # videosource_name = GlobalModelMultipleChoiceFilter(
    #     field_name='videosource_id__name',
    #     queryset=VideoSource.objects.all(),
    #     lookup_expr='icontains'
    # )
    videosource_name = filters.CharFilter(
        field_name='videosource_id__name',
        lookup_expr='exact'
    )
    exercises = GlobalExerciseFilter(
        field_name='adminexercise__folder__id',
        lookup_expr='icontains'
    )
    duration = filters.CharFilter(
        field_name='duration',
        lookup_expr='icontains'
    )
    favourites = filters.CharFilter(
        field_name='favourites',
        lookup_expr='icontains'
    )
    taggit = GlobalTagFilter(field_name="taggit")

    class Meta:
        #model = Video
        fields = ['taggit', 'id', 'exercises', 'duration', 'name', 'upload_date', 'videosource_name', 'favourites']