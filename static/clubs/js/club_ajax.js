async function ajax_club_action(method, data, action = '', id = '', func = '') {

    let url = "/clubs/api/"
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
            } else {

            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            swal(gettext('Training '+action), gettext('Error when action "'+action+'" the training!'), "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}