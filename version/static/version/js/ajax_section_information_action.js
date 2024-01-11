async function ajax_section_information_action(method, data, action = '', id = '', func = '') {

    let url = "/version/api/information/"
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