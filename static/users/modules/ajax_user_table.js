var users_table;
var is_select_user = false;

function generate_ajax_users_table(scroll_y = '', pagination = true){
    let page_length = pagination ? 50 : -1;
    let length_menu = pagination ? [ 25, 50, 100 ] : false
    users_table = $('#users-table').DataTable({
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
                is_select_user = true
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
            {'data': 'club_id', 'name': 'club_id', 'defaultContent': "---", render: function (data, type, row, meta) {
                let html = ``
                if (data != null){
                    html += `<div class="text-truncate w-100 text-center" title="${data.name}"> ${data.name} </div>`
                }
                return html;
            }},
            {'data': 'license', 'name': 'trainer_license', 'defaultContent': "---", render: function (data, type, row, meta) {
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
            {'data': 'distributor', 'name': 'distributor', 'defaultContent': "---"},
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
            {'data': 'club_title', 'name': 'club_title', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<span class="text-truncate" title="${data ? data : '---'}"> ${data ? data : '---'} </span>`;
            }},
            {'data': 'admin_type', 'name': 'admin_type', sortable: false, searchable: false, render: function (data, type, row, meta) {
                return `<div class="w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'p_version', 'name': 'p_version', 'defaultContent': "---", render: function (data, type, row, meta) {
                if(data && 'name' in data)
                    return data.name;
            }},
            {'data': 'teams_players', 'name': 'teams_players', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
                return `<div class="w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'teams_players_fact', 'name': 'teams_players_fact', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
                return `<div class="w-100 text-center font-weight-bold text-warning" title="${data}"> ${data} </div>`;
            }},
            {'data': 'exercises', 'name': 'exercises', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
                return `<div class="w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'date_last_login', 'name': 'date_last_login', 'defaultContent': "---", render: function (data, type, row, meta) {
                let view_date = ''
                if (data == '') view_date = '...'
                else view_date = moment(data, "DD/MM/YYYY").format('DD/MM/YYYY')
                let html = `<div class="w-100 text-center" title="${view_date}"> ${view_date} </div>`;
                return html;
            }},
            {'data': 'online', 'name': 'online', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
                let html = `<div class="w-100 text-center"> ${data} </div>`;
                return html;
            }},
            {'data': 'date_joined', 'name': 'date_joined', 'defaultContent': "---", render: function (data, type, row, meta) {
                let view_date = moment(data, "DD/MM/YYYY").format('DD/MM/YYYY')
                let last_check_date = moment().subtract(30, 'days')
                let is_new = moment(data, "DD/MM/YYYY").isAfter(last_check_date)
                let html = `<div class="w-100 text-center ${is_new ? 'text-danger' : ''}" title="${view_date}"> ${view_date} </div>`;
                return html;
            }},

            {'data': 'access_to', 'name': 'access_to', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
                let html = `<div class="w-100 text-center"> ${data} </div>`;
                return html;
            }},
            // {'data': 'days_entered', 'name': 'days_entered', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
            //     return data;
            // }},
            {'data': 'is_archive', "name": "is_archive", render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-outline-dark mx-1 archive-user py-0 ${data==1?'active text-danger':''}" data-id="${row.id}"><i class="fa fa-flag" aria-hidden="true"></i></button>`
                if(data==1) button_html += `<button type="button" class="btn btn-sm btn-outline-dark mx-1 delete-user py-0 active text-danger" data-id="${row.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                button_html += `</div>`
                return button_html;
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<a type="button" href="/?__impersonate=${data}" class="btn btn-sm btn-outline-dark mx-1 loginas-user py-0"><i class="fa fa-user-plus" aria-hidden="true"></i></a>`
                button_html += `</div>`
                    return button_html;
            }},
        ],

    })
    users_table.on('click', 'td', function () {
        console.log('SELECT')
        if($(this).parent().is('.selected')){
            is_select_user = false;
            users_table.row($(this).parent()).deselect()
        } else {
            is_select_user = true;
            users_table.rows('.selected').deselect()
            users_table.row($(this).parent()).select()
        }
    })

    //Переключение по пользователям
    $(document).keydown(function(e) {
        let isNext = false;
        console.log('test')
        if(e.keyCode == 38){
            $($('#users-table tr').get().reverse()).each(function( index ) {
                console.log($(this))
                if(isNext){
                    console.log('down')
                    $(this).find('td:first').click()
                    return false
                }
                if($(this).hasClass('selected')){
                    isNext = true;
                }
            });
        }
        if(e.keyCode == 40){
            $('#users-table tr').each(function( index ) {
                if(isNext){
                    console.log('down')
                    $(this).find('td:first').click()
                    return false
                }
                if($(this).hasClass('selected')){
                    isNext = true;
                }
            });
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
            console.log(data)
            if (data) {
                if ('status' in data && data.status == 'success') {
                    swal(gettext('User'), data.message, 'success');
                } else if ('registration' in data && data.registration != '') {
                    swal(gettext('User registration'), data.registration, "success");
                }
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