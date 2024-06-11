var minDate = moment($('#select-season option:selected').attr('data-with'), 'DD/MM/YYYY')
var maxDate = moment($('#select-season option:selected').attr('data-by'), 'DD/MM/YYYY')
var d = moment()
if(Cookies.get('date')){
    d = moment(Cookies.get('date'), 'DD/MM/YYYY')
}

if(!maxDate.isAfter(d)){
    d = maxDate;
}
if(!d.isAfter(minDate)){
    d = minDate;
}

var days = d.daysInMonth()-1
d.set('date', days/2)
var middleDay = Math.floor(days%2==0 ? days/2 : days/2)
var strDate = d.format('DD/MM/YYYY')


var microcycles_table, events_table
var cur_edit_data

var calendar_active = true;
var card_active = false;
var mc_active = false;

var newEvent;

var newMicrocycle;

var objective_block = '';

$(window).on('load', function (){
    generate_ajax_objectives_table('45vh')
    generate_ajax_aobjectives_table('45vh')
    generate_ajax_blocks_table('45vh')
    generate_ajax_ablocks_table('45vh')
    generate_ajax_loads_table('45vh')


    create_ajax_select2($('#nav-user-objectives select'), gettext('Short key'), '/trainings/objectives_short', $('#references-modal'), false)
    create_ajax_select2($('#nav-user-blocks select'), gettext('Short key'), '/trainings/blocks_short', $('#references-modal'), false)
    create_ajax_select2($('#nav-admin-objectives select'), gettext('Short key'), '/trainings/aobjectives_short', $('#references-modal'), false)
    create_ajax_select2($('#nav-admin-blocks select'), gettext('Short key'), '/trainings/ablocks_short', $('#references-modal'), false)
    create_ajax_select2($('#training-loads-tab select'), gettext('Short key'), '/trainings/loads_short', $('#references-modal'), false)



    $('#toggle_btn').click()

    $('input.refDate').val(strDate);

    if($('#select-season').val()!='' && $('#select-team').val()!=''){
        generateData()
        generateMicrocyclesTable()
    } else {
        swal(gettext('Warning!'), gettext('Choose a team and a season!'), "warning");
    }

    $('.move_to_last_month').on('click', function () {
        today = moment(strDate, 'DD/MM/YYYY').subtract(1, 'month')

        if(!maxDate.isAfter(today)){
            today = maxDate;
        }
        if(!today.isAfter(minDate)){
            today = minDate;
        }
        days = today.daysInMonth()-1
        today.set('date', days/2)
        middleDay = Math.floor(days%2==0 ? days/2 : days/2)
        strDate = today.format('DD/MM/YYYY')
        console.log(minDate.isAfter(today))
        console.log(maxDate.isAfter(today))
        Cookies.set('date', strDate, { expires: 1 })

        $('.refDate').val(strDate);
        generateData()
    })
    $('.move_to_next_month').on('click', function () {
        today = moment(strDate, 'DD/MM/YYYY').add(1, 'month')

        if(!maxDate.isAfter(today)){
            today = maxDate;
        }
        if(!today.isAfter(minDate)){
            today = minDate;
        }

        days = today.daysInMonth()-1
        today.set('date', days/2)
        middleDay = Math.floor(days%2==0 ? days/2 : days/2)
        strDate = today.format('DD/MM/YYYY')
        console.log(minDate.isAfter(today))
        console.log(maxDate.isAfter(today))
        Cookies.set('date', strDate, { expires: 1 })

        $('.refDate').val(strDate);
        generateData()
    })

    $('.move_to_today').on('click', function () {
        today = moment()
        days = today.daysInMonth()-1
        today.set('date', days/2)
        middleDay = Math.floor(days%2==0 ? days/2 : days/2)
        strDate = today.format('DD/MM/YYYY')
        Cookies.set('date', strDate, { expires: 1 })

        $('.refDate').val(strDate);
        generateData()
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
        generateData()
    })
    $(document).on('click', '.hasEvent', function (event) {
        let data_id = $(this).attr('data-value')
        console.log(event.target)

        let this_obj = $(this)
        let select_obj = ''

        console.log($(event.target))

        if($(event.target).is('.event-select')) {
            select_obj = $(event.target)
        } else if ($(event.target).is('td') || $(event.target).is('.event-row-info')) {
            select_obj = $(event.target).closest('.hasEvent').find('.event-select:first')
        }

        if (select_obj == '') return ;
        if (this_obj.hasClass('selected') && select_obj.hasClass('selected')) {
            Cookies.remove('event_id')
            $('.hasEvent').removeClass('selected')
            $('.event-select').removeClass('selected')
            $('.event-row-info').addClass('d-none')
            $('.event-row-info').filter(function( index, element ) {
                return $(element).attr('data-id') == '';
            }).removeClass('d-none')
            $('.training-card-objective').addClass('d-none')
            $('.select-event-active').prop('disabled', true)
            $('#block-event-info .event-info').html('')
            $('#training-video-modal input[name="video_href"]').val('')
            $('#objective_1-event-view').val('')
            $('#objective_2-event-view').val('')
            $('#objective_3-event-view').val('')
            $('#load-event-view').val('')
            $('#objective_1-training-view').parent().addClass('d-none')
            $('#training-block-view').parent().addClass('d-none')
            resize_events_table();
        } else {
            let data_id = select_obj.attr('data-id')
            console.log(data_id)
            Cookies.set('event_id', data_id, { expires: 1 })
            $('.hasEvent').removeClass('selected')
            $('.event-select').removeClass('selected')
            $('.select-event-active').prop('disabled', false)

            let events = $('.hasEvent').filter(function( index, element ) {

                let values = $(element).attr('data-value').split(',')
                let hasID = false
                for (const value of values) {
                    if (value == data_id) hasID = true
                }
                console.log(values + data_id + hasID)
                return hasID;
            })

            events.addClass('selected')
            events.find('.event-select').filter(function( index, element ) {
                return $(element).attr('data-id') == data_id;
            }).addClass('selected')
            $('.event-row-info').addClass('d-none')
            $('.event-row-info').filter(function( index, element ) {
                return $(element).attr('data-id') == '';
            }).removeClass('d-none')
            events.find('.event-row-info').filter(function( index, element ) {
                return $(element).attr('data-id') == data_id;
            }).removeClass('d-none')
            events.find('.event-row-info').filter(function( index, element ) {
                return $(element).attr('data-id') == '';
            }).addClass('d-none')
            //$('.hasEvent[data-value="' + data_id + '"]').addClass('selected')
            ajax_event_action('GET', null, 'view event', data_id).then(function (data) {
                let html_scheme = ``
                if ('training' in data && data.training != null) {
                    console.log(data.training)
                    $('.training-card-objective').removeClass('d-none')
                    $('#training-video-modal input[name="video_href"]').val(data.training.video_href)
                    $('#goal-event-view').val(data.training.goal)
                    let objective_type = ''
                    for (const objective of data.training.objectives) {
                        objective_type += `<div class="border px-1">${objective.objective.name}</div>`;
                        // else if(objective.type == 1){
                        //     objective_type_2 += `<div class="font-weight-bold border px-1">${objective.objective.name}</div>`;
                        // }
                    }
                    $('#objective_1-training-view').html(objective_type)
                    if (objective_type == '') $('#objective_1-training-view').parent().addClass('d-none')
                    else $('#objective_1-training-view').parent().removeClass('d-none')
                    // $('#objective_2-training-view').html(objective_type_2)
                    // if (objective_type_2 == '') $('#objective_2-training-view').parent().addClass('d-none')
                    // else $('#objective_2-training-view').parent().removeClass('d-none')
                    let blocks = ''
                    for (const block of data.training.blocks) {
                        blocks += `<div class="border px-1">${block.block.name}</div>`;
                    }
                    $('#training-block-view').html(blocks)
                    if (blocks == '') $('#training-block-view').parent().addClass('d-none')
                    else $('#training-block-view').parent().removeClass('d-none')

                    //$('#objective_3-event-view').val(data.training.objective_3)
                    $('#load-event-view').val(data.training.load_type)
                    if (data.training.exercises_info.length > 0) {
                        let exercises = data.training.exercises_info
                        for (let exercise of exercises) {
                            let count_slide = 0
                            let select_html = '', carousel_html = ''
                            if (exercise.scheme_img) {
                                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
                                count_slide++
                                carousel_html+= `
                                    <div class="carousel-item active">
                                        <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                            <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                                        </svg>
                                    </div>`
                            }
                            if(exercise.scheme_1){
                                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img ? 'active': ''}"></li>`
                                count_slide++
                                carousel_html+= `
                                    <div class="carousel-item ${!exercise.scheme_img ? 'active': ''}">
                                        <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                            <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" x="0" y="0"></image>
                                        </svg>
                                    </div>`
                            }
                            if(exercise.scheme_2){
                                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img && !exercise.scheme_1 ? 'active': ''}"></li>`
                                count_slide++
                                carousel_html+= `
                                    <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 ? 'active': ''}">
                                        <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                            <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" x="0" y="0"></image>
                                        </svg>
                                    </div>`
                            }
                            if(exercise.exercise_scheme){
                                if(exercise.exercise_scheme['scheme_1']){
                                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img && !exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}"></li>`
                                    count_slide++
                                    carousel_html+= `
                                        <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}">
                                            ${exercise.exercise_scheme['scheme_1']}
                                        </div>`
                                }
                                if(exercise.exercise_scheme['scheme_2']){
                                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                                    count_slide++
                                    carousel_html+= `
                                        <div class="carousel-item">
                                            ${exercise.exercise_scheme['scheme_2']}
                                        </div>`
                                }
                            }
                            html_scheme += `
                            <div class="col-4 pb-2 px-1 exercise-visual-block" data-id="${exercise.id}" data-exs-id="${exercise.exercise_id}" data-group="${exercise.group}">
                                <div id="carouselSchema-${exercise.id}" class="carousel slide carouselSchema" data-ride="carousel" data-interval="false">
                                    <ol class="carousel-indicators">
                                        ${select_html}
                                    </ol>
                                    <div class="carousel-inner">
                                        ${carousel_html}
                                    </div>
                                    <a class="carousel-control-prev ml-2" href="#carouselSchema-${exercise.id}" role="button" data-slide="prev">
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span class="sr-only">Previous</span>
                                    </a>
                                    <a class="carousel-control-next" href="#carouselSchema-${exercise.id}" role="button" data-slide="next">
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span class="sr-only">Next</span>
                                    </a>
                                </div>
                                <div class="row text-center">
                                    <div class="col-12"><div class="w-100 border text-truncate">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div></div>
                                </div>
                                <div class="row">
                                    <div class="col-12 additional-data-block"></div>
                                </div>
                            </div>
                            `
                        }
                    }
                    $('#block-event-info .event-info').html(html_scheme)

                } else {
                    //$('.training-card-objective').addClass('d-none')
                    $('#objective_1-training-view').parent().addClass('d-none')
                    $('#training-block-view').parent().addClass('d-none')
                    $('#block-event-info .event-info').html('')
                }
                resize_events_table();
            })
            let offset = $('#events .hasEvent.selected').position().top - $('#filters-row').height() - $('#events-table').height()/2
            console.log(offset)
            $('#events-table').animate({scrollTop: offset},'slow');
        }

    })

    $('#microcycles-tab').on('click', '.create', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        //console.log('CREATE : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'POST')
        $('#microcycles-form').removeClass('d-none')
        clear_microcycle_form()
    })
    //Активация редактирования микроцикла
    $('#microcycles').on('click', '.edit', function() {
        clear_microcycle_form()
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        console.log('EDIT : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'PATCH')
        $('#microcycles-form').removeClass('d-none')
        var newOption = new Option(cur_edit_data['name'], cur_edit_data['name'], false, true);
        $('#microcycles-form #select-microcycle-name').append(newOption).trigger('change');
        newOption = new Option(cur_edit_data['short_key'], cur_edit_data['short_key'], false, true);
        $('#microcycles-form #select-microcycle-short_key').append(newOption).trigger('change');
        newOption = new Option(cur_edit_data['block'], cur_edit_data['block'], false, true);
        $('#microcycles-form #select-microcycle-block').append(newOption).trigger('change');
        newOption = new Option(cur_edit_data['block_key'], cur_edit_data['block_key'], false, true);
        $('#microcycles-form #select-microcycle-block_key').append(newOption).trigger('change');
        $('#microcycles-form #id_goal').val(cur_edit_data['goal'])
        //$('#microcycles-form #datetimepicker-with-microcycle').datetimepicker('date', moment(cur_edit_data['date_with'], 'DD/MM/YYYY'))
        //$('#microcycles-form #datetimepicker-by-microcycle').datetimepicker('date', moment(cur_edit_data['date_by'], 'DD/MM/YYYY'))
        $('#microcycles-form #datetimepicker-with-microcycle').val(moment(cur_edit_data['date_with'], 'DD/MM/YYYY').format('YYYY-MM-DD'))
        $('#microcycles-form #datetimepicker-by-microcycle').val(moment(cur_edit_data['date_by'], 'DD/MM/YYYY').format('YYYY-MM-DD'))
    })
    //Удаление микроцикла
    $('#microcycles').on('click', '.delete', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        //console.log('DELETE : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'DELETE')
        $('#microcycles-form').addClass('d-none')
        clear_microcycle_form()
        ajax_microcycle_update($('#microcycles-form').attr('method'), null, cur_edit_data ? cur_edit_data.id : 0)
    })
    //Отмена редактирования/добавления микроцикла
    $('#microcycles-form').on('click', '.cancel', function() {
        $('#microcycles-form').addClass('d-none')
        clear_microcycle_form()
    })
    $('#microcycles-form').on('submit', function(e) {
        e.preventDefault()
        $('#microcycles-form').addClass('d-none')
        let send_data = getFormData($(this))
        send_data['date_with'] = moment(send_data['date_with']).format('DD/MM/YYYY')
        send_data['date_by'] = moment(send_data['date_by']).format('DD/MM/YYYY')
        console.log(send_data)
        ajax_microcycle_update($(this).attr('method'), send_data, cur_edit_data ? cur_edit_data.id : 0)
    })
    
    $('#copy-admin-objectives').on('click', function () {
        swal(gettext("Copy NF objectives? (The my objectives table will be cleared)"), {
            buttons: {
                cancel: {
                    text: gettext("Cancel"),
                    visible:true,
                    value: false,
                },
                confirm: {
                    text: gettext("OK"),
                    visible:true,
                    value: true,
                },
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_objectives_action('POST', {}, gettext('Copy'), '', 'copy_admin_all').then(function (data) {
                    objectives_table.ajax.reload()
                })
            }
        });
    })
    $('#copy-admin-blocks').on('click', function () {
        swal(gettext("Copy NF blocks? (The my blocks table will be cleared)"), {
            buttons: {
                cancel: {
                    text: gettext("Cancel"),
                    visible:true,
                    value: false,
                },
                confirm: {
                    text: gettext("OK"),
                    visible:true,
                    value: true,
                },
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_blocks_action('POST', {}, gettext('Copy'), '', 'copy_admin_all').then(function (data) {
                    blocks_table.ajax.reload()
                })
            }
        });

    })

    // Создание события
    $('#event-add').on('click', function() {
        $('#form-event').attr('method', 'POST')
        clear_event_form()
    })
    // Отправка формы создания события
    $('#form-event').on('submit', function(e) {
        e.preventDefault()
        let send_data = getFormData($(this))
        let date = moment(send_data['date']).format('DD/MM/YYYY')
        let method = $(this).attr('method')
        send_data['date'] = date+' '+send_data['time']
        console.log(send_data)
        $('#event-link').html('');
        if (send_data['event_type'] == '5'){
            send_data['event_type'] = '1'
            ajax_event_action(method, send_data, 'create').then(function( data ) { //cur_edit_data ? cur_edit_data.id : 0
                console.log(data)
                if('status' in data && data['status'] == 'event_type_full') return;
                let link = 'training' in data && data.training != null ? '/trainings/view/'+data.id : 'match' in data && data.match != null && !isLite ? '/matches/match?id='+data.id : ''
                $('#event-link').append(`<a href="${link}" class="btn btn-warning btn-block">${gettext('Go to the created event group A')}</a>`)
                send_data['event_type'] = '4'
                ajax_event_action(method, send_data, 'create').then(function( data ) { //cur_edit_data ? cur_edit_data.id : 0
                    console.log(data)
                    if('status' in data && data['status'] == 'event_type_full') return;
                    let link = 'training' in data && data.training != null ? '/trainings/view/'+data.id : 'match' in data && data.match != null && !isLite ? '/matches/match?id='+data.id : ''
                    $('#event-link').append(`<a href="${link}" class="btn btn-warning btn-block">${gettext('Go to the created event group B')}</a>`)
                    clear_event_form()
                    generateData()
                })
            })
        } else {
            ajax_event_action($(this).attr('method'), send_data, 'create').then(function( data ) { //cur_edit_data ? cur_edit_data.id : 0
                console.log(data)
                if('status' in data && data['status'] == 'event_type_full') return;
                let link = 'training' in data && data.training != null ? '/trainings/view/'+data.id : 'match' in data && data.match != null && !isLite ? '/matches/match?id='+data.id : ''
                $('#event-link').html(`<a href="${link}" class="btn btn-warning btn-block">${gettext('Go to the created event')}</a>`)
                clear_event_form()
                generateData()
            })
        }

    })

    // Отправка формы редактирования события
    $('#form-event-edit').on('submit', function(e) {
        e.preventDefault()
        let data = getFormData($(this))
        console.log(data)
        let date = moment(data['date']).format('DD/MM/YYYY')
        data['date'] = date+' '+data['time']
        ajax_event_action($(this).attr('method'), data, 'update', cur_edit_data ? cur_edit_data.id : 0).then(function( data ) {
            //if(events_table) events_table.ajax.reload()
            console.log(data)
            let isLite = false
            if('protocol_info' in data.training) isLite = false
            else isLite = true
            let link = 'training' in data && data.training != null ? '/trainings'+(isLite?'/lite':'')+'/view/'+data.id : 'match' in data && data.match != null && !isLite ? '/matches/match?id='+data.id : ''
            $('#event-edit-link').html(`<a href="${link}" class="btn btn-warning btn-block">${gettext('Go to the created event')}</a>`)
            generateData()
        })
    })

    $('#toggle-calendar').on('click', function () {
        if ($(this).hasClass('active')) calendar_active = false;
        else calendar_active = true;
        Cookies.set('calendar_active', calendar_active, { expires: 1 })
        $(this).toggleClass('active', calendar_active)

        $('#toggle-event-card').toggleClass('active', false)

        $('#event_calendar').toggleClass('d-none', !calendar_active)
        $(this).children('i').toggleClass('fa-arrow-up', calendar_active).toggleClass('fa-arrow-down', !calendar_active)
        $('.move_to_today').toggleClass('isMonth', !calendar_active)
        $('#filters-row').toggleClass('d-none', calendar_active)
        $('#left-filters-row').toggleClass('d-none', calendar_active)
        $('#rescalendar-control-buttons .rescalendar_move_button').toggleClass('d-none', !calendar_active)

        hide_training_card()
        $('#events-content').removeClass('d-none')

        set_month_or_date_button()
        resize_events_table()
        resize_trainings_block()
        generateData()
    })
    // $('#toggle-event-card').on('click', function () {
    //     if ($(this).hasClass('active')) card_active = true;
    //     else card_active = false;
    //     $(this).toggleClass('active', !card_active)
    //
    //     $('#event_calendar').toggleClass('d-none', !calendar_active || !card_active)
    //     $('.move_to_today').toggleClass('isMonth', !calendar_active || !card_active)
    //     $('#filters-row').toggleClass('d-none', calendar_active || !card_active)
    //     $('#left-filters-row').toggleClass('d-none', calendar_active || !card_active)
    //     $('#rescalendar-control-buttons').toggleClass('d-none', !card_active)
    //     let event_id = $('.hasEvent.selected .event-row-info').attr('data-id')
    //     if (event_id){
    //         Cookies.set('event_id', event_id, { expires: 1 })
    //         if($('#events-content').hasClass('d-none')){
    //             hide_training_card()
    //             $('#events-content').removeClass('d-none')
    //         } else {
    //             show_training_card(event_id)
    //             $('#events-content').addClass('d-none')
    //         }
    //     }
    //
    //     // set_month_or_date_button()
    //     // resize_events_table()
    //     resize_trainings_block()
    //     //if(!$('#events-content').hasClass('d-none')) generateData()
    // })


    //Переключение по событиям
    $(document).keydown(function(e) {
        let isNext = false;
        console.log('test')
        if(e.keyCode == 38){
            $($('#events-table .hasEvent.trainingClass').get().reverse()).each(function( index ) {
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
            $('#events-table .hasEvent.trainingClass').each(function( index ) {
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

    $('#events').on('click', '.switch-favorites', function () {
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        let this_obj = $(this)
        let id = this_obj.closest('tr.hasEvent').attr('data-value')
        let favourites = parseInt(this_obj.attr('data-switch'))+1
        if(favourites>1) favourites = 0
        let data = {}
        data.favourites = favourites
        this_obj.attr('data-switch', favourites)
        //console.log(data)
        ajax_training_action('PUT', data, 'favourites', id).then(function (data) {
            if (data.favourites == 1) this_obj.addClass('fa-star text-success').removeClass('fa-star-o')
            //else if (data.favourites == 2) this_obj.addClass('fa-star text-warning').removeClass('text-success')
            //else if (data.favourites == 3) this_obj.addClass('fa-star text-danger').removeClass('text-warning')
            //else this_obj.addClass('fa-star-o').removeClass('fa-star text-danger')
            else this_obj.addClass('fa-star-o').removeClass('fa-star text-success')
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

    $('.row.event-info').on('click', '.carousel-item', (e) => {
        let id = -1;
        try {
            id = parseInt($(e.currentTarget).parent().parent().parent().attr('data-exs-id'));
        } catch (e) {}
        let activeNum = 1;
        LoadGraphicsModal(id, "team_folders", activeNum);
    });

    $('.row.training-info').on('click', '.carousel-item', (e) => {
        let id = -1;
        try {
            id = parseInt($(e.currentTarget).parent().parent().parent().attr('data-exs-id'));
        } catch (e) {}
        let activeNum = 1;
        LoadGraphicsModal(id, "team_folders", activeNum);
    });
    //Открыть карточку события при клике на карандаш
    $('#open-select-event').on('click', function () {
        let href = $('tr.hasEvent .event-select.selected').attr('href')
        console.log(href)
        if (href != null && href != undefined){
            window.location.href = href;
        } else {
            swal(gettext('No event selected!'), '', "warning");
        }


    })
    //Удаление упражнения при клике на корзину
    $('#delete-event-button').on('click', function () {
        let event_id = $('tr.hasEvent.selected').attr('data-value')
        if(!event_id) return;
        ajax_event_action('DELETE', null, 'delete', event_id).then(function( data ) {
            generateData()
        })
    })

    //Фильтрация событий по избранному
    $('#favourites-event-filter').on('click', function () {
        let cur_fav = parseInt($(this).attr('data-filter'))
        if (cur_fav>1) {
            cur_fav = 0
            $(this).removeClass('active')
        } else {
            cur_fav += 1
            $(this).addClass('active')
        }
        if (cur_fav == 1) {
            $('#favourites-event-filter i').removeClass(`fa-star-o`).addClass(`fa-star text-success`)
            $('.favorites-col').removeClass('d-none')
        }
        else if (cur_fav == 2) {
            $('#favourites-event-filter i').removeClass(`text-warning`).addClass(`fa-star text-success`)
            $('#filled-event-filter:not(.active)').click()
        }
        // else if (cur_fav == 3) $('#favourites-event-filter i').removeClass(`text-warning`).addClass(`fa-star text-danger`)
        // else $('#favourites-event-filter i').removeClass(`fa-star text-danger`).addClass(`fa-star-o`)
        else {
            $('#favourites-event-filter i').removeClass(`fa-star text-success`).addClass(`fa-star-o`)
            $('.favorites-col').addClass('d-none')
        }
        $(this).attr('data-filter', cur_fav)
        generateData()
    })
    //Фильтрация событий по текстовым полям
    $('.ajax-text-filters').on('keyup', debounce(function(){
        generateData()
    }, 1000))
    //Сброс одного фильтра
    $('.ajax-text-filters').on('search', function(){
        generateData()
    })
    //Фильтрация не заполненных событий
    $('#filled-event-filter').on('click', function () {
        let cur_state = parseInt($(this).attr('data-filter'))
        if (cur_state>0) {
            cur_state = 0
            $(this).removeClass('active')
            $(this).find('i').removeClass('fa-arrow-down').addClass('fa-arrow-up')
        } else {
            cur_state += 1
            $(this).addClass('active')
            $(this).find('i').removeClass('fa-arrow-up').addClass('fa-arrow-down')
        }
        $(this).attr('data-filter', cur_state)
        local_filters_events()
    })
    //Показать/скрыть фильтрацию тренировок
    $('#show-training-event-filter').on('click', function () {
        let cur_state = parseInt($(this).attr('data-filter'))
        if (cur_state>0) {
            cur_state = 0
            $('#view-training-info').addClass("show active")
            $('#filters-training-info').removeClass('show active')
            $(this).removeClass('active')
        } else {
            cur_state += 1
            $('#view-training-info').removeClass("show active")
            $('#filters-training-info').addClass('show active')
            $(this).addClass('active')
        }
        $(this).attr('data-filter', cur_state)
        resize_events_table()
    })
    //Фильтрация событий с видео
    $('#video-event-filter').on('click', function () {
        let cur_state = parseInt($(this).attr('data-filter'))
        if (cur_state>0) {
            cur_state = 0
            $(this).removeClass('active')
        } else {
            cur_state += 1
            $(this).addClass('active')
        }
        $(this).attr('data-filter', cur_state)
        local_filters_events()
    })
    //Локальная Фильтрация событий
    $('.text-filter-events').on('keyup search', function () {
        local_filters_events()
    })
    $('.select-filter-events').on('change', function () {
        local_filters_events()
    })
    //Сброс всей фильтрации
    $('#clear-events-filters').on('click', function () {
        clear_filters_events()
    })
    //Скачивание преззентации
    $('#event-render-presentation').on('click', function () {
        let id = $('#events .hasEvent.selected').attr('data-value')
        let event_type = $('#events .hasEvent.selected').hasClass('trainingClass') ? 'training' : '';
        if(id!=''){
            ajax_presentation_action('GET', {}, event_type, id).then(function (data) {

            })
        }

    })
    //Открыть окно печати тренировки
    $('#event-print-card').on('click', function () {
        let id = $('#events .hasEvent.selected').attr('data-value')
        $('#print-training-modal').attr('data-id', id)
        $('#print-training-modal').modal('show')
    })
    // Модальное окно поделиться тренировкой
    $('#trainingShareModal').on('show.bs.modal', (e) => {
        let shared_modal = $('#trainingShareModal');
        let startDate = getFormattedDateFromTodayWithDelta(1);
        let endDate = getFormattedDateFromTodayWithDelta(8);
        shared_modal.find('input[name="date"]').val(startDate);
        shared_modal.find('input[name="date"]').attr('min', startDate);
        shared_modal.find('input[name="date"]').attr('max', endDate);

        shared_modal.find('.create-block').removeClass('d-none');
        shared_modal.find('.link-text > a').text('-');
        shared_modal.find('.link-text > a').attr('href', '');
        shared_modal.find('button.btn-share').attr('data-link', "");
        shared_modal.find('.link-qrcode').html('');

        let type = $('#shared-modal-button').attr('data-training-type')
        let training_id = $('#events-table .hasEvent .event-select.selected').attr('data-id');

        let dataToSend = {
            'get_link': 1,
            'id': training_id,
            'type': `training_${type}`,
        };

        ajax_share('GET', dataToSend).then(function (res) {
            console.log(res)
            if (res.success) {
                shared_modal.find('.create-block').addClass('d-none');
                shared_modal.find('.link-text > a').text(res.data.link);
                shared_modal.find('.link-text > a').attr('href', res.data.link);
                shared_modal.find('button.btn-share').attr('data-link', res.data.link);
                new QRCode(shared_modal.find('.link-qrcode')[0], {
                    text: res.data.link,
                    width: 150,
                    height: 150,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            }
        })
    })
    // Поделиться тренировкой
    $('#trainingShareModal').on('click', '.btn-share', (e) => {
        let cLink = $(e.currentTarget).attr('data-link');
        if (cLink && cLink != "") {
            copyToClipboard(cLink);
            swal(gettext("Ready"), gettext('Link copied')+` (${cLink})!`, "success");
            return;
        }
        let type = $('#shared-modal-button').attr('data-training-type')
        let expireDate = $('#trainingShareModal').find('input[name="date"]').val();
        let training_id = $('#events-table .hasEvent.selected').attr('data-value');

        let dataToSend = {
            'add_link': 1,
            'id': training_id,
            'type': `training_${type}`,
            'expire_date': expireDate,
        };

        ajax_share('POST', dataToSend).then(function (res) {
            console.log(res)
            if (res.success) {
                 $('#trainingShareModal').find('.link-text > a').text(res.data.link);
                 $('#trainingShareModal').find('.link-text > a').attr('href', res.data.link);
                 $('#trainingShareModal').find('button.btn-share').attr('data-link', res.data.link);
                 new QRCode($('#trainingShareModal').find('.link-qrcode')[0], {
                    text: res.data.link,
                    width: 150,
                    height: 150,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                 });
                 copyToClipboard(res.data.link);
                 swal(gettext("Ready"), gettext('Link copied')+` (${res.data.link})!`, "success");
             }
        })
    })
    
    $('#event-mc7-active-button').on( 'click', function () {
        if ($(this).hasClass('active')){
            $(this).removeClass('active')
            baseMicrocycle = []
        } else {
            $(this).addClass('active')
            startDate = moment().startOf('year').startOf('week');
            endDate = moment().endOf('year').endOf('week');
            var diffDays = endDate.diff(startDate, 'days')
            baseMicrocycle = []
            console.log(startDate.format('DD/MM/YYYY') + "-" + endDate.format('DD/MM/YYYY') + " " + diffDays)
            let date_with = startDate.clone()
            let date_by = startDate.clone();
            for (let i = diffDays+1; i > 0; i-=7) {
                date_with = startDate.clone().add(i-6, 'days')
                date_by = startDate.clone().add(i, 'days')
                let days = date_by.diff(date_with, 'days')
                baseMicrocycle.push({
                    id: i,
                    name: i,
                    block: i,
                    startDate: date_with.format('DD/MM/YYYY'),
                    endDate: date_by.format('DD/MM/YYYY'),
                    days: days,
                    customClass: 'green_cell',
                    href: '#empty'
                })
            }
        }
        generateData()
    })
    
    $('a[data-toggle="pill"]').on('shown.bs.tab', function (event) {
         resize_events_table()
    })

    console.log(Cookies.get('calendar_active') == 'false')
    if(Cookies.get('calendar_active') == 'false'){
        $('#toggle-calendar').click();
    }

    create_ajax_select2($('#microcycle-day-filter'), gettext('M.D.'), '/events/microcycle_mc_list', $(document.body), false, true, -1)
    create_ajax_select2($('#microcycle-days-filter'), gettext('MC days'), '/events/microcycle_days_list', $(document.body), false, true, -1)
    create_ajax_select2($('#microcycle-name-filter'), gettext('M.C.'), '/events/microcycle_name_list', $(document.body), false, true, -1)
    create_ajax_select2($('#training-block-filter'), gettext('Block'), '/trainings/blocks_list/', $(document.body), false, true, -1)
    create_ajax_select2($('#training-load-filter'), gettext('Load'), '/trainings/loads_list', $(document.body), false, true, -1)


    //create_ajax_select2($('#objective_1-block-filter'), gettext('Objective block'), '/trainings/objective_block', $(document.body))
    //create_ajax_select2($('#objective_2-block-filter'), gettext('Objective block'), '/trainings/objective_block', $(document.body))
    //create_ajax_select2($('#objective_3-block-filter'), gettext('Objective block'), '/trainings/objective_block', $(document.body))

    create_ajax_select2($('#objective_1-event-view'), gettext('Objectives'), '/trainings/objectives_list/', $(document.body), false, true, -1)
    //create_ajax_select2($('#objective_2-event-view'), gettext('Add. objectives'), '/trainings/objectives_list/', $(document.body), false, true, 1, false, 0, {'type': 1})
    //create_ajax_select2($('#objective_3-event-view'), gettext('Objective')+' 3', '/trainings/objectives_list/', $(document.body), false, true, 1, false, 0, {'type': 2})

    create_ajax_select2($('#select-microcycle-name'), '', '/events/microcycle_name_list', $('#references-modal'))
    create_ajax_select2($('#select-microcycle-short_key'), '', '/events/microcycle_short_key_list', $('#references-modal'))
    // create_ajax_select2($('#select-microcycle-block'), gettext('Block'), '/events/microcycle_block_list', $('#references-modal'))
    // create_ajax_select2($('#select-microcycle-block_key'), gettext('Block key'), '/events/microcycle_block_key_list', $('#references-modal'))
})

function clear_event_form(){
    let nowdate = moment().format('YYYY-MM-DD');
    let nowtime = moment().format('HH:mm')
    $('#form-event #id_short_name').val('')
    $('#form-event #id_event_type option:first').prop('selected', true)
    $('#form-event #id_event_type').trigger('change');
    $('#form-event #datetimepicker-event').val(nowdate)
    $('#form-event #timepicker-event').val(nowtime)
}

function clear_microcycle_form(){
    let nowdate = moment().format('DD/MM/YYYY')
    $('#microcycles-form #select-microcycle-name').val(null).trigger("change");
    $('#select-microcycle-short_key').val(null).trigger("change");
    $('#microcycles-form #select-microcycle-block').val(null).trigger("change");
    $('#select-microcycle-block_key').val(null).trigger("change");
    $('#microcycles-form #id_goal').val('')
    $('#microcycles-form #datetimepicker-with-microcycle').datetimepicker('date', null)
    $('#microcycles-form #datetimepicker-by-microcycle').datetimepicker('date', null)
    $('#datetimepicker-with-microcycle').datetimepicker('maxDate', false);
    $('#datetimepicker-by-microcycle').datetimepicker('minDate', false);
}

function local_filters_events() {
    let name_val = $('#microcycle-name-filter').val() ? $('#microcycle-name-filter').val() : ''
    let block_val = $('#training-block-filter').val() ? $('#training-block-filter').val() : ''
    let days_val = $('#microcycle-days-filter').val() ? $('#microcycle-days-filter').val() : ''
    let day_val = $('#microcycle-day-filter').val() ? $('#microcycle-day-filter').val() : ''
    let filled_val = $('#filled-event-filter').attr('data-filter') ? $('#filled-event-filter').attr('data-filter') : 0
    let video_val = $('#video-event-filter').attr('data-filter') ? $('#video-event-filter').attr('data-filter') : 0
    let objective_1_val = $('#objective_1-event-view').val() ? $('#objective_1-event-view').val() : ''
    let load_val = $('#training-load-filter').val() ? $('#training-load-filter').val() : ''
    // let objective_2_val = $('#objective_2-event-view').val() ? $('#objective_2-event-view').val() : ''
    // let objective_3_val = $('#objective_3-event-view').val() ? $('#objective_3-event-view').val() : ''
    //let objective_block = $('#objective_1-block-filter').val() ? $('#objective_1-block-filter').val(): ''
        // select_custom_search =
        // ($('#objective_1-block-filter').val() ? $('#objective_1-block-filter').val(): '') + ',' +
        // ($('#objective_2-block-filter').val() ? $('#objective_2-block-filter').val() : '') + ',' +
        // ($('#objective_3-block-filter').val() ? $('#objective_3-block-filter').val() : '');

    let send_data = []
    send_data.push({name: 'mc', value: name_val})
    send_data.push({name: 'load', value: load_val})
    send_data.push({name: 'block', value: block_val})
    send_data.push({name: 'objective', value: objective_1_val})
    ajax_event_request("GET", send_data, 'filter', '', '/events/filter_counter').then(function( data ) {
        console.log(data)
        $('#microcycle-name-filter-counter').text(data['mc'] ? data['mc'] : '---')
        $('#training-load-filter-counter').text(data['load'] ? data['load'] : '---')
        $('#training-block-filter-counter').text(data['block'] ? data['block'] : '---')
        $('#objective_1-event-view-counter').text(data['objective'] ? data['objective'] : '---')
    })
    console.log(objective_block)
    $('#events tbody tr').show()

    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_name = this_obj.attr('data-name')
        return name_val!='all' && name_val!='' && data_name != name_val;
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_block = this_obj.attr('data-block').split(',')
        //console.log(block_val + " : " + data_block)
        return block_val!='' && !contains(data_block, block_val);
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_days = this_obj.attr('data-microcycle-days')
        return days_val!='' && data_days != days_val;
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_day = this_obj.attr('data-microcycle-day')
        return day_val!='' && data_day != day_val;
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        //let data_filled = this_obj.attr('data-unfilled')
        let data_filled = this_obj.hasClass('trainingClass')
        return filled_val!='0' && data_filled != filled_val;
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_video = this_obj.attr('data-video')
        return video_val!='0' && data_video != video_val;
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_objective_1 = this_obj.attr('data-objective_1').split(',')
        //let data_objective_2 = this_obj.attr('data-objective_2').split(',')
        return objective_1_val!='' && !contains(data_objective_1, objective_1_val);
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_load = this_obj.attr('data-load').split(',')
        //console.log(block_val + " : " + data_block)
        return load_val!='' && !contains(data_load, load_val);
    }).hide()
    // $('#events tbody tr').filter(function( index ) {
    //     let this_obj = $(this)
    //     let data_objective_2 = this_obj.attr('data-objective_2')
    //     return objective_2_val!='' && !data_objective_2.match('\\b' + objective_2_val + '\\b');
    // }).hide()
    // $('#events tbody tr').filter(function( index ) {
    //     let this_obj = $(this)
    //     let data_objective_3 = this_obj.attr('data-objective_3')
    //     return objective_3_val!='' && !data_objective_3.match('\\b' + objective_3_val + '\\b');
    // }).hide()
    resize_events_table()
}

function contains(where, what){
    if (!what) {
        return true;
    }
    let check_array = false;
    if (typeof what === "object"){
        for (var i = 0; i < what.length; i++) {
            for (var j = 0; j < where.length; j++) {
                 if (what[i] == where[j]) {
                     check_array = true
                     break
                 }
            }
        }
    } else {
        for (var j = 0; j < where.length; j++) {
             if (what == where[j]) {
                 check_array = true
                 break
             }
        }
    }


    return check_array;
}

function clear_filters_events() {
    $('#favourites-event-filter').attr('data-filter', '0').removeClass(`active`)
    $('#favourites-event-filter i').removeClass(`fa-star text-danger text-warning text-success`).addClass(`fa-star-o`)

    $('#filled-event-filter').attr('data-filter', '0').removeClass(`active`)
    $('#video-event-filter').attr('data-filter', '0').removeClass(`active`)
    $('#microcycle-days-filter').val('')
    $('#microcycle-day-filter').val('')
    //$('#field_size-event-filter').val('')
    //$('#keywords-event-filter').val('')
    //$('#load-event-filter').val('')
    //$('#goal-event-filter').val('')
    $('#block-event-info .event-info').html('')
    //$('#microcycle-block-filter').val(null).trigger("change");
    $('#microcycle-name-filter').val(null).trigger("change");
    $('#objective_1-event-view').val(null).trigger("change");
    $('#objective_2-event-view').val(null).trigger("change");
    $('#objective_3-event-view').val(null).trigger("change");
    $('#objective_1-block-filter').val(null).trigger("change");
    $('#objective_2-block-filter').val(null).trigger("change");
    $('#objective_3-block-filter').val(null).trigger("change");
    $('#training-block-filter').val(null).trigger("change");
    $('#training-load-filter').val(null).trigger("change");
    if($('#events-content').hasClass('d-none')){
        hide_training_card()
        $('#events-content').removeClass('d-none')
    }

    generateData()
}

function resize_trainings_block(){
    let css = "calc(93vh - "+Math.round($('#event_calendar').height())+"px - "+Math.round($('.header').height())+ "px - "+Math.round($('#filters-row').height())+ "px - "+Math.round($('.card-header').height())+"px)"
    //console.log(css)
    let css_block = "calc(93vh - "+Math.round($('#event_calendar').height())+"px - "+Math.round($('.header').height())+ "px - "+Math.round($('#filters-row').height())+ "px - "+Math.round($('.card-header').height())+"px - 61px)"
    $('#training-content .training-data').css({"max-height": css})
    $('#training-content .training-data').css({"height": css})
    $('#block-training-info').css({"max-height": css_block})
    $('#block-training-info').css({"height": css_block})
}

function set_month_or_date_button() {
    if($('.move_to_today').hasClass('isMonth')){
        $('.move_to_today').text(moment(strDate, 'DD/MM/YYYY').locale(get_cur_lang()).format('MMMM'))
    } else {
        $('.move_to_today').text(moment().locale(get_cur_lang()).format('DD/MM/YYYY'))
    }
}

function generateData() {
    if (calendar_active){
        generateNewCalendar()
    } else {
        generateOnlyTable()
    }
}

function generateMicrocyclesTable(){
    microcycles_table = $('#microcycles').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md-12' f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        //order: [ 1, 'desc' ],
        serverSide: true,
        processing: true,
        lengthChange: false,
        pageLength: 10,
        columnDefs: [
            { "width": "40%", "targets": 2 }
        ],
        rowCallback: function( row, data ) {
            console.log(data)
            $(row).find('td').addClass('py-0 align-middle')
        },
        ajax: {
            url:'api/microcycles/?format=datatables',
            data: function(data){
                //console.log(data)
            },
        },
        columns: [
            {'data': 'id', sortable: false, render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }, searchable: false},
            {'data': 'short_key', 'defaultContent': "---", render : function ( data, type, row, meta ) {
                console.log(row);
                let html = '';
                html += `<span>${row.short_key ? row.short_key : '---'}</span>`
                return html;
            }},
            {'data': 'name', 'defaultContent': "---", render : function ( data, type, row, meta ) {
                console.log(row);
                let html = '';
                html += `<span>${row.name ? row.name : '---'}</span>`
                return html;
            }},
            //{'data': 'goal', 'defaultContent': "---"},
            {'data': 'date_with', searchable: false},
            {'data': 'date_by', searchable: false},
            {'data': 'calculate_days', sortable: false, searchable: false},
            {'data': 'id' , sortable: false, searchable: false, render : function ( data, type, row, meta ) {
              return type === 'display'  ?
                '<button class="btn btn-sm btn-warning mx-1 py-0 edit" data-id="'+data+'"><i class="fa fa-pencil"></i></button>'+
                '<button class="btn btn-sm btn-danger mx-1 py-0 delete" data-id="'+data+'"><i class="fa fa-trash"></i></button>':
                data;
            }}
        ],
    })
    $('#microcycles-tab-button').on('shown.bs.tab', function () {
        microcycles_table.columns.adjust()
    })

}

$(function() {
    // Инициализация datepicker для выбора промежутка
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

    $('.datepicker-event').datetimepicker({
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

    // ContextMenu для календаря
    $.contextMenu({
        selector: '.hasEvent .event-select',
        build: function($triggerElement, e){
            return {
                callback: function(key, options){
                    let event_id = $(this).attr('data-id')
                    if(key === 'delete'){
                        window.console && console.log(event_id);
                        ajax_event_action('DELETE', null, 'delete', event_id).then(function( data ) {
                            //if(events_table) events_table.ajax.reload()
                            generateData()
                        })
                    } else if(key === 'edit'){
                        window.console && console.log(event_id);

                        if ($('.hasEvent[data-value="'+event_id+'"]').hasClass('matchClass')){
                            $('#matchEditModal').modal('show');
                            RenderMatchEditModal(event_id)
                        } else if ($('.hasEvent[data-value="'+event_id+'"]').hasClass('trainingClass')) {
                            $('#form-event-edit-modal').modal('show');
                            ajax_event_action('GET', null, 'get', event_id).then(function( data ) {
                                cur_edit_data = data
                                console.log(cur_edit_data);
                                let date = moment(cur_edit_data['only_date'], 'DD/MM/YYYY').format('YYYY-MM-DD');
                                console.log(date);
                                $('#form-event-edit #id_short_name').val(cur_edit_data['short_name'])
                                $('#form-event-edit #datetimepicker-event').val(date)
                                $('#form-event-edit #timepicker-event').val(cur_edit_data['time'])
                            })
                        }

                    } else if(key === 'copy'){

                        if (!$('.hasEvent[data-value="'+event_id+'"]').hasClass('selected')){
                            $('.hasEvent[data-value="'+event_id+'"] td:first').click()
                        }
                        $('#event-copy-modal-button').click()
                    }
                },
                items: {
                    // "add": {name: gettext('Delete'), icon: "fa-trash"},
                    "copy": {name: gettext('Copy'), icon: "fa-files-o"},
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
    $.contextMenu({
        selector: '.microcycle_cell.green_cell',
        build: function($triggerElement, e){
            return {
                callback: function(key, options){
                    let microcycle_id = $(this).attr('data-id')
                    if(key === 'delete'){
                        window.console && console.log(microcycle_id);
                        ajax_microcycle_update('DELETE', null, microcycle_id).then(function (data) {

                        })
                    } else if(key === 'edit'){
                        window.console && console.log(microcycle_id);
                        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
                        $('#references-modal').modal('show');
                        $('#microcycles-tab-button').click();
                        ajax_microcycle_update('GET', null, microcycle_id).then(function( data ) {
                            cur_edit_data = data
                            let date_with = moment(cur_edit_data['date_with'], 'DD/MM/YYYY').format('YYYY-MM-DD');
                            let date_by = moment(cur_edit_data['date_by'], 'DD/MM/YYYY').format('YYYY-MM-DD');
                            $('#microcycles-form').attr('method', 'PATCH')
                            $('#microcycles-form').removeClass('d-none')
                            let newOption = new Option(cur_edit_data['name'], cur_edit_data['name'], false, true);
                            $('#microcycles-form #select-microcycle-name').append(newOption).trigger('change');
                            newOption = new Option(cur_edit_data['short_key'], cur_edit_data['short_key'], false, true);
                            $('#microcycles-form #select-microcycle-short_key').append(newOption).trigger('change');
                            newOption = new Option(cur_edit_data['block'], cur_edit_data['block'], false, true);
                            $('#microcycles-form #select-microcycle-block').append(newOption).trigger('change');
                            newOption = new Option(cur_edit_data['block_key'], cur_edit_data['block_key'], false, true);
                            $('#microcycles-form #select-microcycle-block_key').append(newOption).trigger('change');
                            //$('#microcycles-form #id_goal').val(cur_edit_data['goal'])
                            $('#microcycles-form #datetimepicker-with-microcycle').val(date_with)
                            $('#microcycles-form #datetimepicker-by-microcycle').val(date_by)
                        })
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