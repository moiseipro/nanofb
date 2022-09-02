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
            //console.log(settings)
            $('#video-table-counter').text(settings._iRecordsDisplay)
        },
        columnDefs: [
            { "searchable": false, "targets": 0 }
        ],
        ajax: {
            url:'/video/api/?format=datatables',
            data: function(data){
                let tag_list = $('.video-tags-filter').val()
                //data.columns[6].search.value = tag_list
                console.log(data)
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
            // {'data': function (data, type, dataToSet) {
            //     console.log(data)
            //     if(type === 'display') {
            //         if ('taggit' in data && data.taggit.length != 0) {
            //             let tags = ''
            //             data.taggit.forEach(function(tag, index){
            //                 if(tags!='')tags+=', '
            //                 tags += tag;
            //             })
            //             return tags
            //         } else return gettext('---')
            //     } else return null
            // }, 'name': 'taggit'},
        ],

    })
}

async function get_video_ids(video_id){
    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: "/video/api/"+video_id+"/get_video",
        type: "GET",
        dataType: "JSON"
    })
}