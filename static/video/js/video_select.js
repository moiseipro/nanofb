function RenderVideo(value, windowElem) {
    try {
        windowElem.pause();
    } catch(e) {}
    if (!value || value == -1) {
        $('#videoSelectorModal').find('input.video-link').val('');
        return;
    }
    get_video_ids(value)
    .then(data => {
        if (data) {
            if ('nftv' in data['links'] && data['links']['nftv'] != '') {
                $('#videoSelectorModal').find('input.video-link').val(`https://nanofootball.pro/video/player/${data['links']['nftv']}`);
                windowElem.src({type: 'video/mp4', src: `https://nanofootball.pro/video/player/${data['links']['nftv']}`});
                windowElem.poster(`https://nanofootball.pro/video/poster/${data['links']['nftv']}`);
            } else if ('youtube' in data['links'] && data['links']['youtube'] != '') {
                $('#videoSelectorModal').find('input.video-link').val(`https://www.youtube.com/watch?v=${data['links']['youtube']}`);
                windowElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${data['links']['youtube']}`});
                windowElem.poster('');
            }
        }
    })
    .catch(err => {});
}

function formatState(state) {
    if (!state.id) {
        return state.text;
    }
    var $state = $(
        '<span>' + state.text + '</span>' + '<span class="float-right">(' + state.element.getAttribute('data-count') + ')</span>'
    );
    return $state;
}
function formatFolders(state) {
    if (!state.id) {
        return state.text;
    }
    var $state = $(
        '<span>' + state.text + '</span>' + '<span class="float-right">(' + state.element.getAttribute('value') + ')</span>'
    );
    return $state;
};

$(function() {
    $('#videoSelectorModal').on('click', '.btn-copy', (e) => {
        let link = $('#videoSelectorModal').find('input.video-link').val();
        navigator.clipboard.writeText(link);
        swal("Скопировано", "Ссылка видео скопирована в буфер обмена.", "success");
    });
    // For videos' filter
    $('.video-source').select2({
        templateResult: formatState,
    });
    $('.exercise-folder').select2({
        templateResult: formatFolders,
    });
    $('.video-source').on('change', function () {
        let data_source = $(this).val();
        video_table.columns([2]).search(data_source).draw();
    });
    $('.exercise-folder').on('change', function () {
        let data_folder = $(this).val();
        video_table.columns([3]).search(data_folder).draw();
    });
    $('.video-tags-filter').on('change', function () {
        let data_tag = $(this).val();
        video_table.columns([7]).search(data_tag).draw();
    });
    $('.video-search').on('keyup', function () {
        let data_search = $(this).val();
        video_table.search(data_search).draw();
    });
    $('#video-filters-clear').on('click', function () {
        $('.video-source').val(null).trigger('change');
        $('.exercise-folder').val(null).trigger('change');
        $('.video-tags-filter').val(null).trigger('change');
        $('.video-search').val('').trigger('change');
        video_table.search('').draw();
        // $('.video-list-container').find('input[type="search"]').val('').change();
        // video_table.columns([1]).search('').draw();
    });
    // END For videos' filter

    // Video controlling
    window.currentVideoId = -1;
    try {
        window.videoPlayerInModal = videojs('video-player-modal', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    } catch (e) {}
    try {
        generate_ajax_video_table('60vh');

        video_table
            .on( 'select', (e, dt, type, indexes) => {
                let rowData = video_table.rows( indexes ).data().toArray();
                if (type=='row') {
                    let currentData = rowData[0];
                    window.currentVideoId = currentData.id;
                    RenderVideo(currentData.id, window.videoPlayerInModal);
                }
            })
            .on( 'deselect', (e, dt, type, indexes) => {});
        $('#video').on('click', 'tr', (e) => {
            let isSelected = $(e.currentTarget).hasClass('selected');
            if (!isSelected) {
                RenderVideo(-1, window.videoPlayerInModal);
            }
        });
    } catch(e) {}
})