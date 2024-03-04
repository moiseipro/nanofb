var blocks_table;
var is_select_block = false;

function generate_ajax_blocks_table(scroll_y = '', pagination = true){
    let page_length = pagination ? 10 : -1;
    let length_menu = pagination ? [ 10, 25, 50 ] : false
    blocks_table = $('#blocks-table').DataTable({
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
            // {
            //     "width": "25%", "targets": 1
            // },
            {
                "width": "20%", "targets": 2
            },
            {
                "width": "10%", "targets": 0
            }
        ],
        rowCallback: function( row, data ) {
            console.log(data)
            $(row).attr('data-block', data.id)
        },
        ajax: {
            url:'/trainings/api/blocks/?format=datatables',
            data: function(data){
                console.log(data)
            }
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            // {'data': 'short_name', 'name': 'short_name', 'defaultContent': "---", render: function (data, type, row, meta) {
            //
            //     return `<select name="short_name" class="form-control form-control-sm select2" data-value="${data}" data-tags="true" placeholder="${gettext('Short key')}" disabled></select>`
            //
            // }},
            {'data': 'name', 'name': 'name', 'defaultContent': "---", render: function (data, type, row, meta) {
                //return `<div class="text-truncate" title="${data}"> ${data} </div>`;
                return `<input type="text" name="name" value="${data}" class="form-control form-control-sm py-0" placeholder="${gettext('Title')}" autocomplete="off" style="height: 26px" disabled>`
            }},
            {'data': 'id', sortable: false, searchable: false, render: function (data, type, row, meta) {
                let button_html = `<div class="w-100 text-center" title="">`
                button_html += `<button type="button" class="btn btn-sm btn-warning mx-1 swap-button edit-block py-0"><i class="fa fa-pencil" aria-hidden="true"></i></button>`
                button_html += `<button type="button" class="btn btn-sm btn-danger mx-1 swap-button delete-block py-0"><i class="fa fa-trash" aria-hidden="true"></i></button>`
                button_html += `<button type="button" class="btn btn-sm btn-success mx-1 swap-button save-block py-0 d-none"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`
                button_html += `<button type="button" class="btn btn-sm btn-warning mx-1 swap-button cancel-block py-0 d-none"><i class="fa fa-ban" aria-hidden="true"></i></button>`
                button_html += `</div>`
                    return button_html;
            }},
        ],

    })

    $('#training-blocks-tab-button').on('shown.bs.tab', function () {
        blocks_table.columns.adjust()
    })
    $('.blocks-table-filter').on("keyup change", function () {
        let val = $(this).val() ? $(this).val() : '';
        blocks_table.columns($(this).attr('name')).search(val).draw();
    })
}

$(window).on('load', function (){
    $('#blocks-table').on('draw.dt', function () {
        console.log('draw')
        //create_ajax_select2($('#objectives-table .select2'), gettext('Objective block'), '/trainings/objective_block', $('#training-objectives-modal'))
        // $('#objectives-table select').each(function (index) {
        //     let val = $(this).attr('data-value')
        //     let newOption = new Option(val, val, false, true);
        //     $(this).append(newOption).trigger('change');
        // })
    });
    // Добавление задач для команды
    let old_data = {};
    $('#blocks-table').on('click', '.edit-block', function(e) {
        let row = $(this).closest('tr')

        if(old_data['row'] !== undefined){
            old_data['row'].find('[name="name"]').val(old_data['name'])
            // let select = old_data['row'].find('[name="short_name"]');
            // let val = select.attr('data-value')
            // let newOption = new Option(val, val, false, true);
            // select.append(newOption).trigger('change');
            set_row_edit_mode(old_data['row'], false)
        }
        old_data['row'] = row;
        old_data['name'] = row.find('[name="name"]').val()
        //old_data['short_name'] = row.find('[name="short_name"]').val()

        set_row_edit_mode(row, true)
    })
    $('#blocks-table').on('click', '.save-block', function(e) {
        let row = $(this).closest('tr')

        let id = row.attr('data-block')
        let send_data = {}
        send_data['name'] = row.find('[name="name"]').val()
        //send_data['short_name'] = row.find('[name="short_name"]').val()

        ajax_blocks_action('PUT', send_data, 'edit block', id).then(function (data) {
            console.log(data)
            old_data = {}
            set_row_edit_mode(row, false)
        })
    })
    $('#blocks-table').on('click', '.delete-block', function(e) {
        let row = $(this).closest('tr')

        let id = row.attr('data-block')
        let send_data = {}

        ajax_blocks_action('DELETE', send_data, 'delete block', id).then(function (data) {
            console.log(data)
            blocks_table.ajax.reload()
        })
    })
    $('#blocks-table').on('click', '.cancel-block', function(e) {
        let row = $(this).closest('tr')

        row.find('[name="name"]').val(old_data['name'])
        //let select = row.find('[name="short_name"]');
        //let val = select.attr('data-value')
        // let newOption = new Option(val, val, false, true);
        // select.append(newOption).trigger('change');

        old_data = {}

        set_row_edit_mode(row, false)
    })
})

function set_row_edit_mode(row = null, active = true) {
    row.find('input').prop('disabled', !active)
    row.find('select').prop('disabled', !active)
    row.find('.swap-button').toggleClass('d-none')
}