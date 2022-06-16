let video_table
let video_player, youtube_player
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
        dom: "<'row'<'col-sm-12 col-md 'l><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        select: true,
        buttons: [
            {
                extend: 'collection',
                text: '<i class="fa fa-bars" aria-hidden="true"></i>',
                className: 'btn-secondary btn-sm',
                buttons: [
                    {
                        extend: 'selected',
                        text: gettext('Edit')+' <i class="fa fa-pencil float-right" aria-hidden="true"></i>',
                        className: 'edit-video',
                        action: function ( e, dt, node, config ) {
                            $('.dropdown-toggle[aria-expanded="true"]').click()
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
            {'data': 'videosource_id.name', 'name': 'videosource_id.short_name'},
            {'data': 'name'},
            {'data': 'section_id.name', 'name': 'videosource_id.short_name'},
            {'data': 'duration'},
        ],

    })

    video_table
        .on( 'select', function ( e, dt, type, indexes ) {
            let rowData = video_table.rows( indexes ).data().toArray();
            if(type=='row') {
                ajax_video_info(rowData[0])
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = video_table.rows( indexes ).data().toArray();
        })
})

$('.video-source').on('click', function (){
    let data_source = $( this ).attr(`data-source`)
    //console.log(data_source)
    video_table.columns([0]).search(data_source).draw()
    $('#block-video-info').addClass('d-none')
})

function ajax_video_info(row_data) {
    let request = $.ajax({
        url: "api/"+row_data.id,
        type: "GET",
        dataType: "JSON"
    })

    request.done(function( data ) {
        //console.log(data)
        render_json_block(data)
    })

    request.fail(function( jqXHR, textStatus ) {
        alert( gettext('An error occurred when deleting the video. ') + gettext(textStatus) );
        $('#block-video-info').addClass('d-none')
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
        console.log(data)
        video_table.ajax.reload()
    })

    request.fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    })
}

function render_json_block(data) {
    $('#block-video-info').removeClass('d-none')
    console.log(data)
    $('#block-video-info .row div[data-name]').each(function () {
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
    if('nftv' in data['links']){
        //Получение ссылки на видео через API видеохостинга
        video_player.show()
        youtube_player.hide()
        video_player.attr('src', 'https://213.108.4.28/video/player/'+data['links']['nftv'])
    } else if('youtube' in data['links']){
        video_player.hide()
        youtube_player.show()
        youtube_player.src({ type: 'video/youtube', src: 'http://www.youtube.com/embed/'+data['links']['youtube']})
    }
    resizeBlockJS($('#all-player'));
}