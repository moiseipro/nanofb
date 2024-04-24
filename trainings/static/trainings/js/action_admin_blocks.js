async function ajax_ablocks_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/ablocks/"
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
                if(method != 'GET') swal(gettext('Training block'), gettext('Training block action successfully!'), "success");
            },
            error: function(jqXHR, textStatus, errorThrown){
                //console.log(errorThrown)
                swal(gettext('Training block'), gettext('Error when action the training block!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                $('.block-loader-wrapper').remove();
            }
        })
}

$(window).on('load', function (){
    // Добавление задач для команды
    $('#admin-blocks-form').on('submit', function(e) {
        e.preventDefault()
        let send_data = getFormData($(this))
        console.log(send_data)
        ajax_ablocks_action($(this).attr('method'), send_data, 'create block').then(function () {
            ablocks_table.ajax.reload()
        })
    })
})