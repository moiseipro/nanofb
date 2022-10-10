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
// var minDate, maxDate
// $.fn.dataTable.ext.search.push(
//     function( settings, data, dataIndex ) {
//         var min = minDate.val();
//         var max = maxDate.val();
//         var date = new Date( data[4] );
//
//         if (
//             ( min === null && max === null ) ||
//             ( min === null && date <= max ) ||
//             ( min <= date   && max === null ) ||
//             ( min <= date   && date <= max )
//         ) {
//             return true;
//         }
//         return false;
//     }
// );

$(window).on('load', function (){
    $('#toggle_btn').click()
    $('.move_to_today').text(moment().format('DD/MM/YYYY'))
    $('input.refDate').val(strDate);

    generateNewCalendar()
    generateMicrocyclesTable()
    //generateEventTable()

    $('.move_to_last_month').on('click', function () {
        today = moment(strDate, 'DD/MM/YYYY')
        days = today.subtract(1, 'month').daysInMonth()-1
        today.set('date', days/2)
        middleDay = Math.floor(days%2==0 ? days/2 : days/2)
        strDate = today.format('DD/MM/YYYY')

        $('.refDate').val(strDate);
        generateNewCalendar()
    })
    $('.move_to_next_month').on('click', function () {
        today = moment(today, 'DD/MM/YYYY')
        days = today.add(1, 'month').daysInMonth()-1
        today.set('date', days/2)
        middleDay = Math.floor(days%2==0 ? days/2 : days/2)
        strDate = today.format('DD/MM/YYYY')

        $('.refDate').val(strDate);
        generateNewCalendar()
    })
    $('.move_to_today').on('click', function () {
        today = moment()
        days = today.daysInMonth()-1
        today.set('date', days/2)
        middleDay = Math.floor(days%2==0 ? days/2 : days/2)
        strDate = today.format('DD/MM/YYYY')

        $('.refDate').val(strDate);
        generateNewCalendar()
    })

    // Выделение ячеек календаря при наведении на строку
    $('#events tbody').on('mouseenter', 'tr', function () {
        $('.hasEvent[data-value="'+$(this).attr('data-value')+'"]').addClass('hover-cell')
    })
    $('#events tbody').on('mouseleave', 'tr', function () {
        $('.hasEvent[data-value="'+$(this).attr('data-value')+'"]').removeClass('hover-cell')
    })
    // Выделение строк при наведении на ячейки календаря
    $('#event_calendar').on('mouseenter', '.hasEvent', function () {
        $(this).addClass('hover-cell')
        $('#events tbody tr[data-value="'+$(this).attr('data-value')+'"]').addClass('bg-light')
    })
    $('#event_calendar').on('mouseleave', '.hasEvent', function () {
        $(this).removeClass('hover-cell')
        $('#events tbody tr[data-value="'+$(this).attr('data-value')+'"]').removeClass('bg-light')
    })

    $('#event_calendar').on('click', '.microcycle_cell', function () {
        $('#event_calendar .microcycle_cell.selected').not($(this)).removeClass('selected')
        $(this).toggleClass('selected')
        //events_table.draw()
    })
    $(document).on('click', '.hasEvent', function () {
        let data_id = $(this).attr('data-value')
        console.log(data_id)
        if($(this).hasClass('selected')) {
            $('.hasEvent').removeClass('selected')
        }
        else {
            $('.hasEvent').removeClass('selected')
            $('.hasEvent[data-value="'+data_id+'"]').addClass('selected')
        }
    })


    $('#microcycle-modal').on('click', '.create', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        //console.log('CREATE : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'POST')
        $('#microcycles-form').removeClass('d-none')
        $('#microcycles-form #id_name').val('')
        $('#microcycles-form #datetimepicker-with-microcycle').val('')
        $('#microcycles-form #datetimepicker-by-microcycle').val('')
    })
    //Активация редактирования микроцикла
    $('#microcycles').on('click', '.edit', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        //console.log('EDIT : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'PATCH')
        $('#microcycles-form').removeClass('d-none')
        $('#microcycles-form #id_name').val(cur_edit_data['name'])
        $('#microcycles-form #datetimepicker-with-microcycle').val(cur_edit_data['date_with'])
        $('#microcycles-form #datetimepicker-by-microcycle').val(cur_edit_data['date_by'])
    })
    //Удаление микроцикла
    $('#microcycles').on('click', '.delete', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        //console.log('DELETE : ', cur_edit_data);
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
        //console.log($(this).serialize())
        ajax_microcycle_update($(this).attr('method'), $(this).serialize(), cur_edit_data ? cur_edit_data.id : 0)
    })

    // Создание события
    $('#event-add').on('click', function() {
        $('#form-event').attr('method', 'POST')
        clear_event_form()
    })
    // Отправка формы создания события
    $('#form-event').on('submit', function(e) {
        e.preventDefault()
        let data = getFormData($(this))
        //console.log(data)
        data['date'] = data['date']+' '+data['time']
        ajax_event_action($(this).attr('method'), data, 'create', cur_edit_data ? cur_edit_data.id : 0).then(function( data ) {
            //if(events_table) events_table.ajax.reload()
            clear_event_form()
            generateNewCalendar()
        })
    })

    // Отправка формы редактирования события
    $('#form-event-edit').on('submit', function(e) {
        e.preventDefault()
        let data = getFormData($(this))
        console.log(data)
        data['date'] = data['date']+' '+data['time']
        ajax_event_action($(this).attr('method'), data, 'update', cur_edit_data ? cur_edit_data.id : 0).then(function( data ) {
            //if(events_table) events_table.ajax.reload()
            generateNewCalendar()
        })
    })

    $('#toggle-calendar').on('click', function () {
        $('#event_calendar').toggleClass('d-none')
        $(this).children('i').toggleClass('fa-arrow-up').toggleClass('fa-arrow-down')
    })

    $('#events').on('click', '.switch-favorites', function () {
        let this_obj = $(this)
        let id = this_obj.closest('tr.hasEvent').attr('data-value')
        let data = {}
        data.favourites = this_obj.hasClass('fa-star-o')
        //console.log(data)
        ajax_training_action('PUT', data, 'favourites', id).then(function (data) {
            if(data.favourites) this_obj.addClass('fa-star').removeClass('fa-star-o')
            else this_obj.removeClass('fa-star').addClass('fa-star-o')
        })
    })

    $('#event_calendar').on('rescalendar.update', function () {
        //events_table.ajax.reload()
        $('#event_calendar .dataRow').each(function () {
            //console.log($(this).find('.data_cell[data-value!=""]').length)
            if ($(this).find('.data_cell[data-value!=""]').length>0) return

            $(this).hide()
        })
    })
})

function clear_event_form(){
    let nowdate = moment().format('DD/MM/YYYY')
    let nowtime = moment().format('HH:mm')
    $('#form-event #id_short_name').val('')
    $('#form-event #id_event_type option:first').prop('selected', true)
    $('#form-event #id_event_type').trigger('change');
    $('#form-event #datetimepicker-event').val(nowdate)
    $('#form-event #timepicker-event').val(nowtime)
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
        format: 'DD/MM/YYYY',
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
        //console.log(data)
        create_alert('alert-update', {type: 'success', message: gettext('The action with the microcycle was successfully completed!')})
        generateNewCalendar()
        microcycles_table.ajax.reload()
    })

    request.fail(function( jqXHR, textStatus ) {
        alert( gettext('Error when updating the microcycle. ') + gettext(textStatus) );
    })
}

var microcycle_arr = null
function generateNewCalendar(){
    newMicrocycle = []
    newEvent = []

    let send_data ={}

    let from_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-start')
    let to_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-end')
    let today = strDate

    console.log(strDate)
    console.log(middleDay)

    let from_date = undefined
    let to_date = undefined

    if(from_date_str){
        from_date = moment(from_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }
    if(to_date_str){
        to_date = moment(to_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    if(!from_date_str && !to_date_str && today){
        from_date = moment(today, 'DD/MM/YYYY').add(-45, 'day').format('YYYY-MM-DD')
        to_date = moment(today, 'DD/MM/YYYY').add(45, 'day').format('YYYY-MM-DD')
    }

    send_data['from_date'] = from_date
    send_data['to_date'] = to_date
    console.log(send_data)

    $('#events tbody').html('')

    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: 'api/microcycles/',
        type: 'GET',
        dataType: "JSON",
        success: function(data){
            microcycle_arr = data['results']
            for (var microcycle of microcycle_arr) {
                newMicrocycle.push({
                    id: microcycle['id'],
                    name: microcycle['name'],
                    startDate: microcycle['date_with'],
                    endDate: microcycle['date_by'],
                    customClass: 'green_cell',
                    href: '#empty'
                })
            }
            //console.log(newMicrocycle)
            $.ajax({
                headers:{"X-CSRFToken": csrftoken },
                url: '/events/api/action/',
                type: 'GET',
                dataType: "JSON",
                data: send_data,
                success: function(data){
                    console.log(data['results'])
                    let num_tr = 1, num_m = 1, count_tr = 0, count_m = 0, event_date = '', event_class=''
                    let last_date = moment(to_date, 'YYYY-MM-DD')
                    let first_date = moment(from_date, 'YYYY-MM-DD')
                    let generated_events = []

                    let days = last_date.diff(first_date, 'days')
                    if(days!=0) {
                        for (let i = 0; i < days-1; i++){
                            last_date.add(-1, 'days')
                            let isSame = false
                            //console.log(last_date.format('DD/MM/YYYY'))
                            for (let event of data['results']) {
                                let cur_date = moment(event['only_date'], 'DD/MM/YYYY')
                                if(cur_date.isSame(last_date)){
                                    generated_events.push(event)
                                    isSame = true
                                }
                            }
                            if(!isSame) {
                                generated_events.push({
                                    id: null,
                                    short_name: '---',
                                    only_date: last_date.format('DD/MM/YYYY'),
                                    training: null,
                                    match: null
                                })
                            }
                        }

                    }

                    $.each(generated_events, function( index, event ) {
                        let event_id = event['id'],
                            event_name = '',
                            event_short_name = event['short_name']
                        let tr_html = ``

                        let only_date = moment(event['only_date'], 'DD/MM/YYYY')
                        let count_day = 0
                        newMicrocycle.forEach(function(microcycle, i) {
                            let date_with = moment(microcycle['startDate'], 'DD/MM/YYYY')
                            let date_by = moment(microcycle['endDate'], 'DD/MM/YYYY')
                            if(only_date.isBetween( date_with, date_by, undefined, '[]')){
                                count_day = only_date.diff(date_with, "days")+1
                                if(count_day < 3) count_day = '+'+count_day
                                else{
                                    count_day = only_date.diff(date_by, "days")
                                    if(count_day==0) count_day = 'o'
                                }
                            }
                        });

                        tr_html += `<tr class="${event_id!=null ? 'hasEvent' : ''}" data-value="${event_id}">`
                        if('training' in event && event['training'] != null){
                            num_tr = 1
                            if(event_class === 'trainingClass' && event['only_date'] === event_date) num_tr++
                            event_name = 'tr'+num_tr
                            event_class = 'trainingClass'
                            count_tr++

                            tr_html += `
                                <td>${count_tr}</td>
                                <td>${event['only_date']}</td>
                                <td><a href="/trainings/view/${event.training.event_id}" class="btn btn-sm btn-block btn-info py-0" data-id="${event.training.event_id}">${gettext('Training')+' '+num_tr}</a></td>
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td><i class="switch-favorites fa ${event.training.favourites ? 'fa-star':'fa-star-o'} aria-hidden="true"></i></td>
                                <td>0</td>
                                <td>0</td>
                            `
                        } else if('match' in event && event['match'] != null){
                            event_name = 'm'+(event['match']['m_type']+1)
                            event_class = 'matchClass'+event['match']['m_type']
                            count_m++
                            count_tr = 0

                            tr_html += `
                                <td class="text-danger"><b>${count_m}</b></td>
                                <td>${event['only_date']}</td>
                                <td><a href="/matches/match?id=${event.match.event_id}" class="btn btn-sm btn-block ${event.match.m_type == 0 ?"btn-warning":"btn-success"} py-0" data-id="${event.match.event_id}">${gettext('Match')}</a></td>
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td>---</td>
                                <td>---</td>
                                <td>---</td>
                            `
                        } else {
                            event_class = 'none'
                            count_tr++
                            tr_html += `
                                    <td>${count_tr}</td>
                                    <td>${event['only_date']}</td>
                                    <td><a href="#" class="btn btn-sm btn-block btn-secondary py-0 disabled">${gettext('Recreation')}</a></td>
                                    <td>${count_day==0 ? '---' : count_day}</td>
                                    <td>---</td>
                                    <td>---</td>
                                    <td>---</td>
                                `
                        }
                        tr_html += `</tr>`
                        event_date = event['only_date']
                        newEvent.push({
                            id: event_id,
                            name: event_name,
                            startDate: event_date,
                            endDate: event_date,
                            customClass: event_class,
                            customValue: event_id,
                            title: 'TEST',
                            href: '#',
                            text: event_short_name
                        })
                        $('#events tbody').append(tr_html)
                    })
                    //console.log(newEvent)
                },
                error: function(jqXHR, textStatus){
                    //console.log(jqXHR)
                    swal(gettext('Event save'), gettext('Error when action the event!'), "error");
                },
                complete: function () {
                    $('.page-loader-wrapper').fadeOut();

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
                        dataKeyValues: ['m2', 'm1', 'tr1', 'tr2']
                    });
                }
            })
        },
        error: function(jqXHR, textStatus){
            //console.log(jqXHR)
            swal(gettext('Event save'), gettext('Error when action the event!'), "error");
        },
        complete: function () {
        }
    })
}

function generateMicrocyclesTable(){
    microcycles_table = $('#microcycles').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md-12' f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        order: [ 1, 'desc' ],
        serverSide: true,
        processing: true,
        lengthChange: false,
        pageLength: 20,
        ajax: {
            url:'api/microcycles/?format=datatables',
            data: function(data){
                //console.log(data)
            },
        },
        columns: [
            {'data': 'name'},
            {'data': 'date_with', 'searchable': 'false'},
            {'data': 'date_by' , 'searchable': 'false'},
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
    let last_date = null
    let last_event = ''
    events_table = $('#events').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        order: [ 1, 'desc' ],
        columnDefs: [
            { orderable: false, targets: '_all' }
        ],
        createdRow: function( row, data, dataIndex ) {
            $(row).attr('data-value', data.id)
            $(row).addClass('hasEvent')

            console.log($(row).find('.btn').text())
            if(last_date == null) {
                last_date = moment(data['only_date'], 'DD/MM/YYYY')
                if(data['training'] != null) last_event = 'training';
                if(data['match'] != null) last_event = 'match';
                return
            }
            let cur_date = moment(data['only_date'], 'DD/MM/YYYY')
            let days = last_date.diff(cur_date, 'days')

            if(days==0 && last_event != '') {
                if(data[last_event]!=null){
                    console.log(days)
                    $(row).find('.btn').text($(row).find('.btn').text()+' 2')
                }
            }
            last_date = cur_date
        },
        serverSide: true,
        processing: true,
        select: true,
        lengthChange: false,
        pageLength: 20,
        ajax: {
            url:'api/action/?format=datatables',
            data: function(data){
                //console.log(data)
                let from_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-start')
                let to_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-end')
                let today = $('#event_calendar .middleDay').attr('data-celldate')
                //console.log(today)
                let from_date = undefined
                let to_date = undefined

                if(from_date_str){
                    from_date = moment(from_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
                }
                if(to_date_str){
                    to_date = moment(to_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
                }

                if(!from_date_str && !to_date_str){
                    from_date = moment(today, 'DD/MM/YYYY').add(-45, 'day').format('YYYY-MM-DD')
                    to_date = moment(today, 'DD/MM/YYYY').add(45, 'day').format('YYYY-MM-DD')
                }

                //console.log(to_date)
                // Append to data
                //data.columns[1].search.value = {'date_after': from_date, 'date_before': to_date}
                data.columns[1].search.value = {'only_date_after': from_date, 'only_date_before': to_date}
                //console.log(data)
            },
        },
        columns: [
            {'data': 'id', render: function (data, type, row, meta) {

                return meta.row + meta.settings._iDisplayStart + 1;
            }},
            {'data': 'only_date', 'name': 'only_date', 'type': 'datetime'},
            {'data': function (data, type, dataToSet) {
                //console.log(data)
                if(type === 'display') {
                    if ('training' in data && data.training != null) {
                        return `<a href="/trainings/view/${data.training.event_id}" class="btn btn-sm btn-info py-0" data-id="${data.training.event_id}">${gettext('Training')}</a>`
                    } else if ('match' in data && data.match != null){
                        return `<a href="/matches/match?id=${data.match.event_id}" class="btn btn-sm ${data.match.m_type == 0 ?"btn-success":"btn-warning"} py-0" data-id="${data.match.event_id}">${gettext('Match')}</a>`
                    } else {
                        return gettext('---')
                    }
                } else return null
            }},
            {'data': function (data, type, dataToSet) {
                //console.log(microcycle_arr)
                //console.log(data)
                let only_date = moment(data['only_date'], 'DD/MM/YYYY')
                //console.log(only_date)
                let count_day = 0
                microcycle_arr.forEach(function(microcycle, i) {
                    //console.log(microcycle);
                    let date_with = moment(microcycle['date_with'], 'DD/MM/YYYY')
                    let date_by = moment(microcycle['date_by'], 'DD/MM/YYYY')
                    if(only_date.isBetween( date_with, date_by, undefined, '[]')){
                        count_day = only_date.diff(date_with, "days")+1
                        if(count_day < 3) count_day = '+'+count_day
                        else{
                            count_day = only_date.diff(date_by, "days")
                            if(count_day==0) count_day = 'o'
                        }
                        //console.log(count_day)
                    }
                });
                if(type === 'display') {
                    if(count_day==0) return `---`
                    else return count_day
                } else return null
            }},
            {'data': function (data, type, dataToSet) {
                //console.log(data)
                let html_view = ''
                if(type === 'display') {
                    if ('training' in data && data.training != null) {
                        html_view += '<i class="switch-favorites fa '
                        if (data.training.favourites == true) html_view += 'fa-star'
                        else html_view += 'fa-star-o'
                        html_view += '" aria-hidden="true"></i>'
                    } else {
                        html_view = '---'
                    }
                } else html_view = '---'
                return html_view
            }},
            {'data': function (data, type, dataToSet) {
                //console.log(data)
                let html_view = '<div class="row text-center mx-0">'
                if(type === 'display') {
                    if ('training' in data && data.training != null) {
                        // let duration = 0;
                        // if ('exercises_info' in data.training && data.training.exercises_info.length > 0) {
                        //
                        //     $.each(data.training.exercises_info, function( index, exs_data ) {
                        //         if(exs_data.group == 1) duration+=exs_data['duration']
                        //     });
                        //     console.log(duration)
                        //     duration += '`'
                        // } else {
                        //     duration += '`'
                        // }
                        html_view += '<div class="col-6 border-left px-0">0</div><div class="col-6 border-left px-0">0</div>'
                    } else if ('match' in data && data.match != null){
                        html_view = '---'
                    } else {
                        html_view = '---'
                    }
                } else html_view = '---'
                html_view += '</div>'
                return html_view
            }},
        ],
    })

    events_table
        .on( 'select', function ( e, dt, type, indexes ) {
            let rowData = events_table.rows( indexes ).data().toArray();
            //console.log(rowData)
            if(type=='row') {
                $('.rescalendar .hasEvent[data-value="'+rowData[0]['id']+'"]').addClass('selected')
                //ajax_video_info(rowData[0])
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = events_table.rows( indexes ).data().toArray();
            $('.rescalendar .hasEvent[data-value="'+rowData[0]['id']+'"]').removeClass('selected')
        })
}

// ContextMenu для календаря
$(function() {
    $.contextMenu({
        selector: '.hasEvent',
        build: function($triggerElement, e){
            return {
                callback: function(key, options){
                    let event_id = $(this).attr('data-value')
                    if(key === 'delete'){
                        window.console && console.log(event_id);
                        ajax_event_action('DELETE', null, 'delete', event_id).then(function( data ) {
                            //if(events_table) events_table.ajax.reload()
                            generateNewCalendar()
                        })
                    } else if(key === 'edit'){
                        window.console && console.log(event_id);
                        $('#form-event-edit-modal').modal('show');
                        cur_edit_data = events_table.row($('#events .hasEvent[data-value="'+event_id+'"]')).data()
                        console.log(cur_edit_data);
                        $('#form-event-edit #id_short_name').val(cur_edit_data['short_name'])
                        $('#form-event-edit #datetimepicker-event').val(cur_edit_data['only_date'])
                        $('#form-event-edit #timepicker-event').val(cur_edit_data['time'])
                    }
                },
                items: {
                    // "add": {name: gettext('Delete'), icon: "fa-trash"},
                    "edit": {name: gettext('Edit'), icon: "fa-pencil"},
                    "delete": {name: gettext('Delete'), icon: "fa-trash"},
                    "sep1": "---------",
                    "close": {name: gettext('Close'), icon: function(){
                        return 'context-menu-icon context-menu-icon-quit';
                    }}
                }
            };
        },
    });
})