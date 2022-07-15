var cur_edit_data
var team_table

$(window).on('load', function (){
    team_table = $('#teams').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md 'l><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        buttons: [
            {
                extend: '',
                text: gettext('Create')+' <i class="fa fa-plus" aria-hidden="true"></i>',
                className: 'btn-primary btn-sm',
                action: function ( e, dt, node, config ) {
                    $('#form-team').attr('method', 'POST')
                    $('#form-team-modal-label').text(gettext('Creating a team'))
                    clear_team_form()
                    $('#form-team-modal').modal('show')
                }
            },
        ],
        ajax: 'api/teams/?format=datatables',
        columns: [
            {'data': 'id'},
            {'data': 'name'},
            {'data': 'short_name'},
            {'data': 'ref_team_status.name', 'name': 'ref_team_status.short_name'},
            {'data': 'id' , render : function ( data, type, row, meta ) {
              return type === 'display'  ?
                '<button class="btn btn-sm btn-warning mx-1 py-0 edit" data-id="'+data+'"><i class="fa fa-pencil"></i></button>'+
                '<button class="btn btn-sm btn-danger mx-1 py-0 delete" data-id="'+data+'"><i class="fa fa-trash"></i></button>':
                data;
            }}
        ],

    })

    // Редактирования команды
    $('#teams').on('click', '.edit', function() {
        cur_edit_data = team_table.row($(this).closest('tr')).data()
        console.log('EDIT : ', cur_edit_data);
        $('#form-team-modal-label').text(gettext('Changing the team'))
        $('#form-team').attr('method', 'PATCH')
        $('#form-team #id_name').val(cur_edit_data['name'])
        $('#form-team #id_short_name').val(cur_edit_data['short_name'])
        $('#form-team #id_ref_team_status').val(cur_edit_data['ref_team_status'])
        $('#form-team-modal').modal('show')
    })
    // Удаление команды
    .on('click', '.delete', function() {
        cur_edit_data = team_table.row($(this).closest('tr')).data()
        console.log('DELETE : ', cur_edit_data);
        $('#form-team').attr('method', 'DELETE')
        clear_team_form()
        ajax_team_action($('#microcycles-form').attr('method'), null, cur_edit_data ? cur_edit_data.id : 0)
    })
    // Отправка формы действия с командой
    $('#form-team').on('submit', function(e) {
        e.preventDefault()
        console.log($(this).serialize())
        ajax_team_action($(this).attr('method'), $(this).serialize(), cur_edit_data ? cur_edit_data.id : 0)
    })
})

function clear_team_form() {
    $('#form-team #id_name').val('')
    $('#form-team #id_short_name').val('')
    $('#form-team #id_ref_team_status option').prop('selected', false)
    $('#form-team #id_ref_team_status option:first').prop('selected', true)
}

function ajax_team_action(method, data, id = '') {
    if (!confirm(gettext('Apply action to team?'))) return false

    let url = "api/teams/"
    if(method !== 'POST') url += `${id}/`

    $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function(data){
            console.log(data)
            create_alert('alert-update', {type: 'success', message: gettext('Team saved successfully!')})
            team_table.ajax.reload()
        },
        error: function(jqXHR, textStatus){
            create_alert('alert-update', {type: 'danger', message: gettext('Error when action the team!')})
        },
        complete: function () {
            if(method === 'POST') {
                clear_team_form()
            }
        }
    })
}