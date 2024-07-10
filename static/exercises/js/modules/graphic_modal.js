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
    $('#exerciseGraphicsModal').on('show.bs.modal', (e) => {
        ToggleEditModeInModal();
        ToggleContentTab();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-prev', (e) => {
        ToggleContentTab();
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-next', (e) => {
        ToggleContentTab();
        StopAllVideos();
    });

    $('#exerciseGraphicsModal').on('click', 'button.toggle-description', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseGraphicsModal').find('button.toggle-description').removeClass('active');
        $(e.currentTarget).addClass('active');
        $('#exerciseGraphicsModal').find('.description-panel').addClass('d-none');
        $('#exerciseGraphicsModal').find(`.description-panel[data-id="${cId}"]`).removeClass('d-none');
    });

    $('#exerciseGraphicsModal').on('click', 'button.btn-tab', (e) => {
        let cType = $(e.currentTarget).attr('data-type');
        ToggleContentTab(cType);
    });

    $('#exerciseGraphicsModal').on('click', '.toggle-edit-exs', (e) => {
        ToggleEditModeInModal("edit");
    });

    try {
        let cLang = $('#select-language').val();
        let watchdog_descriptionEditorView = new CKSource.EditorWatchdog();
		watchdog_descriptionEditorView.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditorViewFromGraphicModal = editor;
                document.descriptionEditorViewFromGraphicModal.enableReadOnlyMode('');
                $('#descriptionEditorViewGraphicModal').next().find('.ck-editor__top').addClass('d-none');
                $('#descriptionEditorViewGraphicModal').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
				return editor;
			})
		});
        watchdog_descriptionEditorView.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditorView.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditorView
		.create(document.querySelector('#descriptionEditorViewGraphicModal'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch (e) {}
    try {
        let cLang = $('#select-language').val();
        let watchdog_descriptionEditorTrainerView = new CKSource.EditorWatchdog();
		watchdog_descriptionEditorTrainerView.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditorViewTrainerFromGraphicModal = editor;
                document.descriptionEditorViewTrainerFromGraphicModal.enableReadOnlyMode('');
                $('#descriptionEditorTrainerViewGraphicModal').next().find('.ck-editor__top').addClass('d-none');
                $('#descriptionEditorTrainerViewGraphicModal').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
				return editor;
			})
		});
        watchdog_descriptionEditorTrainerView.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditorTrainerView.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditorTrainerView
		.create(document.querySelector('#descriptionEditorTrainerViewGraphicModal'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch (e) {}
})

function LoadGraphicsModal(id = -1, f_type="team_folders", activeNum = 1) {
    let data = {'get_exs_graphic_content': 1, 'exs': id, 'f_type': f_type};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                RenderGraphicsModal(res.data, activeNum);
            } else {
                RenderGraphicsModal();
            }
        },
        error: function (res) {
            RenderGraphicsModal();
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderGraphicsModal(data = null, activeNum = 1) {
    let activeExs = $('.exercises-list').find('.exs-elem.active');
    let videoWatched_1 = undefined;
    let videoWatched_2 = undefined;
    let animationWatched_1 = undefined;
    let animationWatched_2 = undefined;
    if ($(activeExs).length > 0) {
        videoWatched_1 = $(activeExs).find('button.btn-marker[data-id="video_1_watched"] > input').prop('checked');
        videoWatched_2 = $(activeExs).find('button.btn-marker[data-id="video_2_watched"] > input').prop('checked');
        animationWatched_1 = $(activeExs).find('button.btn-marker[data-id="animation_1_watched"] > input').prop('checked');
        animationWatched_2 = $(activeExs).find('button.btn-marker[data-id="animation_2_watched"] > input').prop('checked');
    }
    window.videoPlayerClones = [];
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').find('.item-scheme').remove();
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').find('.item-video').remove();
    let htmlStr = `
        ${data && data.scheme_img ? `
            <div class="carousel-item h-100 new-scheme item-scheme" title="Рисунок (новый / картинка)" data-type="scheme_pic">
                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <image data-height="400" data-width="600" height="100%" width="100%" href="/media/${data.scheme_img}" x="0" y="0"></image>
                </svg>
            </div>
        ` : ``}
        ${data && data.scheme_1 && data.scheme_1 != "" ? `
            <div class="carousel-item h-100 new-scheme item-scheme" title="Рисунок 1 (новый)" data-type="scheme_1">
                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${data.scheme_1}" x="0" y="0"></image>
                </svg>
            </div>
        ` : ''}
        ${data && data.scheme_2 && data.scheme_2 != "" ? `
            <div class="carousel-item h-100 new-scheme item-scheme" title="Рисунок 2 (новый)" data-type="scheme_2">
                <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${data.scheme_2}" x="0" y="0"></image>
                </svg>
            </div>
        ` : ''}
        <div class="carousel-item h-100 item-scheme">
            ${data && data.scheme_data && data.scheme_data[0] ? data.scheme_data[0] : `
            <svg id="" class="d-block bg-success mx-auto" viewBox="0 0 600 400" height="100%" width="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" "="">
                <image id="plane" x="0" y="0" data-width="600" data-height="400" width="100%" height="100%" href="/static/exercises/img/field.svg"></image>
            </svg>
            `}
        </div>
        <div class="carousel-item h-100 item-scheme">
            ${data && data.scheme_data && data.scheme_data[1] ? data.scheme_data[1] : `
            <svg id="" class="d-block bg-success mx-auto" viewBox="0 0 600 400" height="100%" width="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" "="">
                <image id="plane" x="0" y="0" data-width="600" data-height="400" width="100%" height="100%" href="/static/exercises/img/field.svg"></image>
            </svg>
            `}
        </div>
        ${data && data.video_1 && data.video_1.id != -1 ? `
        <div class="carousel-item h-100 item-video">
            ${'nftv' in data.video_1['links'] && data.video_1['links']['nftv'] != '' ? `
                <video id="video-player-modal-0" class="video-js resize-block video-modal" poster="https://nanofootball.pro/video/poster/${data.video_1['links']['nftv']}">
                    <source src="https://nanofootball.pro/video/player/${data.video_1['links']['nftv']}" type="video/mp4" />
                </video>
            ` : 'youtube' in data.video_1['links'] && data.video_1['links']['youtube'] != '' ? `
                <video id="video-player-modal-0" class="video-js resize-block video-modal" poster="">
                    <source src="https://www.youtube.com/watch?v=${data.video_1['links']['youtube']}" type="video/youtube" />
                </video>
            ` : ''}
            ${videoWatched_1 !== undefined ? `
                <div class="row mb-2">
                    <div class="col-1 pr-0">
                        <input type="checkbox" class="video-watched" ${videoWatched_1 === true ? 'checked=""' : ''} data-id="video_1_watched">
                    </div>
                    <div class="col-11 pl-0">
                        Смотрел
                    </div>
                </div>
            ` : ''}
        </div>
        ` : data && data.video_links && data.video_links[0] && data.video_links[0]['link'] && data.video_links[0]['link'] != "" ? `
        ${data.video_links[0]['link'].includes("youtube") ? `
            <div class="carousel-item h-100 item-video">
                <video id="video-player-modal-0" class="video-js resize-block video-modal" poster="">
                    <source src="${data.video_links[0]['link']}" type="video/youtube" />
                </video>
            </div>
        ` : `
            <div class="carousel-item h-100 item-video">
                <div class="mt-5 px-5">
                    <div class="row">
                        <div class="col-3">Название видео:</div>
                        <div class="col-9">${data.video_links[0]['name']}</div>
                    </div>
                    <div class="row">
                        <div class="col-3">Описание:</div>
                        <div class="col-9">${data.video_links[0]['note']}</div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <a class="btn btn-sm btn-primary" href="${data.video_links[0]['link']}" target="_blank" role="button">
                                Просмотреть видео
                            </a>
                            <button class="btn btn-sm btn-info" value="${data.video_links[0]['link']}" onclick="navigator.clipboard.writeText(this.value);">
                                Скопировать видео
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}
        `
        : ''}
        ${data && data.animation_1 && data.animation_1.id != -1 ? `
        <div class="carousel-item h-100 item-video">
            ${'nftv' in data.animation_1['links'] && data.animation_1['links']['nftv'] != '' ? `
                <video id="video-player-modal-2" class="video-js resize-block video-modal" poster="https://nanofootball.pro/video/poster/${data.animation_1['links']['nftv']}">
                    <source src="https://nanofootball.pro/video/player/${data.animation_1['links']['nftv']}" type="video/mp4" />
                </video>
            ` : 'youtube' in data.animation_1['links'] && data.animation_1['links']['youtube'] != '' ? `
                <video id="video-player-modal-2" class="video-js resize-block video-modal" poster="">
                    <source src="https://www.youtube.com/watch?v=${data.animation_1['links']['youtube']}" type="video/youtube" />
                </video>
            ` : ''}
            ${animationWatched_1 !== undefined ? `
                <div class="row mb-2">
                    <div class="col-1 pr-0">
                        <input type="checkbox" class="video-watched" ${animationWatched_1 === true ? 'checked=""' : ''} data-id="animation_1_watched">
                    </div>
                    <div class="col-11 pl-0">
                        Смотрел
                    </div>
                </div>
            ` : ''}
        </div>
        ` : data && data.video_links && data.video_links[1] && data.video_links[1]['link'] && data.video_links[1]['link'] != "" ? `
        ${data.video_links[1]['link'].includes("youtube") ? `
            <div class="carousel-item h-100 item-video">
                <video id="video-player-modal-0" class="video-js resize-block video-modal" poster="">
                    <source src="${data.video_links[1]['link']}" type="video/youtube" />
                </video>
            </div>
        ` : `
            <div class="carousel-item h-100 item-video">
                <div class="mt-5 px-5">
                    <div class="row">
                        <div class="col-3">Название видео:</div>
                        <div class="col-9">${data.video_links[1]['name']}</div>
                    </div>
                    <div class="row">
                        <div class="col-3">Описание:</div>
                        <div class="col-9">${data.video_links[1]['note']}</div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <a class="btn btn-sm btn-primary" href="${data.video_links[1]['link']}" target="_blank" role="button">
                                Просмотреть видео
                            </a>
                            <button class="btn btn-sm btn-info" value="${data.video_links[1]['link']}" onclick="navigator.clipboard.writeText(this.value);">
                                Скопировать видео
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}
        `
        : ''}
    `;
    for (let i = 0; i < window.videoPlayerClones.length; i++) {
        window.videoPlayerClones[i].dispose();
    }
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').prepend(htmlStr);

    try {
        document.descriptionEditorViewFromGraphicModal.setData('');
        document.descriptionEditorViewTrainerFromGraphicModal.setData('');
    } catch(e) {}
    try {
        document.descriptionEditorViewFromGraphicModal.setData(data.description);
        document.descriptionEditorViewTrainerFromGraphicModal.setData(data.description_trainer);
    } catch(e) {}

    let items = $('#exerciseGraphicsModal').find('.video-modal');
    for (let i = 0; i < items.length; i++) {
        let tId = $(items[i]).attr('id');
        // if(videojs.getPlayers()[tId]) {
        //     delete videojs.getPlayers()[tId];
        // }
        window.videoPlayerClones[i] = videojs($('#exerciseGraphicsModal').find(`#${tId}`)[0], {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    }
    for (let i = 0; i < items.length; i++) {
        window.videoPlayerClones[i].load();
    }
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').find(`.carousel-item:nth-child(${activeNum})`).addClass('active');
    $('#exerciseGraphicsModal').modal('show');

    try {
        RenderContentInCardModalForEdit(data);
    } catch(e) {}
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

function ToggleContentTab(cTab = null) {
    let waitTime = 700;
    if (cTab) {
        $('#exerciseGraphicsModal').find('.carousel-item').removeClass('active');
        $('#exerciseGraphicsModal').find(`.carousel-item.item-${cTab}`).first().addClass('active');
        waitTime = 200;
    }
    setTimeout(() => {
        let activeItem = $('#exerciseGraphicsModal').find('.carousel-item.active');
        $('#exerciseGraphicsModal').find('.btn-tab').removeClass('active');
        if ($(activeItem).hasClass('item-scheme')) {
            $('#exerciseGraphicsModal').find('.btn-tab[data-type="scheme"]').addClass('active');
        } else if ($(activeItem).hasClass('item-video')) {
            $('#exerciseGraphicsModal').find('.btn-tab[data-type="video"]').addClass('active');
        } else if ($(activeItem).hasClass('item-description')) {
            $('#exerciseGraphicsModal').find('.btn-tab[data-type="description"]').addClass('active');
        } else if ($(activeItem).hasClass('item-card')) {
            $('#exerciseGraphicsModal').find('.btn-tab[data-type="card"]').addClass('active');
        } else if ($(activeItem).hasClass('item-notes')) {
            $('#exerciseGraphicsModal').find('.btn-tab[data-type="notes"]').addClass('active');
        }
    }, waitTime);
}

function ToggleEditModeInModal(mode='') {
    $('#exerciseGraphicsModal').find('.toggle-edit-exs').toggleClass('d-none', mode == "edit");
    $('#exerciseGraphicsModal').find('.toggle-save-exs').toggleClass('d-none', mode != "edit");


}
