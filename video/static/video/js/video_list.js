let video_table

function generate_ajax_video_table(scroll_y = ''){
    video_table = $('#video').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: //"<'row'<'col-sm-12 col-md '><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        //select: 'single',
        scrollY: scroll_y,
        drawCallback: function( settings ) {
            $('#video-table-counter').text(settings._iRecordsDisplay)
        },
        columnDefs: [
            { "searchable": false, "targets": 0 }
        ],
        ajax: {
            url:'/video/api/all?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        rowCallback: function( row, data ) {
            if(Cookies.get('video_id')){
                if ( data.DT_RowId == Cookies.get('video_id')) {
                    $(row).addClass('selected');
                }
            }
        },
        rowId: 'id',
        columns: [
            {'data': 'id', "orderable": false, render: function (data, type, row, meta) {

                return meta.row + meta.settings._iDisplayStart + 1;
            }},
            {'data': 'id', 'name': 'id'},
            {'data': 'videosource_name', 'name': 'videosource_name'},
            {'data': 'exercises', 'name': 'exercises', render: function (row, type, set, meta) {
                let view_data = ''
                let sort_data = ''
                console.log(type)
                console.log(row)
                if(type==='sort'){
                    return sort_data
                }else{
                    row.forEach((exercise, index) => {
                        if(index>0) view_data += `, `
                        view_data += `<a href="/exercises/exercise?id=${exercise.id}&nfb=1&type=nfb_folders" target="_blank" class="exercise-folder">${exercise.folder.short_name}</a>`
                        view_data += ` <span class="other-exercises font-weight-bold" data-ids="${exercise.videos.join(", ")}">(${exercise.videos.length>0 ? exercise.videos.length : 0})</span>`
                    });
                    return view_data
                }
            }},
            {'data': 'duration', "searchable": false},
            {'data': 'note', "searchable": false, render: function (row, type, set, meta) {
                console.log(row)
                let view_data = '<b class="text-center">'
                let has_video = false
                if(row && 'video' in row && row.video){
                    view_data+=`${row.video ? 'V': ''}`
                    has_video = true
                }
                if(row && 'animation' in row && row.animation){
                    has_video ? view_data+=` / ` : ''
                    view_data+=`${row.animation ? 'A': ''}`
                }
                view_data += '</b>'
                return view_data
            }},
            {'data': 'name', 'name': 'name'},
            {'data': 'taggit', 'name': 'taggit', 'defaultContent': "---", "orderable": false},
        ],

    })
    $('#video').on('click', 'td', function () {
        console.log('TEST')
        if($(this).has('.other-exercises').length == 0){
            console.log('SELECT')
            if($(this).parent().is('.selected')){
                video_table.row($(this).parent()).deselect()
            } else {
                video_table.rows().deselect()
                video_table.row($(this).parent()).select()
            }

        }

    })
}

async function get_video_ids(video_id){
    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "/video/api/all/"+video_id+"/get_video",
        type: "GET",
        dataType: "JSON"
    })
}