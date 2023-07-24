let video_player, youtube_player
let cur_edit_data = null

youtube_player = videojs('youtube-player', {
    preload: 'auto',
    autoplay: false,
    controls: true,
    aspectRatio: '16:9',
    sources: [{type: 'video/youtube'}],
    techOrder: ["youtube"],
    youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 }
})
video_player = videojs('base-player', {
    preload: 'auto',
    autoplay: false,
    controls: true,
    aspectRatio: '16:9',
})



function clear_video_form(){
    video_player.hide()
    youtube_player.hide()
    $('#video-card-modal .video-data .row div[data-name]').each(function () {
        $(this).text('---')
    })
    $('#video-action-form').find('input[type="text"]').val('')
    $('#video-action-form').find('input[type="number"]').val('')
    $('#video-action-form').find('input[type="file"]').val('')
    $('#video-action-form select[name="videosource_id"] option:first').prop('selected', true)
    $('#video-action-form select[name="videosource_id"]').trigger('change')
    $('#video-action-form select[name="language"] option:first').prop('selected', true)
    $('#video-action-form select[name="language"]').trigger('change')
    //$('#video-action-form input[name="taggit"]').tagsinput('removeAll');
    $('#video-action-form select[name="taggit"]').val(null).trigger('change');
    $('#video-action-form input[type="checkbox"]').prop('checked', false)
}

$('#save-video').on('click', function () {
    $('#video-action-form').submit()
})

$('#video-action-form').submit(function (event) {
    let formData = $(this).serializeArray()
    let form_Data = new FormData(this)
    form_Data.set("taggit", JSON.stringify($('#video-action-form select[name="taggit"]').val(), null, 2))
    console.log(form_Data.get("note_animation"))

    ajax_video_action($(this).attr('method'), form_Data, 'update', cur_edit_data ? cur_edit_data.id : '').done(function (data) {
        video_table.ajax.reload()
        cur_edit_data = data
        $('#cancel-edit-button').click()
        ajax_video_info(cur_edit_data.id)
        if(Cookies.get('page')) video_table.page(parseInt(Cookies.get('page'))).draw(false);
    })

    event.preventDefault();
});

function ajax_video_info(id) {
    let request = $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "/video/api/all/"+id,
        type: "GET",
        dataType: "JSON"
    })

    request.done(function( data ) {
        clear_video_form()
        cur_edit_data = data
        $('#video-action-form').attr('method', 'PUT')
        render_json_block(data)
    })

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    })
}

function ajax_video_action(method, data, action = '', id = '', func = '') {
    let url = "/video/api/all/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            cache : false,
            processData: false,
            contentType: false,
            success: function(data){
                swal(gettext('Video '+action), gettext('Video action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                if('empty_load' in jqXHR.responseJSON){
                    swal(gettext('Video '+action), gettext(jqXHR.responseJSON['empty_load']), "error");
                } else {
                    swal(gettext('Video '+action), gettext('Error when action "'+action+'" the video!'), "error");
                }
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
            }
        })
}

function ajax_video_delete(row_data) {
    if (!confirm(gettext('Delete the selected video(s)?'))) return false

    let request = $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "api/all/"+row_data.id+"/",
        type: "DELETE",
    })

    request.done(function( data ) {
        video_table.ajax.reload()
    })

    request.fail(function( jqXHR, textStatus ) {
        alert( gettext('An error occurred when deleting the video. ') + gettext(textStatus) );
    })
}

function render_json_block(data) {
    $('#video-card-modal').modal('show')
    console.log(data)
    $('#video-card-modal [name]').each(function () {
        let base_data = $(this).attr('name')
        let in_data = ''
        if(base_data === 'youtube_link') in_data = 'links'
        else if(base_data === 'note_video') in_data = 'note'
        else if(base_data === 'note_animation') in_data = 'note'
        else in_data = base_data
        if(in_data in data){
            if($(this).is('select')){
                //$(this).val(1)
                if($(this).hasClass('tag-select')){
                    let ids = []
                    data[in_data].forEach(function (tag) {
                        ids.push(tag)
                    })
                    $(this).val(ids).trigger("change")
                } else {
                    if(typeof data[in_data] === "object") $(this).val(data[in_data]['id']).trigger("change")
                    else $(this).val(data[in_data]).trigger("change")
                }
            } else if($(this).is('[type="checkbox"]')){
                if(base_data === 'note_video'){
                    if(data[in_data]) {
                        if ('video' in data[in_data] && data[in_data]['video'] == true) $(this).prop('checked', true)
                    }
                }else if(base_data === 'note_animation'){
                    if(data[in_data]) {
                        if ('animation' in data[in_data] && data[in_data]['animation'] == true) $(this).prop('checked', true)
                    }
                } else if(data[in_data]==true) $(this).prop('checked', true)
                else $(this).prop('checked', false)
            } else {
                if(in_data === 'links'){
                    if(data[in_data]['youtube']) $(this).val('https://www.youtube.com/watch?v='+data[in_data]['youtube'])
                } else if(in_data === 'taggit'){
                    let this_obj = $(this)
                    $.each( data[in_data], function( key, value ) {
                        this_obj.tagsinput('add', value);
                    });
                    //$(this).tagsinput('refresh');
                } else {
                    $(this).val(data[in_data])

                }
            }
        }
    })
    $('#video-card-modal .video-data .row div[data-name]').each(function () {
        let in_data = $(this).attr('data-name').split('.')
        let html = '';
        if(in_data[0] in data){
            if(in_data.length>1){
                html = data[in_data[0]][in_data[1]].toString()
            } else {
                if(typeof data[in_data[0]] === "boolean"){
                    html = data[in_data[0]] ?
                        '<i class="fa fa-check" aria-hidden="true"></i>' :
                        '<i class="fa fa-times" aria-hidden="true"></i>'
                } else {
                    html = data[in_data[0]].toString()
                }
            }
        } else {
            html = '---'
        }
        $(this).html(html)
    })
    if('nftv' in data['links'] && data['links']['nftv'] != ''){
        //Получение ссылки на видео через API видеохостинга
        video_player.show()
        youtube_player.hide()
        video_player.poster(`https://nanofootball.pro/video/poster/${data['links']['nftv']}`)
        video_player.src({type: 'video/mp4', src: `https://nanofootball.pro/video/player/${data['links']['nftv']}`});

        //attr('src', 'https://nanofootball.pro/video/player/'+data['links']['nftv'])
        //video_player.attr('poster', 'https://nanofootball.pro/video/poster/'+data['links']['nftv'])
    } else if('youtube' in data['links'] && data['links']['youtube'] != ''){
        video_player.hide()
        youtube_player.show()
        youtube_player.src({ type: 'video/youtube', src: 'http://www.youtube.com/embed/'+data['links']['youtube']})
    }
}