
async function ajax_training_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/lite/api/action/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                console.log(data)
                if(data.status == 'exercise_limit'){
                    swal(gettext('Training'), gettext('The limit of exercises for the selected group has been reached'), "error");
                } else if(data.status == 'exercise_repeated'){
                    swal(gettext('Training'), gettext('There cannot be two identical exercises in the same group.'), "error");
                } else if(data.status == 'protocol_not_empty'){
                    swal(gettext('Training'), gettext('There are players in the protocol. Remove the players before unloading the entire team.'), "error");
                } else if(data.status == 'protocol_limit'){
                    swal(gettext('Training'), gettext('The limit of players for one protocol has been reached.'), "error");
                } else if(data.status == 'exercise_got' || data.status == 'sort_exercise' || data.status == 'protocol_got' || action == 'favourites'){

                } else {
                    if(method != 'GET') swal(gettext('Training'), gettext('Training action successfully!'), "success");
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                //console.log(errorThrown)
                swal(gettext('Training'), gettext('Error when action the training!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                //$('.block-loader-wrapper').remove();
            }
        })
}

async function ajax_training_exercise_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/lite/api/exercise/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                //console.log(data)
                //swal(gettext('Training '+action), gettext('Exercise action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                //console.log(jqXHR)
                swal(gettext('Training'), gettext('Error when action the exercise!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                //set_sum_duration_group()
            }
        })
}

async function ajax_training_exercise_data_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/lite/api/exercise_data/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                //console.log(data)
                //swal(gettext('Training '+action), gettext('Exercise action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                //console.log(jqXHR)
                swal(gettext('Training'), gettext('Exercise data action error in training!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                //set_sum_duration_group()
            }
        })
}