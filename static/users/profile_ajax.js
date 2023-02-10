async function ajax_profile(method, data, action = '', id = '', func = '') {

    let url = "profile/api/"
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
            console.log(jqXHR)
            let error_text = ''
            for (let text of jqXHR.responseJSON){
                error_text+=text+'\n'
            }
            swal(gettext('Authorization'), error_text, "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}