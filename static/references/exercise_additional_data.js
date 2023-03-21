var cashed_data = null

async function ajax_exercise_additional(method, data, action = '', id = '', func = '') {

    let url = "/references/api/exercise_additional/"
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
            error: function(jqXHR, textStatus, errorThrown){

            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
            }
        })
}