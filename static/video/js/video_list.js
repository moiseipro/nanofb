let video_table

function generate_ajax_video_table(scroll_y = ''){
    video_table = $('#video').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md '><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        select: true,
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
            },
        },
        columns: [
            {'data': 'id', render: function (data, type, row, meta) {

                return meta.row + meta.settings._iDisplayStart + 1;
            }},
            {'data': 'id', 'name': 'id'},
            {'data': 'videosource_name', 'name': 'videosource_name'},
            {'data': 'upload_date', 'name': 'upload_date', "searchable": false},
            {'data': 'duration', "searchable": false},
            {'data': 'name', 'name': 'name'},
            {'data': 'taggit', 'name': 'taggit', 'defaultContent': "---", "orderable": false},
        ],

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