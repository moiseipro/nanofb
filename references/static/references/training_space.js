async function ajax_training_space(method, data, action = '', id = '', func = '') {

    let url = "/references/api/training_space/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    //$('.page-loader-wrapper').fadeIn();

    return await $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                console.log(data)
            },
            error: function(jqXHR, textStatus, errorThrown){

            },
            complete: function () {
                //$('.page-loader-wrapper').fadeOut();
            }
        })
}