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
            { "searchable": false, "targets": 0 },
            {
                "targets": 5,
                "className": "text-center"
            },
        ],
        ajax: {
            url:'/video/api/all?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        rowCallback: function( row, data ) {
            // let exercises = data.exercises
            // console.log(exercises)
            // if(exercises.length > 0){
            //     exercises.forEach((exercise, index) => {
            //         $(row).attr('data-sort', exercise.folder.parent*1000 + exercise.folder.order)
            //     });
            // }
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
            {'data': 'favourites', "searchable": true, 'name': 'favourites', render: function (row, type, set, meta) {
                let view_data = ''
                if(type==='sort'){
                    return row
                }else{
                    if(row){
                        view_data+=`<i class="fa fa-star" aria-hidden="true"></i>`
                    } else {
                        view_data+=`<i class="fa fa-star-o" aria-hidden="true"></i>`
                    }
                }
                return view_data
            }},
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

$(".dataTables_filter input")
    .unbind() // Unbind previous default bindings
    .bind("keyup", function(e) { // Bind our desired behavior
        video_table.search(this.value).draw();
        return;
    });

async function get_video_ids(video_id){
    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "/video/api/all/"+video_id+"/get_video",
        type: "GET",
        dataType: "JSON"
    })
}