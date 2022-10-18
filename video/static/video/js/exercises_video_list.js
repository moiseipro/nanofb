let exercises_video_table

function generate_ajax_video_exercise_table(scroll_y = ''){
    exercises_video_table = $('#video-exercises').DataTable({
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

        ],
        ajax: {
            url:'/video/api/exercises?format=datatables',
            data: function(data){
                console.log(data)
            },
        },
        columns: [
            {'data': 'video', render: function (data, type, row, meta) {

                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'video', 'name': 'video', searchable: false},
            {'data': 'exercise_nfb.title', 'name': 'exercise_nfb.title', render: function (data, type, row, meta) {
                return (get_cur_lang() in data) ? data[get_cur_lang()] : Object.values(data)[0]
            }},
            {'data': 'exercise_nfb.folder', 'name': 'exercise_nfb.folder', render: function (data, type, row, meta) {
                console.log(data)
                return data.short_name
            }},
            {'data': 'video_source', 'name': 'video_source', searchable: false},
            {'data': 'video_date', 'name': 'video_date', "searchable": false},
            {'data': 'video_duration', "searchable": false},
            {'data': 'video_name', 'name': 'video_name', searchable: false},
        ],

    })
}