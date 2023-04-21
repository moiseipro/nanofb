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
        StopAllVideos();
    });
    $('#exerciseGraphicsModal').on('click', '.carousel-control-next', (e) => {
        StopAllVideos();
    });


    $('#exerciseGraphicsModal').on('click', 'button.toggle-description', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseGraphicsModal').find('button.toggle-description').removeClass('active');
        $(e.currentTarget).addClass('active');
        $('#exerciseGraphicsModal').find('.description-panel').addClass('d-none');
        $('#exerciseGraphicsModal').find(`.description-panel[data-id="${cId}"]`).removeClass('d-none');
    });
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
    let htmlStr = `
        ${data && data.scheme_1 && data.scheme_1 != "" ? `
        <div class="carousel-item">
            <img src="http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${data.scheme_1}" alt="scheme" loading="lazy" width="100%" height="100%"> 
        </div>
        ` : ''}
        ${data && data.scheme_2 && data.scheme_2 != "" ? `
        <div class="carousel-item">
            <img src="http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${data.scheme_2}" alt="scheme" loading="lazy" width="100%" height="100%"> 
        </div>
        ` : ''}
        <div class="carousel-item">
            ${data && data.scheme_data && data.scheme_data[0] ? data.scheme_data[0] : `
            <svg id="" class="d-block bg-success mx-auto" viewBox="0 0 600 400" height="100%" width="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" "="">
                <image id="plane" x="0" y="0" data-width="600" data-height="400" width="100%" height="100%" href="/static/exercises/img/field.svg"></image>
            </svg>
            `}
        </div>
        <div class="carousel-item">
            ${data && data.scheme_data && data.scheme_data[1] ? data.scheme_data[1] : `
            <svg id="" class="d-block bg-success mx-auto" viewBox="0 0 600 400" height="100%" width="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" "="">
                <image id="plane" x="0" y="0" data-width="600" data-height="400" width="100%" height="100%" href="/static/exercises/img/field.svg"></image>
            </svg>
            `}
        </div>
        ${data && data.video_1 && data.video_1.id != -1 ? `
        <div class="carousel-item">
            ${'nftv' in data.video_1['links'] && data.video_1['links']['nftv'] != '' ? `
                <video id="video-player-modal-0" class="video-js resize-block video-modal" poster="https://213.108.4.28/video/poster/${data.video_1['links']['nftv']}">
                    <source src="https://213.108.4.28/video/player/${data.video_1['links']['nftv']}" type="video/mp4" />
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
        <div class="carousel-item">
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
        ` 
        : ''}
        ${data && data.animation_1 && data.animation_1.id != -1 ? `
        <div class="carousel-item">
            ${'nftv' in data.animation_1['links'] && data.animation_1['links']['nftv'] != '' ? `
                <video id="video-player-modal-2" class="video-js resize-block video-modal" poster="https://213.108.4.28/video/poster/${data.animation_1['links']['nftv']}">
                    <source src="https://213.108.4.28/video/player/${data.animation_1['links']['nftv']}" type="video/mp4" />
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
        ` : data && data.video_links && data.video_links[2] && data.video_links[2]['link'] && data.video_links[2]['link'] != "" ? `
        <div class="carousel-item">
            <div class="mt-5 px-5">
                <div class="row">
                    <div class="col-3">Название анимации:</div>
                    <div class="col-9">${data.video_links[2]['name']}</div>
                </div>
                <div class="row">
                    <div class="col-3">Описание:</div>
                    <div class="col-9">${data.video_links[2]['note']}</div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <a class="btn btn-sm btn-primary" href="${data.video_links[2]['link']}" target="_blank" role="button">
                            Просмотреть анимацию
                        </a>
                        <button class="btn btn-sm btn-info" value="${data.video_links[2]['link']}" onclick="navigator.clipboard.writeText(this.value);">
                            Скопировать анимацию
                        </button>
                    </div>
                </div>
            </div>
        </div>
        ` 
        : ''}
        <div class="carousel-item description-item">
            <div class="card size-h-x" style="--h-x:75vh;">
                <div class="card-body py-0">
                    <h5 class="card-title">Описание</h5>
                    <div class="choose-description-panel">
                        <button type="button" class="btn btn-outline-secondary btn-sm toggle-description active" data-id="nf">
                            Описание N.F.
                        </button>
                        <button type="button" class="btn btn-outline-secondary btn-sm toggle-description" data-id="trainer">
                            Описание "Тренер"
                        </button>
                    </div>
                    <div class="description-panel" data-id="nf">
                        <div id="descriptionEditorView" class="ckeditor" name=""></div>
                    </div>
                    <div class="description-panel d-none" data-id="trainer">
                        <div id="descriptionEditorTrainerView" class="ckeditor" name=""></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    for (let i = 0; i < window.videoPlayerClones.length; i++) {
        window.videoPlayerClones[i].dispose();
    }
    $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').html(htmlStr);
    try {
        let cLang = $('#select-language').val();
        let watchdog_descriptionEditorView = new CKSource.EditorWatchdog();
		watchdog_descriptionEditorView.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                if (data !== null && data.description !== null) {
                    editor.setData(data.description);
                }
                editor.enableReadOnlyMode('');
                $('#descriptionEditorView').next().find('.ck-editor__top').addClass('d-none');
                $('#descriptionEditorView').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
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
		.create(document.querySelector('#descriptionEditorView'), {
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
                if (data !== null && data.description_trainer !== null) {
                    editor.setData(data.description_trainer);
                }
                editor.enableReadOnlyMode('');
                $('#descriptionEditorTrainerView').next().find('.ck-editor__top').addClass('d-none');
                $('#descriptionEditorTrainerView').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
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
		.create(document.querySelector('#descriptionEditorTrainerView'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch (e) {}

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
