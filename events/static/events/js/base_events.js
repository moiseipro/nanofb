// var d = new Date()
//
// var days = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()-1
// var middleDay = (("0" + Math.floor(days/2)).slice(-2))
// var strDate = middleDay + "/" + ("0" + (d.getMonth()+1)).slice(-2) + "/" + d.getFullYear()

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
    $('#toggle_btn').click()

    $('input.refDate').val(strDate);

    if($('#select-season').val()!='' && $('#select-team').val()!=''){
        generateData()
        generateMicrocyclesTable()
    } else {
        swal(gettext('Warning!'), gettext('Choose a team and a season!'), "warning");
    }

    //generateEventTable()

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

        if($(event.target).is('td')) {
            let this_obj = $(this)
            if (this_obj.hasClass('selected')) {
                Cookies.remove('event_id')
                $('.hasEvent').removeClass('selected')
                $('#block-event-info .event-info').html('')
            } else {
                Cookies.set('event_id', data_id, { expires: 1 })
                $('.hasEvent').removeClass('selected')
                $('.hasEvent[data-value="' + data_id + '"]').addClass('selected')
                ajax_event_action('GET', null, 'view event', data_id).then(function (data) {
                    let html_scheme = ``
                    if ('training' in data && data.training != null) {
                        console.log(data.training)
                        $('#training-video-modal input[name="video_href"]').val(data.training.video_href)
                        if (data.training.exercises_info.length > 0) {
                            let exercises = data.training.exercises_info
                            for (let exercise of exercises) {
                                html_scheme += `
                            <div class="col-4 pb-2 px-1 exercise-visual-block" data-id="${exercise.id}" data-exs-id="${exercise.exercise_id}" data-group="${exercise.group}">
                                <div id="carouselSchema-${exercise.id}" class="carousel slide carouselSchema" data-ride="carousel" data-interval="false">
                                    <ol class="carousel-indicators">
                                        <li data-target="#carouselSchema-${exercise.id}" data-slide-to="0" class="active"></li>
                                        <li data-target="#carouselSchema-${exercise.id}" data-slide-to="1"></li>
                                    </ol>
                                    <div class="carousel-inner">
                                        <div class="carousel-item active">
                                            ${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_1'] : ''}
                                        </div>
                                        <div class="carousel-item">
                                            ${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_2'] : ''}
                                        </div>
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
                    }
                })
            }
        }
    })


    $('#microcycle-modal').on('click', '.create', function() {
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        //console.log('CREATE : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'POST')
        $('#microcycles-form').removeClass('d-none')
        clear_microcycle_form()
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
            console.log(data)
            let link = 'training' in data && data.training != null ? '/trainings/view/'+data.id : 'match' in data && data.match != null ? '/matches/match?id='+data.id : ''
            $('#event-link').html(`<a href="${link}" class="btn btn-warning btn-block">${gettext('Go to the created event')}</a>`)
            clear_event_form()
            generateData()
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
            console.log(data)
            let link = 'training' in data && data.training != null ? '/trainings/view/'+data.id : 'match' in data && data.match != null ? '/matches/match?id='+data.id : ''
            $('#event-edit-link').html(`<a href="${link}" class="btn btn-warning btn-block">${gettext('Go to the created event')}</a>`)
            generateData()
        })
    })

    $('#toggle-calendar').on('click', function () {
        if ($(this).hasClass('active')) calendar_active = true;
        else calendar_active = false;
        $(this).toggleClass('active', !calendar_active)

        $('#toggle-event-card').toggleClass('active', false)

        $('#event_calendar').toggleClass('d-none', !calendar_active)
        $(this).children('i').toggleClass('fa-arrow-up', calendar_active).toggleClass('fa-arrow-down', !calendar_active)
        $('.move_to_today').toggleClass('isMonth', !calendar_active)
        $('#filters-row').toggleClass('d-none', calendar_active)
        $('#rescalenda-control-buttons').toggleClass('d-none', !calendar_active)

        hide_training_card()
        $('#events-content').removeClass('d-none')

        set_month_or_date_button()
        resize_events_table()
        resize_trainings_block()
        generateData()
    })
    $('#toggle-event-card').on('click', function () {
        if ($(this).hasClass('active')) calendar_active = true;
        else calendar_active = false;
        $(this).toggleClass('active', !calendar_active)

        $(this).children('i').toggleClass('fa-arrow-up', true).toggleClass('fa-arrow-down', false)
        $('#toggle-calendar').toggleClass('active', false)

        $('#event_calendar').toggleClass('d-none', !calendar_active)
        $('.move_to_today').toggleClass('isMonth', !calendar_active)
        $('#filters-row').toggleClass('d-none', !calendar_active)
        $('#rescalenda-control-buttons').toggleClass('d-none', !calendar_active)
        let event_id = $('.hasEvent.trainingClass.selected').attr('data-value')
        if (event_id){
            Cookies.set('event_id', event_id, { expires: 1 })
            if($('#events-content').hasClass('d-none')){
                hide_training_card()
                $('#events-content').removeClass('d-none')
            } else {
                show_training_card(event_id)
                $('#events-content').addClass('d-none')
            }
        }

        // set_month_or_date_button()
        // resize_events_table()
        // resize_trainings_block()
        //if(!$('#events-content').hasClass('d-none')) generateData()
    })


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
        if(favourites>3) favourites = 0
        let data = {}
        data.favourites = favourites
        this_obj.attr('data-switch', favourites)
        //console.log(data)
        ajax_training_action('PUT', data, 'favourites', id).then(function (data) {
            if (data.favourites == 1) this_obj.addClass('fa-star text-success').removeClass('fa-star-o')
            else if (data.favourites == 2) this_obj.addClass('fa-star text-warning').removeClass('text-success')
            else if (data.favourites == 3) this_obj.addClass('fa-star text-danger').removeClass('text-warning')
            else this_obj.addClass('fa-star-o').removeClass('fa-star text-danger')
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

    // $('#training-content').on('click', '.group-filter-card', function () {
    //     $('#calendar-row').removeClass('d-none')
    //     $('.card-header').removeClass('d-none')
    //     resize_trainings_block()
    // })
    // $('#training-content').on('click', '.exs-filter-card', function () {
    //     $('#calendar-row').addClass('d-none')
    //     $('.card-header').addClass('d-none')
    //     resize_trainings_block()
    // })
    //Открыть карточку тренировки при клике на карандаш
    $('#open-select-exercise').on('click', function () {
        let id = $('td.hasEvent.trainingClass.selected').attr('data-value')
        console.log("id")
        if(id != null && id != ''){
            window.location.href = "/trainings/view/"+id;
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
        if (cur_fav>2) {
            cur_fav = 0
            $(this).removeClass('active')
        } else {
            cur_fav += 1
            $(this).addClass('active')
        }
        if (cur_fav == 1) $('#favourites-event-filter i').removeClass(`fa-star-o`).addClass(`fa-star text-success`)
        else if (cur_fav == 2) $('#favourites-event-filter i').removeClass(`text-success`).addClass(`fa-star text-warning`)
        else if (cur_fav == 3) $('#favourites-event-filter i').removeClass(`text-warning`).addClass(`fa-star text-danger`)
        else $('#favourites-event-filter i').removeClass(`fa-star text-danger`).addClass(`fa-star-o`)
        $(this).attr('data-filter', cur_fav)
        generateData()
    })
    //Фильтрация событий по текстовым полям
    $('.ajax-text-filters').on('keyup', debounce(function(){
        generateData()
    }, 500))
    //Фильтрация не заполненных событий
    $('#filled-event-filter').on('click', function () {
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
})

function local_filters_events() {
    let days_val = $('#microcycle-days-filter').val()
    let day_val = $('#microcycle-day-filter').val()
    let filled_val = $('#filled-event-filter').attr('data-filter')
    let video_val = $('#video-event-filter').attr('data-filter')

    $('#events tbody tr').show()

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
        let data_filled = this_obj.attr('data-unfilled')
        return filled_val!='0' && data_filled != filled_val;
    }).hide()
    $('#events tbody tr').filter(function( index ) {
        let this_obj = $(this)
        let data_video = this_obj.attr('data-video')
        return video_val!='0' && data_video != video_val;
    }).hide()
}

function clear_filters_events() {
    Cookies.remove('event_id')

    $('#favourites-event-filter').attr('data-filter', '0').removeClass(`active`)
    $('#favourites-event-filter i').removeClass(`fa-star text-danger text-warning text-success`).addClass(`fa-star-o`)

    $('#filled-event-filter').attr('data-filter', '0').removeClass(`active`)
    $('#video-event-filter').attr('data-filter', '0').removeClass(`active`)
    $('#microcycle-days-filter').val('')
    $('#microcycle-day-filter').val('')
    $('#field_size-event-filter').val('')
    $('#keywords-event-filter').val('')
    $('#load-event-filter').val('')
    $('#block-event-info .event-info').html('')
    if($('#events-content').hasClass('d-none')){
        hide_training_card()
        $('#events-content').removeClass('d-none')
    }

    generateData()
}

function resize_events_table(){
    let css = "calc(93vh - "+Math.round($('#calendar-row').height())+"px - "+Math.round($('#filters-row').height())+"px - "+Math.round($('.header').height())+"px - "+Math.round($('.card-header').height())+"px)"
    //console.log(css)
    $('#events-table').css({"max-height": css})
    $('#events-table').css({"height": css})
    $('#block-event-info .event-info').css({"max-height": css})
    $('#block-event-info .event-info').css({"height": css})
}

function resize_trainings_block(){
    let css = "calc(93vh - "+Math.round($('#event_calendar').height())+"px - "+Math.round($('.header').height())+ "px - "+Math.round($('#filters-row').height())+ "px - "+Math.round($('.card-header').height())+"px)"
    //console.log(css)
    $('#training-content .training-data').css({"max-height": css})
    $('#training-content .training-data').css({"height": css})
    $('#block-training-info').css({"max-height": css})
    $('#block-training-info').css({"height": css})
}

function clear_event_form(){
    let nowdate = moment().format('DD/MM/YYYY')
    let nowtime = moment().format('HH:mm')
    $('#form-event #id_short_name').val('')
    $('#form-event #id_event_type option:first').prop('selected', true)
    $('#form-event #id_event_type').trigger('change');
    $('#form-event #datetimepicker-event').val(nowdate)
    $('#form-event #timepicker-event').val(nowtime)
}

function clear_microcycle_form(){
    let nowdate = moment().format('DD/MM/YYYY')
    $('#microcycles-form #id_name').val('')
    $('#microcycles-form #datetimepicker-with-microcycle').datetimepicker('clear')
    $('#microcycles-form #datetimepicker-by-microcycle').datetimepicker('clear')
    $('#datetimepicker-with-microcycle').datetimepicker('maxDate', false);
    $('#datetimepicker-by-microcycle').datetimepicker('minDate', false);
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
})

async function ajax_microcycle_update(method, data, id) {
    if (method != 'GET' && !confirm(gettext('Save changes to the microcycle?'))) return false

    let url = "api/microcycles/"
    if(method != 'POST') url += id+"/"

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function (data) {
            //console.log(data)
            if(method != 'GET') {
                create_alert('alert-update', {
                    type: 'success',
                    message: gettext('The action with the microcycle was successfully completed!')
                })
                generateData()
                microcycles_table.ajax.reload()
            }
        },
        error: function (jqXHR, textStatus) {
            alert( gettext('Error when updating the microcycle. ') + gettext(textStatus) );
        },
        complete: function (data) {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}

function generateData() {
    if (calendar_active){
        generateNewCalendar()
    } else {
        generateOnlyTable()
    }
}

var microcycle_arr = null
function generateNewCalendar(){
    newMicrocycle = []
    newEvent = []

    let microcycle_id = null
    let send_data ={}

    let from_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-start')
    let to_date_str = $('#event_calendar .microcycle_cell.selected').attr('data-end')
    microcycle_id = $('#event_calendar .microcycle_cell.selected').attr('data-id')
    let today = strDate
    let favourites = parseInt($('#favourites-event-filter').attr('data-filter'))
    let load_type = $('#load-event-filter').val()
    let keywords = $('#keywords-event-filter').val()
    let field_size = $('#field_size-event-filter').val()


    //(strDate)
    console.log(favourites)

    let from_date = undefined
    let to_date = undefined

    if(from_date_str){
        from_date = moment(from_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }
    if(to_date_str){
        to_date = moment(to_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    if(!from_date_str && !to_date_str && today){
        from_date = moment(today, 'DD/MM/YYYY').startOf('month').format('YYYY-MM-DD')
        to_date = moment(today, 'DD/MM/YYYY').endOf('month').format('YYYY-MM-DD')
    }

    send_data['from_date'] = from_date
    send_data['to_date'] = to_date
    send_data['favourites'] = favourites
    send_data['load_type'] = load_type
    send_data['keywords'] = keywords
    send_data['field_size'] = field_size

    //console.log(send_data)

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
                    //console.log(data['results'])
                    let num_tr = 1, num_m = 1, count_tr = 0, count_m = 0, max_m = 0, event_date = '', event_class=''
                    let last_date = moment(to_date, 'YYYY-MM-DD')
                    let first_date = moment(from_date, 'YYYY-MM-DD')
                    let generated_events = []

                    let days = last_date.diff(first_date, 'days')+1
                    //console.log(days)
                    if(days!=0) {
                        for (let i = 0; i < days; i++){
                            let isSame = false
                            //console.log(last_date.format('DD/MM/YYYY'))
                            for (let event of data['results']) {
                                let cur_date = moment(event['only_date'], 'DD/MM/YYYY')
                                if(cur_date.isSame(last_date)){
                                    generated_events.push(event)
                                    isSame = true
                                    if(isSame && 'match' in event && event.match != null){
                                        count_m++
                                        max_m++
                                    }
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
                            last_date.add(-1, 'days')
                        }
                    }
                    $('#events tbody').html('')
                    $.each(generated_events, function( index, event ) {
                        let event_id = event['id'],
                            event_name = '',
                            event_short_name = event['short_name']
                        let tr_html = ``
                        let td_html = ``

                        let only_date = moment(event['only_date'], 'DD/MM/YYYY')
                        let count_day = 0
                        let microcycle_days = 0
                        let hasVideo = false
                        let isCurrentDate = false
                        let isFilled = true

                        if(moment().startOf('day').isSame(only_date)) isCurrentDate = true
                        newMicrocycle.forEach(function(microcycle, i) {
                            let date_with = moment(microcycle['startDate'], 'DD/MM/YYYY')
                            let date_by = moment(microcycle['endDate'], 'DD/MM/YYYY')
                            if(only_date.isBetween( date_with, date_by, undefined, '[]')){
                                microcycle_days = microcycle.days
                                count_day = only_date.diff(date_with, "days")+1
                                if(count_day < 3) count_day = '+'+count_day
                                else{
                                    count_day = only_date.diff(date_by, "days")
                                    if(count_day==0) count_day = '---'
                                }
                            }
                        });

                        if('training' in event && event['training'] != null){
                            num_tr = 1
                            let count_player = 0
                            let count_goalkeeper = 0

                            if(event_class === 'trainingClass' && event['only_date'] === event_date) num_tr++
                            if(event.training.exercises_info.length == 0 ||event.training.protocol_info.length == 0) isFilled = false
                            if('protocol_info' in event.training && event.training.protocol_info.length > 0){
                                $.each(event.training.protocol_info, function( index, value ) {
                                    if(value.status==null) count_player++;
                                    if(value.player_info.card != null && value.player_info.card.is_goalkeeper){
                                        count_goalkeeper++;
                                    }
                                });
                            }
                            hasVideo = event.training.video_href != ''
                            event_name = 'tr'+num_tr
                            event_class = 'trainingClass'
                            count_tr++
                            console.log(event.training)
                            td_html += `
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td class="${!isFilled ? 'text-danger' : ''}">${event['only_date']}</td>
                                <td><a href="/trainings/view/${event.training.event_id}" class="btn btn-sm btn-block btn-info py-0" data-id="${event.training.event_id}">${gettext('Training')+' '+(num_tr == 2 ? '2' : '')}</a></td>
                                <td><i class="switch-favorites fa ${event.training.favourites == 1 ? 'fa-star text-success' : (event.training.favourites == 2 ? 'fa-star text-warning' : (event.training.favourites == 3 ? 'fa-star text-danger' : 'fa-star-o'))}" data-switch="${event.training.favourites}"></i></td>
                                <td>${count_player}</td>
                                <td>${count_goalkeeper}</td>
                            `
                        } else if('match' in event && event['match'] != null){
                            event_name = 'm'+(event['match']['m_type']+1)
                            event_class = 'matchClass'+event['match']['m_type']
                            count_m--
                            count_tr = 0

                            td_html += `
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td>${event['only_date']}</td>
                                <td><a href="/matches/match?id=${event.match.event_id}" data-count="${count_m+1}" class="btn btn-sm btn-block ${event.match.m_type == 0 ?"btn-warning":"btn-success"} py-0" data-id="${event.match.event_id}">${gettext('Match')}</a></td>
                                <td>---</td>
                                <td>---</td>
                                <td>---</td>
                            `
                        } else {
                            event_class = 'none'
                            td_html += `
                                    <td>${count_day==0 ? '---' : count_day}</td>
                                    <td>${event['only_date']}</td>
                                    <td>${count_tr == 0 && count_m==max_m ? '---' : '---'}</td>
                                    <td>---</td>
                                    <td>---</td>
                                    <td>---</td>
                                ` //<a href="#" class="btn btn-sm btn-block btn-secondary py-0 disabled">${/*gettext('Recreation')*/'---'}</a>
                        }
                        tr_html += `<tr class="${event_id!=null ? 'hasEvent' : ''} ${event_class}" data-value="${event_id}" data-microcycle-days="${microcycle_days}" data-microcycle-day="${count_day}" data-unfilled="${!isFilled ? '1' : '0'}" data-video="${hasVideo ? '1' : '0'}" style="${isCurrentDate ? 'border-top: 2px solid #dc3545!important' : ''}">`
                        tr_html += td_html
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
                        locale: get_cur_lang(),
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


                    resize_events_table()

                    if(microcycle_id){
                        $('#event_calendar .microcycle_cell[data-id="'+microcycle_id+'"]').addClass('selected')
                    }
                    if(Cookies.get('event_id')){
                        if($('#events .hasEvent[data-value="'+Cookies.get('event_id')+'"]').length){
                            $('#events .hasEvent[data-value="'+Cookies.get('event_id')+'"] td:first').click()
                        } else {
                            Cookies.remove('event_id')
                        }
                    }

                    set_month_or_date_button()

                }
            })
        },
        error: function(jqXHR, textStatus){
            //console.log(jqXHR)
            swal(gettext('Event save'), gettext('Error when action the event!'), "error");
        },
        complete: function () {
            //$('.page-loader-wrapper').fadeOut();
        }
    })
}

function generateOnlyTable() {
    newMicrocycle = []
    newEvent = []


    let send_data ={}

    let from_date_str = $('#select-season option:selected').attr('data-with')
    let to_date_str = $('#select-season option:selected').attr('data-by')
    let today = strDate
    let favourites = parseInt($('#favourites-event-filter').attr('data-filter'))
    let load_type = $('#load-event-filter').val()
    let keywords = $('#keywords-event-filter').val()
    let field_size = $('#field_size-event-filter').val()


    //(strDate)
    //console.log(middleDay)

    let from_date = undefined
    let to_date = undefined

    if(from_date_str){
        from_date = moment(from_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }
    if(to_date_str){
        to_date = moment(to_date_str, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    send_data['from_date'] = from_date
    send_data['to_date'] = to_date
    send_data['favourites'] = favourites
    send_data['load_type'] = load_type
    send_data['keywords'] = keywords
    send_data['field_size'] = field_size
    //console.log(send_data)

    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: 'api/microcycles/',
        type: 'GET',
        dataType: "JSON",
        success: function(data){
            microcycle_arr = data['results']
            for (var microcycle of microcycle_arr) {
                let date_with = moment(microcycle['date_with'], 'DD/MM/YYYY')
                let date_by = moment(microcycle['date_by'], 'DD/MM/YYYY')
                let days = date_by.diff(date_with, 'days')+1
                newMicrocycle.push({
                    id: microcycle['id'],
                    name: microcycle['name'],
                    startDate: microcycle['date_with'],
                    endDate: microcycle['date_by'],
                    days: days,
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
                    let num_tr = 1, num_m = 1, count_tr = 0, count_m = 0, max_m = 0, event_date = '', event_class=''
                    let last_date = moment(to_date, 'YYYY-MM-DD')
                    let first_date = moment(from_date, 'YYYY-MM-DD')
                    let generated_events = []

                    let days = last_date.diff(first_date, 'days')+1
                    //console.log(days)
                    if(days!=0) {
                        for (let i = 0; i < days; i++){
                            let isSame = false
                            //console.log(last_date.format('DD/MM/YYYY'))
                            for (let event of data['results']) {
                                let cur_date = moment(event['only_date'], 'DD/MM/YYYY')
                                if(cur_date.isSame(last_date)){
                                    generated_events.push(event)
                                    isSame = true
                                    if(isSame && 'match' in event && event.match != null){
                                        count_m++
                                        max_m++
                                    }
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
                            last_date.add(-1, 'days')
                        }
                    }

                    $('#events tbody').html('')
                    $.each(generated_events, function( index, event ) {
                        let event_id = event['id'],
                            event_name = '',
                            event_short_name = event['short_name']
                        let tr_html = ``
                        let td_html = ``

                        let only_date = moment(event['only_date'], 'DD/MM/YYYY')
                        let count_day = 0
                        let microcycle_days = 0
                        let hasVideo = false
                        let isCurrentDate = false
                        let isFilled = true

                        if(moment().startOf('day').isSame(only_date)) isCurrentDate = true
                        newMicrocycle.forEach(function(microcycle, i) {
                            let date_with = moment(microcycle['startDate'], 'DD/MM/YYYY')
                            let date_by = moment(microcycle['endDate'], 'DD/MM/YYYY')
                            if(only_date.isBetween( date_with, date_by, undefined, '[]')){
                                microcycle_days = microcycle.days
                                count_day = only_date.diff(date_with, "days")+1
                                if(count_day < 3) count_day = '+'+count_day
                                else{
                                    count_day = only_date.diff(date_by, "days")
                                    if(count_day==0) count_day = '---'
                                }
                            }
                        });

                        if('training' in event && event['training'] != null){
                            num_tr = 1
                            let count_player = 0
                            let count_goalkeeper = 0

                            if(event_class === 'trainingClass' && event['only_date'] === event_date) num_tr++
                            if(event.training.exercises_info.length == 0 ||event.training.protocol_info.length == 0) isFilled = false
                            if('protocol_info' in event.training && event.training.protocol_info.length > 0){
                                $.each(event.training.protocol_info, function( index, value ) {
                                    if(value.status==null) {
                                        count_player++;
                                        if(value.player_info.card != null && value.player_info.card.is_goalkeeper){
                                            count_goalkeeper++;
                                        }
                                    }
                                });
                            }
                            hasVideo = event.training.video_href != '' && event.training.video_href != null
                            event_name = 'tr'+num_tr
                            event_class = 'trainingClass'
                            count_tr++
                            console.log(event.training)
                            td_html += `
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td class="${!isFilled ? 'text-danger' : ''}">${event['only_date']}</td>
                                <td><a href="/trainings/view/${event.training.event_id}" class="btn btn-sm btn-block btn-info py-0" data-id="${event.training.event_id}">${gettext('Training')+' '+(num_tr == 2 ? '2' : '')}</a></td>
                                <td><i class="switch-favorites fa ${event.training.favourites == 1 ? 'fa-star text-success' : (event.training.favourites == 2 ? 'fa-star text-warning' : (event.training.favourites == 3 ? 'fa-star text-danger' : 'fa-star-o'))}" data-switch="${event.training.favourites}"></i></td>
                                <td>${count_player}</td>
                                <td>0</td>
                            `
                        } else if('match' in event && event['match'] != null){
                            event_name = 'm'+(event['match']['m_type']+1)
                            event_class = 'matchClass'+event['match']['m_type']
                            count_m--
                            count_tr = 0

                            td_html += `
                                <td>${count_day==0 ? '---' : count_day}</td>
                                <td>${event['only_date']}</td>
                                <td><a href="/matches/match?id=${event.match.event_id}" data-count="${count_m+1}" class="btn btn-sm btn-block ${event.match.m_type == 0 ?"btn-warning":"btn-success"} py-0" data-id="${event.match.event_id}">${gettext('Match')}</a></td>
                                <td>---</td>
                                <td>---</td>
                                <td>---</td>
                            `
                        } else {
                            event_class = 'none'
                            td_html += `
                                    <td>${count_day==0 ? '---' : count_day}</td>
                                    <td>${event['only_date']}</td>
                                    <td>${count_tr == 0 && count_m==max_m ? '---' : '---'}</td>
                                    <td>---</td>
                                    <td>---</td>
                                    <td>---</td>
                                ` //<a href="#" class="btn btn-sm btn-block btn-secondary py-0 disabled">${/*gettext('Recreation')*/'---'}</a>
                        }
                        console.log(event['only_date']+"   "+moment(event['only_date'], 'DD/MM/YYYY').endOf('month').format('DD/MM/YYYY'))
                        tr_html += `<tr id="${event['only_date']==moment().format('DD/MM/YYYY') ? 'current_day' : ''}" class="${event_id!=null ? 'hasEvent' : ''} ${event_class} ${event['only_date']==moment(event['only_date'], 'DD/MM/YYYY').endOf('month').format('DD/MM/YYYY') ? "month_top_border" : ''}" data-value="${event_id}" data-microcycle-days="${microcycle_days}" data-microcycle-day="${count_day}" data-unfilled="${!isFilled ? '1' : '0'}" data-video="${hasVideo ? '1' : '0'}" style="${isCurrentDate ? 'border-top: 2px solid #dc3545!important' : ''}">`
                        tr_html += td_html
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

                    local_filters_events()

                    if(Cookies.get('event_id')){
                        if($('#events .hasEvent[data-value="'+Cookies.get('event_id')+'"]').length){
                            $('#events .hasEvent[data-value="'+Cookies.get('event_id')+'"] td:first').click()
                        } else {
                            Cookies.remove('event_id')
                        }
                    }

                    resize_events_table()

                    let current_date = `#current_day`
                    console.log($(current_date).offset())
                    let offset = $(current_date).offset().top-500

                    $('#events-table').animate({scrollTop: offset},'slow');
                }
            })
        },
        error: function(jqXHR, textStatus){
            //console.log(jqXHR)
            swal(gettext('Event save'), gettext('Error when action the event!'), "error");
        },
        complete: function () {
            //$('.page-loader-wrapper').fadeOut();
        }
    })
}

function set_month_or_date_button() {
    if($('.move_to_today').hasClass('isMonth')){
        $('.move_to_today').text(moment(strDate, 'DD/MM/YYYY').locale(get_cur_lang()).format('MMMM'))
    } else {
        $('.move_to_today').text(moment().locale(get_cur_lang()).format('DD/MM/YYYY'))
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
        order: [ 1, 'desc' ],
        serverSide: true,
        processing: true,
        lengthChange: false,
        pageLength: 10,
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

            //console.log($(row).find('.btn').text())
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
                    //console.log(days)
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
                        html_view += `<i class="switch-favorites fa `
                        if (data.training.favourites == 1) html_view += `fa-star text-success`
                        else if (data.training.favourites == 2) html_view += `fa-star text-warning`
                        else if (data.training.favourites == 3) html_view += `fa-star text-danger`
                        else html_view += `fa-star-o`
                        html_view += `" data-switch="${data.training.favourites}"></i>`
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
                            generateData()
                        })
                    } else if(key === 'edit'){
                        window.console && console.log(event_id);
                        $('#form-event-edit-modal').modal('show');
                        ajax_event_action('GET', null, 'get', event_id).then(function( data ) {
                            cur_edit_data = data
                            console.log(cur_edit_data);
                            $('#form-event-edit #id_short_name').val(cur_edit_data['short_name'])
                            $('#form-event-edit #datetimepicker-event').val(cur_edit_data['only_date'])
                            $('#form-event-edit #timepicker-event').val(cur_edit_data['time'])
                        })
                    } else if(key === 'copy'){
                        $('.hasEvent[data-value="'+event_id+'"] td:first').click()
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
                        $('#microcycle-modal').modal('show');
                        ajax_microcycle_update('GET', null, microcycle_id).then(function( data ) {
                            cur_edit_data = data
                            $('#microcycles-form').attr('method', 'PATCH')
                            $('#microcycles-form').removeClass('d-none')
                            $('#microcycles-form #id_name').val(cur_edit_data['name'])
                            $('#microcycles-form #datetimepicker-with-microcycle').val(cur_edit_data['date_with'])
                            $('#microcycles-form #datetimepicker-by-microcycle').val(cur_edit_data['date_by'])
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