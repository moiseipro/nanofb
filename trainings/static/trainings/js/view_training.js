
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
            }
            if(data.status="exercise_added"){

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
})

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
            }
        })
}