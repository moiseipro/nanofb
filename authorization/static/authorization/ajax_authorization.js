async function ajax_authorization(method, data, action = '', id = '', func = '') {

    let url = "/login/api/"
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
            if ('registration' in data){
                swal(data['registration'], '', "success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            swal(gettext('Authorization'), gettext('Error when action authorization action!'), "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}