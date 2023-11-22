var clubs_table;
var is_select_club = false;

function generate_ajax_clubs_table(scroll_y = ''){
    clubs_table = $('#clubs-table').DataTable({
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
            $(row).attr('data-club', data.id)
        },
        drawCallback: function( settings ) {
            $('#club-users-table-counter').text(settings._iRecordsDisplay)
            if(Cookies.get('club_selected_id')){
                is_select_club = true;
                $('#clubs-table tr[data-club="'+Cookies.get('club_selected_id')+'"] td:first').click();
            }
        },
        ajax: {
            url:'/user/clubs/api/?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'name', 'name': 'name', 'defaultContent': "---", render: function (data, type, row, meta) {
                let html = `<div class="text-truncate w-100 text-center" title="${data}"> ${data} </div>`
                return html;
            }},
            {'data': 'subdomain', 'name': 'subdomain', 'defaultContent': "---", render: function (data, type, row, meta) {
                return `<div class="text-truncate w-100 text-center" title="${data}"> ${data} </div>`;
            }},
            {'data': 'image', 'name': 'image', 'defaultContent': "---", render: function (data, type, row, meta) {
                let html = `
                    <div class="w-100 text-center">
                        <img src="${data}" style="height: 15px">
                    </div>
                `
                return html;
            }},
            {'data': 'date_registration', 'name': 'date_registration', 'defaultContent': "---", render: function (data, type, row, meta) {
                return data;
            }},

            {'data': 'date_registration_to', 'name': 'date_registration_to', 'defaultContent': "---", render: function (data, type, row, meta) {
                console.log(row);
                let date = data;
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
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-outline-dark mx-1 block-club py-0 ${row.is_archive==1?'active text-danger':''}" data-id="${data}"><i class="fa fa-ban" aria-hidden="true"></i></button>`
                button_html += `</div>`
                    return button_html;
            }},
        ],

    })
    clubs_table.on('click', 'td', function () {
        console.log('SELECT')
        if($(this).parent().is('.selected')){
            is_select_club = false;
            clubs_table.row($(this).parent()).deselect()
        } else {
            is_select_club = true;
            clubs_table.rows('.selected').deselect()
            clubs_table.row($(this).parent()).select()
        }
    })
}

async function ajax_club_action(method, data, action = '', id = '', func = '') {

    let url = "/user/clubs/api/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        cache : false,
        processData: false,
        contentType: false,
        success: function(data){
            //console.log(data)
            if ('action' in data) {
                swal(data.action, "success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            if ('responseJSON' in jqXHR){
                if('action' in jqXHR.responseJSON){
                    swal(jqXHR.responseJSON.action, '', "error");
                }
            }

        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}