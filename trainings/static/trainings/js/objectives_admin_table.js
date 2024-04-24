var aobjectives_table;
var is_select_aobjective = false;

function generate_ajax_aobjectives_table(scroll_y = '', pagination = true){
    let page_length = pagination ? 10 : -1;
    let length_menu = pagination ? [ 10, 25, 50 ] : false
    aobjectives_table = $('#admin-objectives-table').DataTable({
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
            {
                "width": "20%", "targets": 1
            },
            {
                "width": "10%", "targets": 3
            },
            {
                "width": "5%", "targets": 0
            }
        ],
        rowCallback: function( row, data ) {
            console.log(data)
            $(row).attr('data-objective', data.id)
        },
        ajax: {
            url:'/trainings/api/aobjectives/?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'short_name', 'name': 'short_name', 'defaultContent': "---", render: function (data, type, row, meta) {
                //return `<div class="text-truncate" title="${data}"> ${data} </div>`;
                return `<select name="short_name" class="form-control form-control-sm select2" data-value="${data}" data-tags="true" placeholder="${gettext('Short key')}" disabled></select>`
                //return `<input type="text" name="short_name" value="${data}" class="form-control form-control-sm py-0" placeholder="${gettext('Age')}" autocomplete="off" style="height: 26px" disabled>`
            }},
            {'data': 'name', 'name': 'name', 'defaultContent': "---", render: function (data, type, row, meta) {
                //return `<div class="text-truncate" title="${data}"> ${data} </div>`;
                return `<input type="text" name="name" value="${data}" class="form-control form-control-sm py-0" placeholder="${gettext('Title')}" autocomplete="off" style="height: 26px" disabled>`
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = ``
                if ($('#admin-objectives-table').attr('data-perm')=='True'){
                    button_html = `<div class="w-100 text-center" title="">`
                    button_html += `<button type="button" class="btn btn-sm btn-warning mx-1 swap-button edit-objective py-0"><i class="fa fa-pencil" aria-hidden="true"></i></button>`
                    button_html += `<button type="button" class="btn btn-sm btn-danger mx-1 swap-button delete-objective py-0"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                    button_html += `<button type="button" class="btn btn-sm btn-success mx-1 swap-button save-objective py-0 d-none"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`
                    button_html += `<button type="button" class="btn btn-sm btn-warning mx-1 swap-button cancel-objective py-0 d-none"><i class="fa fa-ban" aria-hidden="true"></i></button>`
                    button_html += `</div>`
                }
                return button_html;
            }},
        ],

    })

    $('#objectives-tab-button').on('shown.bs.tab', function () {
        aobjectives_table.columns.adjust()
    })
    $('#nav-admin-objectives-tab').on('shown.bs.tab', function () {
        aobjectives_table.columns.adjust()
    })
    $('.admin-objectives-table-filter').on("keyup change", function () {
        let val = $(this).val() ? $(this).val() : '';
        aobjectives_table.columns($(this).attr('name')).search(val).draw();
    })
}

$(window).on('load', function (){
    $('#admin-objectives-table').on('draw.dt', function () {
        console.log('draw')
        create_ajax_select2($('#admin-objectives-table .select2'), gettext('Short key'), '/trainings/aobjectives_short', $('#references-modal'))
        $('#admin-objectives-table select').each(function (index) {
            let val = $(this).attr('data-value')
            let newOption = new Option(val, val, false, true);
            $(this).append(newOption).trigger('change');
        })
    });
    // Добавление задач для команды
    let old_data = {};
    $('#admin-objectives-table').on('click', '.edit-objective', function(e) {
        let row = $(this).closest('tr')

        if(old_data['row'] !== undefined){
            old_data['row'].find('[name="name"]').val(old_data['name'])
            let select = old_data['row'].find('[name="short_name"]');
            let val = select.attr('data-value')
            let newOption = new Option(val, val, false, true);
            select.append(newOption).trigger('change');
            set_row_edit_mode(old_data['row'], false)
        }
        old_data['row'] = row;
        old_data['name'] = row.find('[name="name"]').val()
        old_data['short_name'] = row.find('[name="short_name"]').val()

        set_row_edit_mode(row, true)
    })
    $('#admin-objectives-table').on('click', '.save-objective', function(e) {
        let row = $(this).closest('tr')

        let id = row.attr('data-objective')
        let send_data = {}
        send_data['name'] = row.find('[name="name"]').val()
        send_data['short_name'] = row.find('[name="short_name"]').val()

        ajax_aobjectives_action('PUT', send_data, 'edit objective', id).then(function (data) {
            console.log(data)
            old_data = {}
            set_row_edit_mode(row, false)
        })
    })
    $('#admin-objectives-table').on('click', '.delete-objective', function(e) {
        let row = $(this).closest('tr')

        let id = row.attr('data-objective')
        let send_data = {}

        ajax_aobjectives_action('DELETE', send_data, 'delete objective', id).then(function (data) {
            console.log(data)
            aobjectives_table.ajax.reload()
        })
    })
    $('#admin-objectives-table').on('click', '.cancel-objective', function(e) {
        let row = $(this).closest('tr')

        row.find('[name="name"]').val(old_data['name'])
        let select = row.find('[name="short_name"]');
        let val = select.attr('data-value')
        let newOption = new Option(val, val, false, true);
        select.append(newOption).trigger('change');

        old_data = {}

        set_row_edit_mode(row, false)
    })
})

function set_row_edit_mode(row = null, active = true) {
    row.find('input').prop('disabled', !active)
    row.find('select').prop('disabled', !active)
    row.find('.swap-button').toggleClass('d-none')
}