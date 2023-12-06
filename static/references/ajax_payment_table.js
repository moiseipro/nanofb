var user_payment_table;
var club_payment_table;
var user_payment_select_id;
var club_payment_select_id;

function generate_ajax_user_payment_table(scroll_y = '', pagination = true){
    let page_length = pagination ? 25 : -1;
    let length_menu = pagination ? [ 25, 50, 100 ] : false
    user_payment_table = $('#user-payment-table').DataTable({
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
        rowCallback: function( row, data ) {
            console.log(data)
            $(row).attr('data-payment', data.id)
        },
        drawCallback: function( settings ) {
            // if(Cookies.get('notification_selected_id')){
            //     $('#notification-table tr[data-user="'+Cookies.get('notification_selected_id')+'"] td:first').click();
            // }
        },
        ajax: {
            url:'/references/api/payment/user?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'user_id', 'name': 'user_id', render: function (data, type, row, meta) {
                return data
            }},
            {'data': 'payment', 'name': 'payment', render: function (data, type, row, meta) {
                console.log(data);
                let html = `
                    <div class="text-truncate w-100 text-center" title="${data}">${data}</div>
                `
                return html;
            }},
            {'data': 'date', 'name': 'date', 'defaultContent': "---", render: function (data, type, row, meta) {
                let date = moment(data, 'DD/MM/YYYY').format("DD/MM/YYYY")
                return `<div class="text-truncate w-100 text-center" title="${date}"> ${date} </div>`;
            }},
            {'data': 'payment_before', 'name': 'payment_before', 'defaultContent': "---", render: function (data, type, row, meta) {
                let date = moment(data, 'DD/MM/YYYY').format("DD/MM/YYYY")
                return `<div class="text-truncate w-100 text-center" title="${date}"> ${date} </div>`;
            }},
            // {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
            //     let button_html = `<div class="w-100 text-center" title="">`
            //     button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 edit-payment py-0 text-warning" data-id="${row.id}"><i class="fa fa-pencil" aria-hidden="true"></i></button>`
            //     button_html += `</div>`
            //     return button_html;
            // }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 delete-payment py-0 text-danger" data-id="${row.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                button_html += `</div>`
                return button_html;
            }},
        ],

    })
    user_payment_table.on('click', 'td', function () {
        console.log('SELECT')
        if($(this).parent().is('.selected')){
            if ($(this).find('.btn').length == 0) user_payment_table.row($(this).parent()).deselect()
        } else {
            user_payment_table.rows('.selected').deselect()
            user_payment_table.row($(this).parent()).select()
        }
    })
}

function generate_ajax_club_payment_table(scroll_y = '', pagination = true){
    let page_length = pagination ? 25 : -1;
    let length_menu = pagination ? [ 25, 50, 100 ] : false
    club_payment_table = $('#club-payment-table').DataTable({
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
        rowCallback: function( row, data ) {
            console.log(data)
            $(row).attr('data-payment', data.id)
        },
        drawCallback: function( settings ) {
            // if(Cookies.get('notification_selected_id')){
            //     $('#notification-table tr[data-user="'+Cookies.get('notification_selected_id')+'"] td:first').click();
            // }
        },
        ajax: {
            url:'/references/api/payment/club?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'club_id', 'name': 'club_id', render: function (data, type, row, meta) {
                return data
            }},
            {'data': 'payment', 'name': 'payment', render: function (data, type, row, meta) {
                console.log(data);
                let html = `
                    <div class="text-truncate w-100 text-center" title="${data}">${data}</div>
                `
                return html;
            }},
            {'data': 'date', 'name': 'date', 'defaultContent': "---", render: function (data, type, row, meta) {
                let date = moment(data, 'DD/MM/YYYY').format("DD/MM/YYYY")
                return `<div class="text-truncate w-100 text-center" title="${date}"> ${date} </div>`;
            }},
            {'data': 'payment_before', 'name': 'payment_before', 'defaultContent': "---", render: function (data, type, row, meta) {
                let date = moment(data, 'DD/MM/YYYY').format("DD/MM/YYYY")
                return `<div class="text-truncate w-100 text-center" title="${date}"> ${date} </div>`;
            }},
            // {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
            //     let button_html = `<div class="w-100 text-center" title="">`
            //     button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 edit-payment py-0 text-warning" data-id="${row.id}"><i class="fa fa-pencil" aria-hidden="true"></i></button>`
            //     button_html += `</div>`
            //     return button_html;
            // }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-dark mx-1 delete-payment py-0 text-danger" data-id="${row.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                button_html += `</div>`
                return button_html;
            }},
        ],

    })
    club_payment_table.on('click', 'td', function () {
        console.log('SELECT')
        if($(this).parent().is('.selected')){
            if ($(this).find('.btn').length == 0) club_payment_table.row($(this).parent()).deselect()
        } else {
            club_payment_table.rows('.selected').deselect()
            club_payment_table.row($(this).parent()).select()
        }
    })
}