
$(window).on('load', function (){
    var urlsplit = $(location).attr('pathname').split("/");
    var id = urlsplit[urlsplit.length-1];
    if(id==='')
    {
        id = urlsplit[urlsplit.length-2];
    }
    // Добавление упражнения в тренировку
    $('.visual-block').on('click', '.add-exercise', function (){
        let data = {}
        data.group = $(this).attr('data-group')
        data.duration = 0
        data.exercise_id = $('.exs-elem.active').attr('data-id')
        ajax_training_action('POST', data, 'add exercise', id, 'add_exercise').done(function (data) {
            console.log(data)
            let exercise = data.obj
            if(data.status=="exercise_added"){
                $('.group-block[data-group="'+exercise.group+'"]').append(`
                <div class="row border-bottom exercise-row" data-id="${exercise.id}">
                    <div class="col pr-0">${exercise.exercise_name[get_cur_lang()]}</div>
                    <div class="col-sm-12 col-md-3 pl-0">
                        <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                        <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 py-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 50px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                    </div>
                </div>
                `)
                set_count_exercises()
            }
        })
    })
    $('.visual-block').on('change', '.exercise-row [name="duration"]', function (){
        let exercises_training_id = $(this).closest('.exercise-row').attr('data-id')
        let data = {}
        data.duration = $(this).val()
        ajax_training_exercise_action('PUT', data, 'update', exercises_training_id, '')
    })
    $('.visual-block').on('click', '.exercise-row .delete-exercise', function (){
        let exercises_training_id = $(this).closest('.exercise-row').attr('data-id')
        let data = {}
        swal(gettext("Remove an exercise from a training?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_training_exercise_action('DELETE', data, 'delete', exercises_training_id, '').done(function (data) {
                    $('.visual-block .exercise-row[data-id="'+exercises_training_id+'"]').remove()
                    set_count_exercises()
                })
            }
        });
    })

    //Выгрузка упражнений в группу при клике по кнопке
    $('.visual-block').on('click', '.group-button', function () {
        render_exercises_training(id, $(this).attr('data-group'))
    })

    $('#save-training').on('click', function () {
        let date = $('#block-training-info input[name="date"]').val()
        let time = $('#block-training-info input[name="time"]').val()
        data = {
            'date': date+' '+time
        }
        ajax_event_action('PUT', data, 'save', id)
    })

    generate_exercises_module_data()
    render_exercises_training(id)
})

// Выгрузить упражнения из тренировки
function render_exercises_training(training_id = null, group = null) {
    let send_data = {}
    if(group != null) send_data.group = group

    ajax_training_action('GET', send_data, 'load', training_id, 'get_exercises').done(function (data) {
        let exercises = data.objs

        let card_html = ''
        let exs_html = ''

        $.each( exercises, function( key, exercise ) {

            card_html += `
            <div class="col-4 py-2">
                <div id="carouselSchema-${key}" class="carousel slide carouselSchema" data-ride="carousel" data-interval="false">
                    <ol class="carousel-indicators">
                        <li data-target="#carouselSchema" data-slide-to="0" class="active"></li>
                        <li data-target="#carouselSchema" data-slide-to="1"></li>
                    </ol>
                    <div class="carousel-inner">
                        <div class="carousel-item active">${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_1'] : ''}</div>
                        <div class="carousel-item">${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_2'] : ''}</div>
                    </div>
                    <a class="carousel-control-prev ml-2" href="#carouselSchema-${key}" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselSchema-${key}" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
                <div class="row text-center">
                    <div class="col-8 pr-0"><div class="w-100 border">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : exercise.exercise_name.first()}</div></div>
                    <div class="col-4 pl-0"><div class="w-100 border">${exercise.duration}</div></div>
                </div>
            </div>
            `

            if(group == null) return

            exs_html += `
            <div class="row border-bottom exercise-row" data-id="${exercise.id}">
                <div class="col pr-0 text-truncate" title="${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : exercise.exercise_name.first()}">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : exercise.exercise_name.first()}</div>
                <div class="col-sm-12 col-md-4 pl-0">
                    <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 p-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 30px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                </div>
            </div>`
        });
        $('.visual-block .add-exercise').attr('data-group', send_data.group)

        $('.visual-block .group-block[data-group="'+send_data.group+'"]').html(exs_html)
        $('#card-scheme-block').html(card_html)
        $('#card-scheme-block .carouselSchema').carousel()

        set_count_exercises()
    })
}

// Подсчет кол-ва добавленных упражнений по группам
function set_count_exercises() {
    let group = $('.add-exercise').attr('data-group')
    $('.add-exercise').children('span').text($('.group-block[data-group="'+group+'"] .exercise-row').length)
    set_sum_duration_group()
}

// Подсчет суммы минут добавленных упражнений по группам
function set_sum_duration_group() {
    let group = $('.add-exercise').attr('data-group')
    $('.group-block[data-group="'+group+'"]').each(function( index ) {
        let sum = 0
        $(this).find('.exercise-row').each(function( index ) {
            sum += parseInt($(this).find('input[name="duration"]').val())
        })
        console.log(sum)
        $('.sum-duration-group').text(sum)
    })

}

// Добавление дополнительных данных в модуль списка упражнений
function generate_exercises_module_data() {
    let html_data = `
    <div class="row w-100 font-weight-bold">
        <div class="col px-0">
            <button type="button" class="btn btn-sm btn-block btn-warning add-exercise edit-input" data-group="" disabled><i class="fa fa-plus" aria-hidden="true"></i> <span class="badge badge-light font-weight-bold">0</span></button>
        </div>
    </div>`

    html_data += `
    <div class="row w-100 border border-dark bg-default-light font-weight-bold">
        <div class="col px-0">
            <span class="sum-duration-group btn btn-sm float-right rounded-0 py-0 h-100 font-weight-bold" style="width: 50px">00</span>
        </div>
    </div>`

    html_data += `
    <div class="row w-100" style="min-height: 230px">
        <div class="tab-content w-100 pt-0" id="groups-tabContent">
            <div class="tab-pane fade group-block" id="group_A" data-group="1" role="tabpanel" aria-labelledby="group_A-tab">...1</div>
            <div class="tab-pane fade group-block" id="group_B" data-group="2" role="tabpanel" aria-labelledby="group_B-tab">...2</div>
            <div class="tab-pane fade group-block" id="group_C" data-group="3" role="tabpanel" aria-labelledby="group_C-tab">...3</div>
            <div class="tab-pane fade group-block" id="group_D" data-group="4" role="tabpanel" aria-labelledby="group_D-tab">...4</div>
        </div>
    </div>`

    html_data += `
    <div class="row w-100">
        <ul class="nav nav-pills nav-fill">
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="1" data-toggle="pill" href="#group_A" role="tab">Группа A</a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="2" data-toggle="pill" href="#group_B" role="tab">Группа B</a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="3" data-toggle="pill" href="#group_C" role="tab">Группа C</a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="4" data-toggle="pill" href="#group_D" role="tab">Группа D (Индивидуальная)</a>
            </li>
        </ul>
    </div>`

    $('.visual-block').append(html_data)
}

function ajax_training_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/action/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                console.log(data)
                if(data.status == 'exercise_limit'){
                    swal(gettext('Training '+action), gettext('The limit of exercises for the selected group has been reached'), "error");
                }if(data.status == 'exercise_got'){

                } else {
                    swal(gettext('Training '+action), gettext('Training action "'+action+'" successfully!'), "success");
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log(errorThrown)
                swal(gettext('Training '+action), gettext('Error when action "'+action+'" the training!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
            }
        })
}

function ajax_training_exercise_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/exercise/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                console.log(data)
                //swal(gettext('Training '+action), gettext('Exercise action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                console.log(jqXHR)
                swal(gettext('Training '+action), gettext('Error when action "'+action+'" the exercise!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                set_sum_duration_group()
            }
        })
}