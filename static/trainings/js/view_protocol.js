$(window).on('load', function (){


})

function ajax_protocol_training(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/protocol/"
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
                if(data.status == 'protocol_limit'){
                    swal(gettext('Training '+action), gettext('The limit of exercises for the selected group has been reached'), "error");
                }if(data.status == 'protocol_got' || data.status == 'sort_exercise'){

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