let video_table
let video_player, youtube_player
let cur_edit_data = null
youtube_player = videojs('youtube-player', {
    preload: 'auto',
    autoplay: false,
    controls: true,
    sources: [{type: 'video/youtube'}],
    techOrder: ["youtube"],
    youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 }
})
video_player = $('#base-player')
// При изменении ширины окна
$(window).resize(function () {
    resizeBlockJS($('.resize-block'));
});

$(window).on('load', function (){
    //video_table = $('.datatable').DataTable()
    video_table = $('#video').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md 'l><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        select: true,
        drawCallback: function( settings ) {
            $('#video-table-counter').text(video_table.data().count())
        },
        buttons: [
            {
                extend: 'collection',
                text: '<i class="fa fa-bars" aria-hidden="true"></i>',
                className: 'btn-secondary btn-sm',
                buttons: [
                    {
                        extend: '',
                        text: gettext('Add')+' <i class="fa fa-plus float-right" aria-hidden="true"></i>',
                        className: 'add-video',
                        action: function ( e, dt, node, config ) {
                            $('.dropdown-toggle[aria-expanded="true"]').click()
                            let new_location = window.location.origin + '/video/add'
                            location.href = new_location
                        }
                    },
                    {
                        extend: 'selected',
                        text: gettext('Edit')+' <i class="fa fa-pencil float-right" aria-hidden="true"></i>',
                        className: 'edit-video',
                        action: function ( e, dt, node, config ) {
                             $('.dropdown-toggle[aria-expanded="true"]').click()
                             $('#edit-video-modal').modal('show')

                        }
                    },
                    {
                        extend: 'selected',
                        text: gettext('Delete')+' <i class="fa fa-trash-o float-right" aria-hidden="true"></i>',
                        className: 'delete-video',
                        action: function ( e, dt, node, config ) {
                            let rowData = dt.rows({ selected: true }).data();
                            ajax_video_delete(rowData[0])
                            $('.dropdown-toggle[aria-expanded="true"]').click()
                        }
                    },
                ],
            },
        ],
        ajax: 'api/?format=datatables',
        columns: [
            {'data': 'id', render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }},
            {'data': 'id'},
            {'data': 'videosource_id.name', 'name': 'videosource_id.short_name'},
            {'data': 'upload_date'},
            {'data': 'duration'},
            {'data': 'name'},
            {'data': function (data, type, dataToSet) {
                console.log(data)
                if(type === 'display') {
                    if ('tags' in data && data.tags.length != 0) {
                        let tags = ''
                        data.tags.forEach(function(tag, index){
                            if(tags!='')tags+=', '
                            tags += tag.name;
                        })
                        return tags
                    } else return gettext('---')
                } else return null
            }},
        ],

    })

    video_table
        .on( 'select', function ( e, dt, type, indexes ) {
            let rowData = video_table.rows( indexes ).data().toArray();
            if(type=='row') {
                toggle_edit_mode(false)
                cur_edit_data = rowData[0]
                ajax_video_info(cur_edit_data)
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = video_table.rows( indexes ).data().toArray();
            cur_edit_data = null
        })
})

$('.video-source').on('change', function (){
    let data_source = $( this ).val()
    //console.log(data_source)
    video_table.columns([0]).search(data_source).draw()
    $('#block-video-info').addClass('d-none')
})

function ajax_video_info(row_data) {
    let request = $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "api/"+row_data.id,
        type: "GET",
        dataType: "JSON"
    })

    request.done(function( data ) {
        $('#video-action-form').attr('method', 'PUT')
        render_json_block(data)
    })

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    })
}

$('#delete-video').on('click', function (){
    ajax_video_action('DELETE', null, 'delete', cur_edit_data ? cur_edit_data.id : '').done(function (data) {
        video_table.ajax.reload()
        console.log(data)
        cur_edit_data = null
        $('#video-card-modal').modal('hide')
    })
})

$('#add-video').on('click', function (){
    toggle_edit_mode(true)
    cur_edit_data = null
    clear_video_form()
    $('#video-action-form').attr('method', 'POST')
    $('#video-card-modal').modal('show')
})

function clear_video_form(){
    video_player.hide()
    youtube_player.hide()
    $('#video-card-modal .video-data .row div[data-name]').each(function () {
        $(this).text('---')
    })
    $('#video-action-form').find('input[type="text"]').val('')
    $('#video-action-form select[name="videosource_id"] option:first').prop('selected', true)
    $('#video-action-form select[name="videosource_id"]').trigger('change')
    $('#video-action-form select[name="language"] option:first').prop('selected', true)
    $('#video-action-form select[name="language"]').trigger('change')
    $('#video-action-form select[name="tags"] option').prop('selected', false)
    $('#video-action-form select[name="tags"]').trigger('change')
    $('#video-action-form input[type="checkbox"]').prop('checked', false)
}

$('#save-video').on('click', function () {
    $('#video-action-form').submit()
})

$('#video-action-form').submit(function (event) {

    let formData = $(this).serialize()
    let form_Data = new FormData(this)

    ajax_video_action($(this).attr('method'), form_Data, 'update', cur_edit_data ? cur_edit_data.id : '').done(function (data) {
        video_table.ajax.reload()
        console.log(data)
        cur_edit_data = data
        ajax_video_info(cur_edit_data)
    })

    event.preventDefault();
});

function ajax_video_action(method, data, action = '', id = '', func = '') {
    let url = "/video/api/"
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
                swal(gettext('Training '+action), gettext('Video action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                swal(gettext('Training '+action), gettext('Error when action "'+action+'" the video!'), "error");
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
        url: "api/"+row_data.id+"/",
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
    //console.log(data)
    $('#video-card-modal [name]').each(function () {
        let in_data = $(this).attr('name')
        if(in_data === 'youtube_link') in_data = 'links'
        if(in_data in data){
            if($(this).is('select')){
                //$(this).val(1)
                if($(this).hasClass('selectmultiple')){
                    let ids = []
                    data[in_data].forEach(function (tag) {
                        ids.push(tag.id)
                    })
                    $(this).val(ids).trigger("change")
                } else {
                    if(typeof data[in_data] === "object") $(this).val(data[in_data]['id']).trigger("change")
                    else $(this).val(data[in_data]).trigger("change")
                }
            } else if($(this).is('[type="checkbox"]')){
                if(data[in_data]==true) $(this).prop('checked', true)
                else $(this).prop('checked', false)
            } else {
                if(in_data === 'links'){
                    if(data[in_data]['youtube']) $(this).val('https://www.youtube.com/watch?v='+data[in_data]['youtube'])
                } else $(this).val(data[in_data])
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
        video_player.attr('src', 'https://213.108.4.28/video/player/'+data['links']['nftv'])
    } else if('youtube' in data['links'] && data['links']['youtube'] != ''){
        video_player.hide()
        youtube_player.show()
        youtube_player.src({ type: 'video/youtube', src: 'http://www.youtube.com/embed/'+data['links']['youtube']})
    }
}

$('#video-card-modal').on('shown.bs.modal', function (e) {
    resizeBlockJS($('.resize-block'));
})