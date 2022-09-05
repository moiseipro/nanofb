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


class GlobalModelChoiceFilter(GlobalFilter, filters.ModelChoiceFilter):
    pass


class GlobalTagFilter(filters.CharFilter):
    def filter(self, qs, value):
        if value:
            tags = [tag.strip() for tag in value.split(',')]
            qs = qs.filter(taggit__name__in=tags).distinct()

        return qs
    pass


class VideoGlobalFilter(DatatablesFilterSet):
    """Filter name, artist and genre by name with icontains"""

    name = GlobalCharFilter(field_name='name', lookup_expr='icontains')
    # videosource_name = GlobalModelMultipleChoiceFilter(
    #     field_name='videosource_id__name',
    #     queryset=VideoSource.objects.all(),
    #     lookup_expr='icontains'
    # )
    videosource_name = filters.CharFilter(
        field_name='videosource_id__name',
        lookup_expr='icontains'
    )
    taggit = GlobalTagFilter(field_name="taggit")

    class Meta:
        model = Video
        fields = ['taggit', 'id', 'duration', 'name', 'upload_date', 'videosource_name']