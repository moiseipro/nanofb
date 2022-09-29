$(function() {
    $('#splitCol_exscard_2').on('click', '.carousel-item', (e) => {
        e.preventDefault();
        $('#exerciseGraphicsModal').find('.modal-body').find('.carousel-item').each((ind, elem) => {
            $(elem).removeClass('active');
            $(elem).remove();
        });
        let parentId = $(e.currentTarget).parent().parent().attr('id');
        let items = $('#carouselSchema').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselSchema") {$(items).removeClass('active');}
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);

        items = $('#carouselVideo').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselVideo") {$(items).removeClass('active');}
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if ($(item).find('.video-js').length > 0) {
                $(item).find('.video-js').removeClass('not-active');
                $(item).find('.video-js').attr('id', `video-playerClone-${i}`);
            }
        }
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        window.videoPlayerClones = [];
        for (let i = 0; i < items.length; i++) {
            window.videoPlayerClones[i] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            });
            window.videoPlayerClones[i].ready((e) => {
                if (i == 0) {
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard1.currentType(),
                        src: window.videoPlayerCard1.currentSrc()
                    });
                } else if (i == 1) {
                    window.videoPlayerClones[i].src({
                        type: window.videoPlayerCard2.currentType(),
                        src: window.videoPlayerCard2.currentSrc()
                    });
                }
            });
        }

        items = $('#carouselAnim').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselAnim") {$(items).removeClass('active');}
        let videoPlayersLength = window.videoPlayerClones.length;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if ($(item).find('.video-js').length > 0) {
                $(item).find('.video-js').removeClass('not-active');
                $(item).find('.video-js').attr('id', `video-playerClone-${i + videoPlayersLength}`);
            }
        }
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        for (let i = 0; i < items.length; i++) {
            window.videoPlayerClones[i + videoPlayersLength] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i + videoPlayersLength}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            });
            window.videoPlayerClones[i + videoPlayersLength].ready((e) => {
                if (i == 0) {
                    window.videoPlayerClones[i + videoPlayersLength].src({
                        type: window.videoPlayerCard3.currentType(),
                        src: window.videoPlayerCard3.currentSrc()
                    });
                } else if (i == 1) {
                    window.videoPlayerClones[i + videoPlayersLength].src({
                        type: window.videoPlayerCard4.currentType(),
                        src: window.videoPlayerCard4.currentSrc()
                    });
                }
            });
        }

        $('#exerciseGraphicsModal').modal('show');
    });
    $('#exerciseGraphicsModal').on('hide.bs.modal', (e) => {
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-prev', (e) => {
        console.log('xxx')
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-next', (e) => {
        StopAllVideos();
    });
})

function open_graphics_modal(parentId) {
    $('#exerciseGraphicsModal').find('.modal-body').find('.carousel-item').each((ind, elem) => {
        $(elem).removeClass('active');
        if ($(elem).hasClass('description-item')) {return;}
        $(elem).remove();
    });
    let items = $('#carouselSchema').find('.carousel-item:not(.d-none)').clone();
    if (parentId != "carouselSchema") {$(items).removeClass('active');}
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);

    items = $('#carouselVideo').find('.carousel-item:not(.d-none)').clone();
    if (parentId != "carouselVideo") {$(items).removeClass('active');}
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if ($(item).find('.video-js').length > 0) {
            $(item).find('.video-js').remove();
            $(item).append(
                `
                    <video id="video-playerClone-${i}" class="video-js resize-block">
                    </video>
                `
            );
        }
    }
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
    window.videoPlayerClones = [];
    for (let i = 0; i < items.length; i++) {
        window.videoPlayerClones[i] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i}`)[0], {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
        window.videoPlayerClones[i].ready((e) => {
            if (i == 0) {
                window.videoPlayerClones[i].src({
                    type: window.videoPlayerCard1.currentType(),
                    src: window.videoPlayerCard1.currentSrc()
                });
            } else if (i == 1) {
                window.videoPlayerClones[i].src({
                    type: window.videoPlayerCard2.currentType(),
                    src: window.videoPlayerCard2.currentSrc()
                });
            }
        });
    }

    items = $('#carouselAnim').find('.carousel-item:not(.d-none)').clone();
    if (parentId != "carouselAnim") {$(items).removeClass('active');}
    let videoPlayersLength = window.videoPlayerClones.length;
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if ($(item).find('.video-js').length > 0) {
            $(item).find('.video-js').remove();
            $(item).append(
                `
                    <video id="video-playerClone-${i + videoPlayersLength}" class="video-js resize-block">
                    </video>
                `
            );
        }
    }
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
    for (let i = 0; i < items.length; i++) {
        window.videoPlayerClones[i + videoPlayersLength] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i + videoPlayersLength}`)[0], {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
        window.videoPlayerClones[i + videoPlayersLength].ready((e) => {
            if (i == 0) {
                window.videoPlayerClones[i + videoPlayersLength].src({
                    type: window.videoPlayerCard3.currentType(),
                    src: window.videoPlayerCard3.currentSrc()
                });
            } else if (i == 1) {
                window.videoPlayerClones[i + videoPlayersLength].src({
                    type: window.videoPlayerCard4.currentType(),
                    src: window.videoPlayerCard4.currentSrc()
                });
            }
        });
    }

    $('#exerciseGraphicsModal').modal('show');
}

function StopAllVideos() {
    try {
        if (Array.isArray(window.videoPlayerClones)) {
            for (let i = 0; i < window.videoPlayerClones.length; i++) {
                window.videoPlayerClones[i].pause();
            }
        }
    } catch (e) {}
}