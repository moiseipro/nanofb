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
        order: [[3, 'asc']],
        ajax: {
            url:'/video/api/all?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        createdRow: function(row, data, dataIndex) {
            console.log(data)
            let $dateCell = $(row).find('td:eq(3)'); // get first column
            let exercise_data = 'folder' in data.exercises ? data.exercises.folder.short_name : '';
            $dateCell
            .data('order', exercise_data)
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
            {'data': 'id', render: function (data, type, row, meta) {

                return meta.row + meta.settings._iDisplayStart + 1;
            }},
            {'data': 'id', 'name': 'id'},
            {'data': 'videosource_name', 'name': 'videosource_name'},
            {'data': 'exercises', 'name': 'exercises', render: function (data, type, row, meta) {
                let view_data = ''
                data.forEach((exercise, index) => {
                    if(index>0) view_data += `, `
                    view_data += `<a href="/exercises/exercise?id=${exercise.id}&nfb=1&type=nfb_folders" target="_blank" class="exercise-folder">${exercise.folder.short_name}</a>`
                    view_data += ` <span class="other-exercises font-weight-bold" data-ids="${exercise.videos.join(", ")}">(${exercise.videos.length>0 ? exercise.videos.length : 0})</span>`
                });
                return view_data;
            }},
            //{'data': 'upload_date', 'name': 'upload_date', "searchable": false},
            {'data': 'duration', "searchable": false},
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