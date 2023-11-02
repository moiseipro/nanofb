async function ajax_notification_action(method, data, action = '', id = '', func = '') {

    let url = "/notifications/api/all/"
    if(id !== '' && id != null) url += `${id}/`
    if(func !== '' && func != null) url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function(data){
            //console.log(data)
            // if('status' in data && data.status == 'success'){
            //     swal(gettext('User'), data.message, 'success');
            // } else if('registration' in data && data.registration != '') {
            //     swal(gettext('User registration'), data.registration, "success");
            // }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR)
            if('registration' in jqXHR.responseJSON)
                swal(gettext('Users '+action), jqXHR.responseJSON.registration, "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}