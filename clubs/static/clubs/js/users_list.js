let users_table
var is_select_user = false;

function generate_ajax_club_users_table(scroll_y = ''){
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
            url:'/clubs/api/users?format=datatables',
            data: function(data){
                console.log(data)
            },
        },
        columns: [
            {'data': 'id', render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'activation', 'name': 'activation', render: function (data, type, row, meta) {
                console.log(data);
                let html = `
                    <span class="w-100 badge badge-${data.type}">${data.status}</span>
                `
                return html;
            }},
            {'data': 'last_name', 'name': 'last_name', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<div class="text-truncate" title="${data}"> ${data} </div>`;
            }},
            {'data': 'first_name', 'name': 'first_name', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<div class="text-truncate" title="${data}"> ${data} </div>`;
            }},
            {'data': 'age', 'name': 'age', sortable: false, searchable: false, render: function (data, type, row, meta) {
                return `<div class="w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'date_birthsday', 'name': 'date_birthsday', 'defaultContent': "---"},
            // {'data': 'teams', 'name': 'teams', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
            //     return `<div class="text-truncate" style="max-width: 200px;" title="${data}"> ${data} </div>`;
            // }},
            {'data': 'job_title', 'name': 'job_title', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<span class="text-truncate" title="${data}"> ${data ? data : '---'} </span>`;
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
            //{'data': 'license_date', 'name': 'license_date', 'defaultContent': "---"},
            // {'data': 'email', 'name': 'email'},
            // {'data': 'phone', 'name': 'phone', 'defaultContent': "---", render: function (data, type, row, meta) {
            //     return `<div class="text-truncate" title="${data}"> ${data ? data : '---'} </div>`;
            // }},
            {'data': 'is_archive', "name": "is_archive", render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-outline-dark mx-1 archive-user py-0 ${data==1?'active text-danger':''}" data-id="${row.id}"><i class="fa fa-flag" aria-hidden="true"></i></button>`
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

    users_table.on('click', 'td', function (e) {
        console.log('SELECT')
        if($(e.target).closest('.archive-user').length > 0) return false;
        if($(this).parent().is('.selected')){
            is_select_user = false;
            users_table.row($(this).parent()).deselect()
        } else {
            is_select_user = true;
            users_table.rows('.selected').deselect()
            users_table.row($(this).parent()).select()
        }


    })
}

//Club user action ajax
async function ajax_users_action(method, data, action = '', id = '', func = '') {

    let url = "/clubs/api/users/"
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
            }else if(data.status == 'user_limit'){
                swal(gettext('Users '+action), gettext('The limit of users for the club'), "error");
            } else if('registration' in data && data.registration != '') {
                swal(gettext('Club user registration'), data.registration, "success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR)
            if('limit' in jqXHR.responseJSON){
                swal(gettext('Users '+action), gettext('The limit of users for the club has been reached!'), "error");
            }else{
                swal(gettext('Users '+action), gettext('Error when action the club users!'), "error");
            }
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}