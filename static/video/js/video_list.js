let video_table
let cur_edit_data = null

$(window).on('load', function (){

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
        columnDefs: [
            { "searchable": false, "targets": 0 }
        ],
        ajax: '/video/api/?format=datatables',
        columns: [
            {'data': 'id', render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }},
            {'data': 'id', 'name': 'id'},
            {'data': 'videosource_id.name', 'name': 'videosource_id.name'},
            {'data': 'upload_date', 'name': 'upload_date'},
            {'data': 'duration'},
            {'data': 'name', 'name': 'name'},
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
            }, "searchable": false},
        ],

    })
})