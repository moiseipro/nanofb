let modelType = null; let modelId = null;

function YoutubeParser(url) {
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}

function OpenMatchVideoModal(type, id) {
    modelType = type;
    modelId = id;
    LoadMatchVideoModal(modelId);
    $('#matchVideoModal').modal('show');
}

function LoadMatchVideoModal(id) {
    let dataKey = `get_match_video_${modelType}`;
    let data = {[dataKey]: 1, 'id': id};
    let resData = {'links': [], 'notes': []};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "matches_api",
        success: function (res) {
            if (res.success) {
                resData = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderMatchVideoModal(resData);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderMatchVideoModal(data) {
    let isEdit = $('#saveMatchAll:visible').length > 0;
    let htmlStr = "";
    let currentIndex = 0;
    for (; currentIndex < data.links.length; currentIndex++) {
        let isActive = currentIndex == 0;
        let isEmpty = data.links[currentIndex] == "";
        let cName = "";
        let cNote = "";
        try {
            cName = data.names[currentIndex];
        } catch(e) {}
        try {
            cNote = data.notes[currentIndex];
        } catch(e) {}
        htmlStr += `
            <div class="carousel-item ${isActive ? 'active' : ''}">
                <div class="row">
                    <div class="col-12">
                        <input class="form-control form-control-sm" name="video_name" value="${cName}" placeholder="Название видео" type="text" autocomplete="off" ${isEdit ? '' : 'disabled=""'}>
                    </div>
                    <div class="col-12">
                        <input class="form-control form-control-sm" name="video_link" value="${data.links[currentIndex]}" placeholder="Ссылка на видео" type="text" autocomplete="off" ${isEdit ? '' : 'disabled=""'}>
                    </div>
                    <div class="col-12">
                        <textarea class="form-control form-control-sm" name="video_note" placeholder="Описание видео" type="text" autocomplete="off" style="min-height: 300px;" ${isEdit ? '' : 'disabled=""'}>${cNote}</textarea>
                    </div>
                </div>
            </div>
        `;
    }
    for (; currentIndex < 3; currentIndex++) {
        let isActive = currentIndex == 0;
        htmlStr += `
            <div class="carousel-item ${isActive ? 'active' : ''}">
                <div class="row">
                    <div class="col-12">
                        <input class="form-control form-control-sm" name="video_name" value="" placeholder="Название видео" type="text" autocomplete="off" ${isEdit ? '' : 'disabled=""'}>
                    </div>
                    <div class="col-12">
                        <input class="form-control form-control-sm" name="video_link" value="" placeholder="Ссылка на видео" type="text" autocomplete="off" ${isEdit ? '' : 'disabled=""'}>
                    </div>
                    <div class="col-12">
                        <textarea class="form-control form-control-sm" name="video_note" placeholder="Описание видео" type="text" autocomplete="off" style="min-height: 300px;" ${isEdit ? '' : 'disabled=""'}></textarea>
                    </div>
                </div>
            </div>
        `;
    }
    $('#matchVideoModal').find('.carousel-inner').html(htmlStr);
}

function SaveMatchVideoModal() {
    if (!window.matchVideoCanSave) {
        $('#matchVideoModal').find('.alert-container').html(`
            <div class="alert alert-danger" role="alert">
                Сохранение не возможно. Проверьте правильность ссылок.
            </div>
        `);
        setTimeout(() => {
            $('#matchVideoModal').find('.alert').alert('close');
        }, 1000);
        return;
    }
    let videoLinks = []; let videoNotes = []; let videoNames = [];
    $('#matchVideoModal').find('[name="video_link"]:not(.form-error)').each((index, elem) => {
        videoLinks.push($(elem).val());
        videoNotes.push($(elem).parent().parent().find('[name="video_note"]').val());
        videoNames.push($(elem).parent().parent().find('[name="video_name"]').val());
    });
    console.log(videoLinks, videoNotes, videoNames)
    let dataKey = `edit_match_video_${modelType}`;
    let data = {
        [dataKey]: 1,
        'id': modelId,
        'links': videoLinks,
        'notes': videoNotes,
        'names': videoNames
    };
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "matches_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Видео успешно обновлено.", "success")
                .then((value) => {
                    $('.page-loader-wrapper').fadeIn();
                    window.location.reload();
                });
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function CheckVideoLink(target) {
    window.matchVideoCanSave = true;
    $(target).removeClass('form-error');
    let cLink = $(target).val();
    let cIndex = $('#matchVideoModal').find('[name="video_link"]').index(target);
    let videoId = `videoLink_${cIndex}`;
    $(target).prev().attr('id', videoId);
    $(target).prev()[0].addEventListener("error", (event) => {
        window.matchVideoCanSave = false;
        $(target).addClass('form-error');
    });
    let cYoutubeLink = YoutubeParser(cLink);
    let cVideoElem = videojs($(target).prev()[0], {
        controls: true,
        autoplay: false,
        preload: 'auto'
    });
    if (cYoutubeLink) {
        cVideoElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${cYoutubeLink}`});
    } else {
        cVideoElem.src({type: 'video/mp4', src: cLink});
    }
}

function ToggleMatchVideoFields(state = true) {
    $('#matchVideoModal').find('.form-control').prop('disabled', !state);
    $('#matchVideoModal').find('[name="save"]').toggleClass('d-none', !state);
}



$(function() {
    window.matchVideoCanSave = true;
    ToggleMatchVideoFields(false);

    $('#matchVideoModal').on('click', '[name="save"]', (e) => {
        SaveMatchVideoModal();
    });
    $('#matchVideoModal').on('click', '[name="open"]', (e) => {
        let cLink = $('#matchVideoModal').find('input[name="video_link"]:visible').val();
        window.open(cLink, '_blank').focus();
    });
    $('#matchVideoModal').on('click', '[name="copy"]', (e) => {
        let cLink = $('#matchVideoModal').find('input[name="video_link"]:visible').val();
        navigator.clipboard.writeText(cLink);
    });

    $('#matchVideoModal').on('hide.bs.modal', (e) => {
        $('#matchVideoModal').find('.video-js').each((ind, elem) => {
            if (elem.player) {elem.player.pause();}
        });
    });
    $('#matchVideoModal').on('click', '.col-1', (e) => {
        $('#matchVideoModal').find('.video-js').each((ind, elem) => {
            if (elem.player) {elem.player.pause();}
        });
    });

});
