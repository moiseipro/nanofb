


$(function() {

    $('#exerciseCard').find('.modal-body').removeClass('size-h-x');
    $('#exerciseCard').find('.modal-body').attr('style', '');
    $('#exerciseCard').find('#columnsSizeInCard2').remove();

    $('#columnsSizeToggle').on('click', (e) => {
        $('#exerciseCard').find('div.gutter').toggleClass('d-none');
    });

    $('#exerciseCard').on('click', 'button[data-dismiss="modal"]', (e) => {
        if (window.changedData == true) {
            swal({
                title: "Вы точно хотите выйти, не сохранив изменений?",
                text: "При выходе данные не сохраняются!",
                icon: "warning",
                buttons: ["Отмена", "Подтвердить"],
                dangerMode: true,
            })
            .then((willExit) => {
                if (willExit) {
                    window.location.href = `/exercises`;
                }
            });
        } else {
            window.location.href = `/exercises`;
        }
    });

    // Open graphics in modal
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
                    window.videoPlayerClones[i].src({techOrder: ["youtube"], type: 'video/youtube', src: "https://www.youtube.com/watch?v=sNZPEnc4m0w"});
                } else if (i == 1) {
                    window.videoPlayerClones[i].src({techOrder: ["youtube"], type: 'video/youtube', src: "https://www.youtube.com/watch?v=K0x8Z8JxQtA"});
                }
            });
        }

        items = $('#carouselAnim').find('.carousel-item:not(.d-none)').clone();
        if (parentId != "carouselAnim") {$(items).removeClass('active');}
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);

        $('#exerciseGraphicsModal').modal('show');
    });


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);


});
