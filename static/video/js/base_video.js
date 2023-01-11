function formatState (state) {
    if (!state.id) {
        return state.text;
    }
    //console.log(state.element)
    var $state = $(
        '<span>' + state.text + '</span>' + '<span class="float-right">(' + state.element.getAttribute('data-right') + ')</span>'
    );
    return $state;
}

$(window).on('load', function (){
    $('.video-source').select2({
        templateResult: formatState,
    })
    $('.exercise-folder').select2({
        templateResult: formatState,
    })

    generate_ajax_video_table("calc(100vh - 280px)")
    //generate_ajax_video_exercise_table("calc(100vh - 350px)")
    video_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = video_table.rows( indexes ).data().toArray();
            if(type=='row') {
                toggle_edit_mode(false)
                cur_edit_data = rowData[0]
                Cookies.set('video_id', cur_edit_data.id, { expires: 1 })
                ajax_video_info(cur_edit_data.id)
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = video_table.rows( indexes ).data().toArray();
            cur_edit_data = null
        })

    let url_video_id = get_url_value('id')
    if(get_url_value('id') != null){
        toggle_edit_mode(false)
        ajax_video_info(url_video_id);
        console.log(url_video_id)
    }

    $('#video').on('click', '.other-exercises', function () {
        let ids_arr = $(this).attr('data-ids').split(',')
        console.log(ids_arr)
        video_table.columns([1]).search(ids_arr).draw()
    })
})

// Следующий/предыдущий
$('#next-video').on('click', function () {
    let row_next = video_table.row($('.selected').next())
    if(row_next[0].length>0) {
        video_table.$('tr.selected').removeClass('selected');
        row_next.select()
    }
})
$('#previous-video').on('click', function () {
    let row_prev = video_table.row($('.selected').prev())
    if(row_prev[0].length>0) {
        video_table.$('tr.selected').removeClass('selected');
        row_prev.select()
    }
})

$('.video-source').on('change', function (){
    let data_source = $( this ).val()
    //console.log(data_source)
    video_table.columns([2]).search(data_source).draw()
})

$('.exercise-folder').on('change', function (){
    let data_folder = $( this ).val()
    //console.log(data_source)
    video_table.columns([3]).search(data_folder).draw()
})

$('.video-tags-filter').on('change', function (){
    let data_tag = $( this ).val()
    console.log(data_tag)
    video_table.columns([7]).search(data_tag).draw()
})

$('#search-video-table').on('change', function () {
    video_table.search($(this).val()).draw();
})

$('#filter-video-favourites').on('click', function () {
    let favourite = $(this).attr('data-favourite')
    favourite == 1 ? favourite = '' : favourite = 1
    $(this).attr('data-favourite', favourite)
    console.log(favourite)

    if(favourite) $(this).children('i').removeClass('fa-star-o').addClass('fa-star')
    else $(this).children('i').removeClass('fa-star').addClass('fa-star-o')
    video_table.columns([5]).search(favourite).draw();
})

//Сбросить фильтры
$('#video-filters-clear').on('click', function (){
    $('.video-source').val(null).trigger('change');
    $('.exercise-folder').val(null).trigger('change');
    $('.video-tags-filter').val(null).trigger('change');
    $('input[type="search"]').val('').change()
    video_table.columns([1]).search('').draw()
    Cookies.remove('page')
    Cookies.remove('video_id')
})


//Переключение между блочной и табличной структурой видео
$('#change-format').on('click', function (){
    if(!$('#table-exercises-video-view').is('.d-none')){
        $('#table-video-view').removeClass('d-none')
        $('#block-video-view').addClass('d-none')
        $('#table-exercises-video-view').addClass('d-none')
    } else {
        $('#table-video-view').toggleClass('d-none')
        $('#block-video-view').toggleClass('d-none')
        $(this).children('i').toggleClass('fa-list').toggleClass('fa-table')
    }
})

$('#exercise-video-format').on('click', function (){
    $('#table-video-view').addClass('d-none')
    $('#block-video-view').addClass('d-none')
    $('#table-exercises-video-view').removeClass('d-none')
    exercises_video_table.ajax.reload()
})

$('#delete-video').on('click', function (){
    ajax_video_action('DELETE', null, 'delete', cur_edit_data ? cur_edit_data.id : '').done(function (data) {
        Cookies.remove('page')
        Cookies.remove('video_id')
        video_table.ajax.reload()
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

$(document).on("page.dt", () => {
    let info = video_table.page.info()
    Cookies.set('page', info.page, { expires: 1 })
    console.log(info.page)
})

// $('#video-card-modal').on('shown.bs.modal', function (e) {
//     resizeBlockJS($('.resize-block'));
// })