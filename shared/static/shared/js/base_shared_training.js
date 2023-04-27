$(window).on('load', function () {
    $('.calculate-name').each(function( index ) {
        let name_obj = $(this)
        let names = $.parseJSON(name_obj.attr('data-value').replace(/\'/g, '"'));
        name_obj.find('.title').text(get_translation_name(names))
        console.log(get_translation_name(names))
    })

    let items = $('.video-js');
    for (let i = 0; i < items.length; i++) {
        let tId = $(items[i]).attr('id');
        videojs($(`#${tId}`)[0], {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    }
})