
async function ajax_training_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/action/"
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
                if(data.status == 'exercise_limit'){
                    swal(gettext('Training '+action), gettext('The limit of exercises for the selected group has been reached'), "error");
                } else if(data.status == 'protocol_not_empty'){
                    swal(gettext('Training '+action), gettext('There are players in the protocol. Remove the players before unloading the entire team.'), "error");
                } else if(data.status == 'protocol_limit'){
                    swal(gettext('Training '+action), gettext('The limit of players for one protocol has been reached.'), "error");
                } else if(data.status == 'exercise_got' || data.status == 'sort_exercise' || data.status == 'protocol_got'){

                } else {
                    if(method != 'GET') swal(gettext('Training '+action), gettext('Training action "'+action+'" successfully!'), "success");
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                //console.log(errorThrown)
                swal(gettext('Training '+action), gettext('Error when action "'+action+'" the training!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                $('.block-loader-wrapper').remove();
            }
        })
}