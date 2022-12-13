async function ajax_team_action(method, data, action = '', id = '', func = '') {

    let url = "/references/api/teams/"
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
        },
        error: function(jqXHR, textStatus){
            console.log(textStatus)
            if('limit' in jqXHR.responseJSON){
                swal(gettext('Team '+action), gettext('The team limit has been reached!'), "error");
            }else{
                swal(gettext('Team '+action), gettext('Error when action "'+action+'" the team!'), "error");
            }

        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}