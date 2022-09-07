
$(window).on('load', function (){
    var urlsplit = $(location).attr('pathname').split("/");
    var id = urlsplit[urlsplit.length-1];
    if(id==='')
    {
        id = urlsplit[urlsplit.length-2];
    }
    // Добавление упражнения в тренировку
    $('.add-exercise').on('click', function (){
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
                    <div class="col-sm-12 col-md-3 px-0">
                        <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 h-100 float-right delete-exercise edit-button"><i class="fa fa-trash" aria-hidden="true"></i></button>
                        <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 py-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 50px" autocomplete="off">
                    </div>
                </div>
                `)
                set_count_exercises()
            }
        })
    })
    $('.exercise-block').on('change', '.exercise-row [name="duration"]', function (){
        let exercises_training_id = $(this).closest('.exercise-row').attr('data-id')
        let data = {}
        data.duration = $(this).val()
        //data.exercise = $(this).closest('.exercise-row').attr('data-id')
        ajax_training_exercise_action('PUT', data, 'update', exercises_training_id, '')
    })
    $('.exercise-block').on('click', '.exercise-row .delete-exercise', function (){
        let exercises_training_id = $(this).closest('.exercise-row').attr('data-id')
        let data = {}
        ajax_training_exercise_action('DELETE', data, 'delete', exercises_training_id, '').done(function (data) {
            $('.exercise-block .exercise-row[data-id="'+exercises_training_id+'"]').remove()
            set_count_exercises()
        })
    })

    $('#save-training').on('click', function () {
        let date = $('#block-training-info input[name="date"]').val()
        let time = $('#block-training-info input[name="time"]').val()
        data = {
            'date': date+' '+time
        }
        ajax_event_action('PUT', data, 'save', id)
    })

    $('#add-exercise-modal').on('show.bs.modal', function (e) {
        set_count_exercises()
    })

    generate_exercises_module_data()
    set_sum_duration_group()
})

// Подсчет кол-ва добавленных упражнений по группам
function set_count_exercises() {
    $('.add-exercise').each(function( index ) {
        let group = $(this).attr('data-group')
        $(this).children('span').text($('.group-block[data-group="'+group+'"] .exercise-row').length)
    })
    set_sum_duration_group()
}

// Подсчет суммы минут добавленных упражнений по группам
function set_sum_duration_group() {
    $('.group-block').each(function( index ) {
        let sum = 0
        $(this).find('.exercise-row').each(function( index ) {
            sum += parseInt($(this).find('input[name="duration"]').val())
        })
        console.log(sum)
        $(this).find('.sum-duration-group').text(sum)
    })

}

// Добавление дополнительных данных в модуль списка упражнений
function generate_exercises_module_data() {
    let html_data = `
    <div class="row w-100">
        <div class="tab-content" id="groups-tabContent">
            <div class="tab-pane fade group-block" id="group_A" role="tabpanel" data-group="1" aria-labelledby="group_A-tab">...1</div>
            <div class="tab-pane fade group-block" id="group_B" role="tabpanel" data-group="2" aria-labelledby="group_B-tab">...2</div>
            <div class="tab-pane fade group-block" id="group_C" role="tabpanel" data-group="3" aria-labelledby="group_C-tab">...3</div>
            <div class="tab-pane fade group-block" id="group_D" role="tabpanel" data-group="4" aria-labelledby="group_D-tab">...4</div>
        </div>
    </div>`

    html_data += `
    <div class="row w-100">
        <ul class="nav nav-pills nav-fill">
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold" data-toggle="pill" href="#group_A" role="tab">Группа A</a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold" data-toggle="pill" href="#group_B" role="tab">Группа B</a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold" data-toggle="pill" href="#group_C" role="tab">Группа C</a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold" data-toggle="pill" href="#group_D" role="tab">Группа D (Индивидуальная)</a>
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