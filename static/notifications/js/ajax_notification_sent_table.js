var notification_sent_table;

function generate_ajax_notification_sent_table(scroll_y = '', pagination = true){
    let page_length = pagination ? 50 : -1;
    let length_menu = pagination ? [ 25, 50, 100 ] : false
    notification_sent_table = $('#notification-sent-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: `<'row'<'col-sm-12'tr>>` +
             `<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'${pagination ? 'p': ''}>>`,
        serverSide: true,
        processing: true,
        scrollY: scroll_y,
        pageLength: page_length,
        lengthMenu: length_menu,
        lengthChange: pagination,
        // columnDefs: [
        //     { targets: 'additional-info-col', visible: false }
        // ],
        rowCallback: function( row, data ) {
            console.log(data)
            $(row).attr('data-sent-notification', data.id)
        },
        ajax: {
            url:'/notifications/api/sent/?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'title', 'name': 'title', render: function (data, type, row, meta) {
                console.log(data);
                let html = `
                    <div class="text-truncate w-100 text-center" title="${data}">${data}</div>
                `
                return html;
            }},
            {'data': 'date_receiving', 'name': 'date_receiving', 'defaultContent': "---", render: function (data, type, row, meta) {
                let html = ``
                let date = moment(data, 'DD/MM/YYYY hh:mm').format("DD/MM/YYYY (hh:mm)")
                if (data != null){
                    html += `<div class="text-truncate w-100 text-center" title="${date}"> ${date} </div>`
                }
                return html;
            }},
            {'data': 'user', 'name': 'user', render: function (data, type, row, meta) {
                console.log(data);
                let html = `
                    <div class="text-truncate w-100 text-center" title="${data}">${data}</div>
                `
                return html;
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 delete-sent-notification py-0 text-danger" data-id="${row.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                button_html += `</div>`
                return button_html;
            }},
        ],

    })
    notification_sent_table.on('click', 'td', function () {
        console.log('SELECT')
        if($(this).parent().is('.selected')){
            notification_sent_table.row($(this).parent()).deselect()
        } else {
            notification_sent_table.rows('.selected').deselect()
            notification_sent_table.row($(this).parent()).select()
        }
    })
}