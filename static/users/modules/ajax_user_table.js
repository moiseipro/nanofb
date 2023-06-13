var users_table;
var users_table_visible_col = [0, 1, 2 ,3, 5, 6, 8, 10, 11, 12, 13, 15, 17]

function generate_ajax_users_table(scroll_y = ''){
    users_table = $('#users-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        scrollY: scroll_y,
        pageLength: 50,
        lengthMenu: [ 25, 50, 100 ],
        columnDefs: [
            { targets: 'additional-info-col', visible: false }
        ],
        rowCallback: function( row, data ) {
            console.log(data)
            $(row).attr('data-user', data.id)
        },
        drawCallback: function( settings ) {
            $('#club-users-table-counter').text(settings._iRecordsDisplay)
            if(Cookies.get('user_selected_id')){
                $('#users-table tr[data-user="'+Cookies.get('user_selected_id')+'"] td:first').click();
            }
        },
        ajax: {
            url:'/user/clients/api/?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'activation', 'name': 'activation', sortable: false, render: function (data, type, row, meta) {
                console.log(data);
                let html = `
                    <div class="w-100 badge badge-${data.type}">${data.status}</div>
                `
                return html;
            }},
            {'data': 'club_name', 'name': 'club_name', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<div class="text-truncate w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'license', 'name': 'license', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<div class="text-truncate w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'license_date', 'name': 'license_date', 'defaultContent': "---"},
            {'data': 'last_name', 'name': 'last_name', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<div class="text-truncate" title="${data}"> ${data} </div>`;
            }},
            {'data': 'first_name', 'name': 'first_name', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<div class="text-truncate" title="${data}"> ${data} </div>`;
            }},
            {'data': 'email', 'name': 'email', 'defaultContent': "---"},
            {'data': 'phone', 'name': 'phone', 'defaultContent': "---"},
            {'data': 'age', 'name': 'age', sortable: false, searchable: false, render: function (data, type, row, meta) {
                return `<div class="w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'date_birthsday', 'name': 'date_birthsday', 'defaultContent': "---"},
            {'data': 'flag', 'name': 'flag', 'defaultContent': "---", render: function (data, type, row, meta) {
                let html = `
                    <div class="w-100 text-center">
                        <img src="${data}" style="height: 15px">
                    </div>
                `
                return html;
            }},
            {'data': 'region', 'name': 'region', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<span class="text-truncate" title="${data}"> ${data} </span>`;
            }},
            {'data': 'job_title', 'name': 'job_title', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<span class="text-truncate" title="${data}"> ${data} </span>`;
            }},
            {'data': 'admin_type', 'name': 'admin_type', sortable: false, searchable: false, render: function (data, type, row, meta) {
                return `<div class="w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'p_version', 'name': 'p_version', 'defaultContent': "---", render: function (data, type, row, meta) {
                if(data && 'name' in data)
                    return data.name;
            }},
            {'data': 'date_last_login', 'name': 'date_last_login', 'defaultContent': "---", render: function (data, type, row, meta) {
                return data;
            }},
            {'data': 'date_joined', 'name': 'date_joined', 'defaultContent': "---", render: function (data, type, row, meta) {
                return data;
            }},

            {'data': 'registration_to', 'name': 'registration_to', 'defaultContent': "---", render: function (data, type, row, meta) {
                console.log(row);
                let date = '';
                if('club_registration_to' in row && row.club_registration_to != '' && row.club_registration_to != null){
                    date = row.club_registration_to;
                } else {
                    date = data;
                }
                let start = moment(date, "DD/MM/YYYY");
                let end = moment();
                let days = start.diff(end, "days");
                let style = ''
                if (days < 15){
                    style = 'text-danger font-weight-bold'
                } else if (days < 30){
                    style = 'text-warning font-weight-bold'
                }
                console.log(days)
                let html = `<div class="${style}">${date}</div>`
                return html;
            }},
            {'data': 'days_entered', 'name': 'days_entered', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
                return data;
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = ``
                button_html += `<button type="button" class="btn btn-sm btn-outline-dark mr-1 archive-user py-0 ${row.is_archive==1?'active':''}" data-id="${data}"><i class="fa fa-archive" aria-hidden="true"></i></button>`
                return button_html;
            }},
        ],

    })
    users_table.on('click', 'td', function () {
        console.log('TEST')
        if($(this).has('.other-exercises').length == 0){
            console.log('SELECT')
            if($(this).parent().is('.selected')){
                //users_table.row($(this).parent()).deselect()
            } else {
                users_table.rows('.selected').deselect()
                users_table.row($(this).parent()).select()
            }

        }
    })
}

async function ajax_users_action(method, data, action = '', id = '', func = '') {

    let url = "/user/clients/api/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function(data){
            //console.log(data)
            if(data.status == 'success'){
                swal(gettext('User'), data.message, 'success');
            } else if('registration' in data && data.registration != '') {
                swal(gettext('User registration'), data.registration, "success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR)
            if ('responseJSON' in jqXHR){
                if('registration' in jqXHR.responseJSON)
                    swal(gettext('Users '+action), jqXHR.responseJSON.registration, "error");
            }

        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}