async function ajax_user_payment_action(method, data, action = '', id = '', func = '') {

    let url = "/references/api/payment/user/"
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

        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}

async function ajax_club_payment_action(method, data, action = '', id = '', func = '') {

    let url = "/references/api/payment/club/"
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

        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}