var notification_table;
var notification_select_id;

function generate_ajax_notification_table(scroll_y = '', pagination = true){
    let page_length = pagination ? 50 : -1;
    let length_menu = pagination ? [ 25, 50, 100 ] : false
    notification_table = $('#notification-table').DataTable({
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
            $(row).attr('data-notification', data.id)
        },
        drawCallback: function( settings ) {
            if(Cookies.get('notification_selected_id')){
                $('#notification-table tr[data-user="'+Cookies.get('notification_selected_id')+'"] td:first').click();
            }
        },
        ajax: {
            url:'/notifications/api/all/?format=datatables',
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
            {'data': 'date_update', 'name': 'date_update', 'defaultContent': "---", render: function (data, type, row, meta) {
                let date = moment(data, 'DD/MM/YYYY hh:mm').format("DD/MM/YYYY")
                return `<div class="text-truncate w-100 text-center" title="${date}"> ${date} </div>`;
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 view-notification py-0 text-warning" data-id="${row.id}"><i class="fa fa-search" aria-hidden="true"></i></button>`
                button_html += `</div>`
                return button_html;
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 edit-notification py-0 text-warning" data-id="${row.id}"><i class="fa fa-pencil" aria-hidden="true"></i></button>`
                button_html += `</div>`
                return button_html;
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 delete-notification py-0 text-danger" data-id="${row.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                button_html += `</div>`
                return button_html;
            }},
        ],

    })
    notification_table.on('click', 'td', function () {
        console.log('SELECT')
        if($(this).parent().is('.selected')){
            if ($(this).find('.btn').length == 0) notification_table.row($(this).parent()).deselect()
        } else {
            notification_table.rows('.selected').deselect()
            notification_table.row($(this).parent()).select()
        }
    })
}