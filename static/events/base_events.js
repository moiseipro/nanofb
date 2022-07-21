var d = new Date()
var days = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()-1
var middleDay = (("0" + Math.floor(days/2)).slice(-2))
var strDate = middleDay + "/" + ("0" + (d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()

var microcycles_table, events_table
var cur_edit_data

var newEvent = [
    {
        id: 1,
        name:'m2',
        startDate:'01/06/2022',
        endDate:'03/06/2022',
        customClass: 'matchClass'+2,
        customValue: 1,
        title: 'TEST',
        href: '#event_2_'+2,
        text: 'MA'
    }
];

var newMicrocycle = [
    {
        id: 1,
        name:'Test',
        startDate:'27/05/2022',
        endDate:'03/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    },
    {
        id: 2,
        name:'Test',
        startDate:'06/06/2022',
        endDate:'09/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    },
    {
        id: 3,
        name:'Test',
        startDate:'17/06/2022',
        endDate:'18/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    },
    {
        id: 4,
        name:'Test',
        startDate:'19/06/2022',
        endDate:'27/06/2022',
        customClass: 'green_cell',
        href: '#event_2_'+2,
    }
];

$(window).on('load', function (){
    $('.move_to_today').text(moment().format('DD/MM/YYYY'))
    $('.refDate').val(strDate);

    generateNewCalendar()
    generateMicrocyclesTable()
    generateEventTable()

    $('#microcycle-modal').on('click', '.create', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        console.log('CREATE : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'POST')
        $('#microcycles-form').removeClass('d-none')
        $('#microcycles-form #id_name').val('')
        $('#microcycles-form #datetimepicker-with-microcycle').val('')
        $('#microcycles-form #datetimepicker-by-microcycle').val('')
    })
    //Активация редактирования микроцикла
    $('#microcycles').on('click', '.edit', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        console.log('EDIT : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'PATCH')
        $('#microcycles-form').removeClass('d-none')
        $('#microcycles-form #id_name').val(cur_edit_data['name'])
        $('#microcycles-form #datetimepicker-with-microcycle').val(cur_edit_data['date_with'])
        $('#microcycles-form #datetimepicker-by-microcycle').val(cur_edit_data['date_by'])
    })
    //Удаление микроцикла
    $('#microcycles').on('click', '.delete', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        console.log('DELETE : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'DELETE')
        $('#microcycles-form').addClass('d-none')
        $('#microcycles-form #id_name').val('')
        $('#microcycles-form #datetimepicker-with-microcycle').val('')
        $('#microcycles-form #datetimepicker-by-microcycle').val('')
        ajax_microcycle_update($('#microcycles-form').attr('method'), null, cur_edit_data ? cur_edit_data.id : 0)
    })
    //Отмена редактирования/добавления микроцикла
    $('#microcycles-form').on('click', '.cancel', function() {
        $('#microcycles-form').addClass('d-none')
        $('#microcycles-form #id_name').val('')
        $('#microcycles-form #datetimepicker-with-microcycle').val('')
        $('#microcycles-form #datetimepicker-by-microcycle').val('')
    })
    $('#microcycles-form').on('submit', function(e) {
        e.preventDefault()
        $('#microcycles-form').addClass('d-none')
        console.log($(this).serialize())
        ajax_microcycle_update($(this).attr('method'), $(this).serialize(), cur_edit_data ? cur_edit_data.id : 0)
    })

    // Создание события
    $('#event-add').on('click', function() {
        $('#form-event').attr('method', 'POST')
        clear_event_form()
    })
    // Отправка формы действия с событием
    $('#form-event').on('submit', function(e) {
        e.preventDefault()
        console.log($(this).serialize())
        ajax_event_action($(this).attr('method'), $(this).serialize(), cur_edit_data ? cur_edit_data.id : 0)
    })
})

function clear_event_form(){
    let now = moment().format('DD/MM/YYYY HH:mm')
    $('#form-event #id_short_name').val('')
    $('#form-event #id_event_type option:first').prop('selected', true)
    $('#form-event #id_event_type').trigger('change');
    $('#form-event #datetimepicker-event').val(now)
}

// Инициализация datepicker для выбора промежутка
$(function () {
    $('#datetimepicker-with-microcycle').datetimepicker({
        format: 'DD/MM/YYYY',
        locale: get_cur_lang(),
        icons: {
            up: "fa fa-angle-up",
            down: "fa fa-angle-down",
            next: 'fa fa-angle-right',
            previous: 'fa fa-angle-left'
        },
    });
    $('#datetimepicker-by-microcycle').datetimepicker({
        format: 'DD/MM/YYYY',
        locale: get_cur_lang(),
        icons: {
            up: "fa fa-angle-up",
            down: "fa fa-angle-down",
            next: 'fa fa-angle-right',
            previous: 'fa fa-angle-left'
        },
        useCurrent: false
    });

    $('#datetimepicker-event').datetimepicker({
        format: 'DD/MM/YYYY HH:mm',
        locale: get_cur_lang(),
        icons: {
            up: "fa fa-angle-up",
            down: "fa fa-angle-down",
            next: 'fa fa-angle-right',
            previous: 'fa fa-angle-left'
        }
    });

    $("#datetimepicker-with-microcycle").on("change.datetimepicker", function (e) {
        $('#datetimepicker-by-microcycle').datetimepicker('minDate', e.date);
    });
    $("#datetimepicker-by-microcycle").on("change.datetimepicker", function (e) {
        $('#datetimepicker-with-microcycle').datetimepicker('maxDate', e.date);
    });
})

function ajax_microcycle_update(method, data, id) {
    if (!confirm(gettext('Save changes to the microcycle?'))) return false

    let url = "api/microcycles/"
    if(method != 'POST') url += id+"/"

    let request = $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data
    })

    request.done(function( data ) {
        console.log(data)
        create_alert('alert-update', {type: 'success', message: gettext('The action with the microcycle was successfully completed!')})
        generateNewCalendar()
        microcycles_table.ajax.reload()
    })

    request.fail(function( jqXHR, textStatus ) {
        alert( gettext('Error when updating the microcycle. ') + gettext(textStatus) );
    })
}

function ajax_event_action(method, data, id = '') {
    if (!confirm(gettext('Apply action to event?'))) return false

    console.log(method +' '+ id)

    let url = "api/action/"
    if(method !== 'POST') url += `${id}/`

    $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function(data){
            console.log(data)
            swal(gettext('Event save'), gettext('Event saved successfully!'), "success");
            events_table.ajax.reload()
        },
        error: function(jqXHR, textStatus){
            console.log(jqXHR)
            swal(gettext('Event save'), gettext('Error when action the event!'), "error");
        },
        complete: function () {
            if(method === 'POST') {
                clear_event_form()
            }
        }
    })
}

function generateNewCalendar(){
    let request = $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: 'api/microcycles/',
        type: 'GET',
        dataType: "JSON",
    })

    request.done(function( data ) {
        newMicrocycle = []
        for (var microcycle of data['results']) {
            newMicrocycle.push({
                id: microcycle['id'],
                name: microcycle['name'],
                startDate: microcycle['date_with'],
                endDate: microcycle['date_by'],
                customClass: 'green_cell',
                href: '#empty'
            })
        }
        console.log(newMicrocycle)
        $('#event_calendar').rescalendar({
            id: 'training_calendar',
            format: 'DD/MM/YYYY',
            jumpSize: middleDay-1,
            calSize: days,
            locale: 'ru',
            refDate: strDate,
            lang: {
                'today': gettext('Today'),
                'init_error': gettext('Failed to initialize'),
                'no_data_error' : gettext('No data was found to show')
            },
            data: newEvent,
            microcycles: newMicrocycle,
            dataKeyField: 'name',
            dataKeyValues: ['m1', 'm2', 'tr1', 'tr2']
        });
    })


    $('.move_to_today').click()
}

function generateMicrocyclesTable(){
    microcycles_table = $('#microcycles').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md-12' f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        order: [ 1, 'asc' ],
        serverSide: true,
        processing: true,
        lengthChange: false,
        pageLength: 20,
        ajax: 'api/microcycles/?format=datatables',
        columns: [
            {'data': 'name'},
            {'data': 'date_with'},
            {'data': 'date_by'},
            {'data': 'id' , render : function ( data, type, row, meta ) {
              return type === 'display'  ?
                '<button class="btn btn-sm btn-warning mx-1 py-0 edit" data-id="'+data+'"><i class="fa fa-pencil"></i></button>'+
                '<button class="btn btn-sm btn-danger mx-1 py-0 delete" data-id="'+data+'"><i class="fa fa-trash"></i></button>':
                data;
            }}
        ],
    })
}

function generateEventTable(){
    events_table = $('#events').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        order: [ 1, 'asc' ],
        serverSide: true,
        processing: true,
        lengthChange: false,
        pageLength: 20,
        ajax: 'api/action/?format=datatables',
        columns: [
            {'data': 'id'},
            {'data': 'date'},
            {'data': function (data, type, dataToSet) {
                console.log(data)
                if(type === 'display') {
                    if ('training' in data && data.training != null) {
                        return '<a href="/trainings/'+data.training.id+'" class="btn btn-sm btn-info py-0" data-id="'+data.training.id+'">'+gettext('Training')+'</a>'
                    }
                }
            }},
            {'data': 'id' , render : function ( data, type, row, meta ) {
              return type === 'display'  ?
                '<button class="btn btn-sm btn-warning mx-1 py-0 edit" data-id="'+data+'"><i class="fa fa-pencil"></i></button>'+
                '<button class="btn btn-sm btn-danger mx-1 py-0 delete" data-id="'+data+'"><i class="fa fa-trash"></i></button>':
                data;
            }}
        ],
    })
}