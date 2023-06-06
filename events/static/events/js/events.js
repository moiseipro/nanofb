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
var card_active = false

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
                $('#training-video-modal input[name="video_href"]').val('')
                $('#goal-event-view').val('')
                $('#keywords-event-view').val('')
                $('#load-event-view').val('')
            } else {
                Cookies.set('event_id', data_id, { expires: 1 })
                $('.hasEvent').removeClass('selected')
                $('.hasEvent[data-value="' + data_id + '"]').addClass('selected')
                ajax_event_action('GET', null, 'view event', data_id).then(function (data) {
                    let html_scheme = ``
                    if ('training' in data && data.training != null) {
                        console.log(data.training)
                        $('#training-video-modal input[name="video_href"]').val(data.training.video_href)
                        $('#goal-event-view').val(data.training.goal)
                        $('#keywords-event-view').val(data.training.objective_1)
                        $('#load-event-view').val(data.training.load_type)
                        if (data.training.exercises_info.length > 0) {
                            let exercises = data.training.exercises_info
                            for (let exercise of exercises) {
                                let count_slide = 0
                                let select_html = '', carousel_html = ''
                                if(exercise.scheme_1){
                                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
                                    count_slide++
                                    carousel_html+= `
                                        <div class="carousel-item active">
                                            <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" alt="scheme" width="100%" height="100%">
                                        </div>`
                                }
                                if(exercise.scheme_2){
                                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_1 ? 'active': ''}"></li>`
                                    count_slide++
                                    carousel_html+= `
                                        <div class="carousel-item ${!exercise.scheme_1 ? 'active': ''}">
                                            <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" alt="scheme" width="100%" height="100%">
                                        </div>`
                                }
                                if(exercise.exercise_scheme){
                                    if(exercise.exercise_scheme['scheme_1']){
                                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}"></li>`
                                        count_slide++
                                        carousel_html+= `
                                            <div class="carousel-item ${!exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}">
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
        clear_microcycle_form()
        cur_edit_data = microcycles_table.row($(this).closest('tr')).data()
        console.log('EDIT : ', cur_edit_data);
        $('#microcycles-form').attr('method', 'PATCH')
        $('#microcycles-form').removeClass('d-none')
        $('#microcycles-form #id_name').val(cur_edit_data['name'])
        $('#microcycles-form #datetimepicker-with-microcycle').datetimepicker('date', moment(cur_edit_data['date_with'], 'DD/MM/YYYY'))
        $('#microcycles-form #datetimepicker-by-microcycle').datetimepicker('date', moment(cur_edit_data['date_by'], 'DD/MM/YYYY'))
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
            let isLite = false
            if('protocol_info' in data.training) isLite = false
            else isLite = true
            let link = 'training' in data && data.training != null ? '/trainings'+(isLite?'/lite':'')+'/view/'+data.id : 'match' in data && data.match != null && !isLite ? '/matches/match?id='+data.id : ''
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
        $(this).toggleClass('active', calendar_active)

        $('#toggle-event-card').toggleClass('active', false)

        $('#event_calendar').toggleClass('d-none', !calendar_active)
        $(this).children('i').toggleClass('fa-arrow-up', calendar_active).toggleClass('fa-arrow-down', !calendar_active)
        $('.move_to_today').toggleClass('isMonth', !calendar_active)
        $('#filters-row').toggleClass('d-none', calendar_active)
        $('#rescalenda-control-buttons .rescalendar_move_button').toggleClass('d-none', !calendar_active)

        hide_training_card()
        $('#events-content').removeClass('d-none')

        set_month_or_date_button()
        resize_events_table()
        resize_trainings_block()
        generateData()
    })
    $('#toggle-event-card').on('click', function () {
        if ($(this).hasClass('active')) card_active = true;
        else card_active = false;
        $(this).toggleClass('active', !card_active)

        $('#event_calendar').toggleClass('d-none', !calendar_active || !card_active)
        $('.move_to_today').toggleClass('isMonth', !calendar_active || !card_active)
        $('#filters-row').toggleClass('d-none', calendar_active || !card_active)
        $('#rescalenda-control-buttons').toggleClass('d-none', !calendar_active || !card_active)
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
        resize_trainings_block()
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
    //Открыть карточку тренировки при клике на карандаш
    $('#open-select-exercise').on('click', function () {
        let href = $('tr.hasEvent.selected').find('.btn').attr('href')
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
        if (cur_fav>0) {
            cur_fav = 0
            $(this).removeClass('active')
        } else {
            cur_fav += 1
            $(this).addClass('active')
        }
        if (cur_fav == 1) $('#favourites-event-filter i').removeClass(`fa-star-o`).addClass(`fa-star text-success`)
        // else if (cur_fav == 2) $('#favourites-event-filter i').removeClass(`text-success`).addClass(`fa-star text-warning`)
        // else if (cur_fav == 3) $('#favourites-event-filter i').removeClass(`text-warning`).addClass(`fa-star text-danger`)
        // else $('#favourites-event-filter i').removeClass(`fa-star text-danger`).addClass(`fa-star-o`)
        else $('#favourites-event-filter i').removeClass(`fa-star text-success`).addClass(`fa-star-o`)
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
        let training_id = $('#events-table .hasEvent.selected').attr('data-value');

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
                shared_modal.find('.link-qrcode').ClassyQR({
                    create: true,
                    type: 'url',
                    url: res.data.link
                });
            }
        })
    })
    // Поделиться тренировкой
    $('#trainingShareModal').on('click', '.btn-share', (e) => {
        let cLink = $(e.currentTarget).attr('data-link');
        if (cLink && cLink != "") {
            try {
                copyTextToClipboard(cLink);
            } catch(e) {}
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
                 $('#trainingShareModal').find('.link-qrcode').ClassyQR({
                     create: true,
                     type: 'url',
                     url: res.data.link
                 });
                 try {
                     copyTextToClipboard(res.data.link);
                 } catch (e) {
                 }
                 swal(gettext("Ready"), gettext('Link copied')+` (${res.data.link})!`, "success");
             }
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

function clear_microcycle_form(){
    let nowdate = moment().format('DD/MM/YYYY')
    $('#microcycles-form #id_name').val('')
    $('#microcycles-form #datetimepicker-with-microcycle').datetimepicker('date', null)
    $('#microcycles-form #datetimepicker-by-microcycle').datetimepicker('date', null)
    $('#datetimepicker-with-microcycle').datetimepicker('maxDate', false);
    $('#datetimepicker-by-microcycle').datetimepicker('minDate', false);
}

function local_filters_events() {
    let days_val = $('#microcycle-days-filter').val() ? $('#microcycle-days-filter').val() : ''
    let day_val = $('#microcycle-day-filter').val() ? $('#microcycle-day-filter').val() : ''
    let filled_val = $('#filled-event-filter').attr('data-filter') ? $('#filled-event-filter').attr('data-filter') : 0
    let video_val = $('#video-event-filter').attr('data-filter') ? $('#video-event-filter').attr('data-filter') : 0

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
        //let data_filled = this_obj.attr('data-unfilled')
        let data_filled = this_obj.hasClass('trainingClass')
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
    $('#goal-event-filter').val('')
    $('#block-event-info .event-info').html('')
    if($('#events-content').hasClass('d-none')){
        hide_training_card()
        $('#events-content').removeClass('d-none')
    }

    generateData()
}

function resize_trainings_block(){
    let css = "calc(93vh - "+Math.round($('#event_calendar').height())+"px - "+Math.round($('.header').height())+ "px - "+Math.round($('#filters-row').height())+ "px - "+Math.round($('.card-header').height())+"px)"
    //console.log(css)
    $('#training-content .training-data').css({"max-height": css})
    $('#training-content .training-data').css({"height": css})
    $('#block-training-info').css({"max-height": css})
    $('#block-training-info').css({"height": css})
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
            {'data': 'name', 'defaultContent': "---"},
            {'data': 'date_with', searchable: false},
            {'data': 'date_by' , searchable: false},
            {'data': 'id' , sortable: false, searchable: false, render : function ( data, type, row, meta ) {
              return type === 'display'  ?
                '<button class="btn btn-sm btn-warning mx-1 py-0 edit" data-id="'+data+'"><i class="fa fa-pencil"></i></button>'+
                '<button class="btn btn-sm btn-danger mx-1 py-0 delete" data-id="'+data+'"><i class="fa fa-trash"></i></button>':
                data;
            }}
        ],
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
                        $('#microcycle-modal').modal('show');
                        ajax_microcycle_update('GET', null, microcycle_id).then(function( data ) {
                            cur_edit_data = data
                            $('#microcycles-form').attr('method', 'PATCH')
                            $('#microcycles-form').removeClass('d-none')
                            $('#microcycles-form #id_name').val(cur_edit_data['name'])
                            $('#microcycles-form #datetimepicker-with-microcycle').val(cur_edit_data['date_with']).change()
                            $('#microcycles-form #datetimepicker-by-microcycle').val(cur_edit_data['date_by']).change()
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