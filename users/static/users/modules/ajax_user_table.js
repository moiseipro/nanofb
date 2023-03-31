var users_table;

function generate_ajax_users_table(scroll_y = ''){
    users_table = $('#users-table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md-12'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        scrollY: scroll_y,
        rowCallback: function( row, data ) {
            console.log(data)
            if(Cookies.get('user_selected_id')){
                if ( data.id == Cookies.get('user_selected_id')) {
                    $(row).addClass('selected');
                }
            }
        },
        drawCallback: function( settings ) {
            $('#club-users-table-counter').text(settings._iRecordsDisplay)
        },
        ajax: {
            url:'/user/clients/api?format=datatables',
            data: function(data){
                console.log(data)
            },
            // success: function (data){
            //     console.log(data)
            // }
        },
        columns: [
            {'data': 'activation', 'name': 'activation', render: function (data, type, row, meta) {
                console.log(data);
                let html = `
                    <span class="w-100 badge badge-${data.type}">${data.status}</span>
                `
                return html;
            }},
            {'data': 'license', 'name': 'license', 'defaultContent': "---"},
            {'data': 'license_date', 'name': 'license_date', 'defaultContent': "---"},
            {'data': 'last_name', 'name': 'last_name', 'defaultContent': "---"},
            {'data': 'first_name', 'name': 'first_name', 'defaultContent': "---"},
            {'data': 'age', 'name': 'age', sortable: false, searchable: false,},
            {'data': 'date_birthsday', 'name': 'date_birthsday', 'defaultContent': "---"},
            {'data': 'job_title', 'name': 'job_title', 'defaultContent': "---"},
            {'data': 'flag', 'name': 'flag', 'defaultContent': "---", render: function (data, type, row, meta) {
                let html = `
                    <div class="w-100 text-center">
                        <img src="${data}" style="height: 15px">
                    </div>
                `
                return html;
            }},
            {'data': 'admin_type', 'name': 'admin_type', sortable: false, searchable: false,},
            {'data': 'p_version', 'name': 'p_version', 'defaultContent': "---", render: function (data, type, row, meta) {
                if(data && 'name' in data)
                    return data.name;
            }},
            {'data': 'days_entered', 'name': 'days_entered', 'defaultContent': "---", sortable: false, searchable: false, render: function (data, type, row, meta) {
                return data;
            }},
            {'data': 'registration_to', 'name': 'registration_to', 'defaultContent': "---"},
            // {'data': 'is_active', 'name': 'is_active', sortable: false, searchable: false, render: function (data, type, row, meta) {
            //     let view_data = ''
            //     if(data==true) view_data = `<span class="badge badge-success" style="font-size: 14px;">${gettext('Activation')}</span>`
            //     else view_data = `<span class="badge badge-secondary" style="font-size: 14px;">${gettext('Archive')}</span>`
            //     return view_data;
            // }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = ``
                button_html += `<button type="button" class="btn btn-sm btn-outline-danger mr-1 close-access-user py-0" data-id="${data}">X</button>`
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
                swal(gettext('Club user registration'), data.registration, "success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR)
            if('limit' in jqXHR.responseJSON){
                swal(gettext('Users '+action), gettext('The limit of users for the club has been reached!'), "error");
            }else{
                swal(gettext('Users '+action), gettext('Error when action "'+action+'" the club users!'), "error");
            }
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}