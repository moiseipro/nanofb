async function ajax_loads_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/loads/"
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
                if(method != 'GET') swal(gettext('Training load'), gettext('Training load action successfully!'), "success");
            },
            error: function(jqXHR, textStatus, errorThrown){
                //console.log(errorThrown)
                swal(gettext('Training load'), gettext('Error when action the training load!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                $('.load-loader-wrapper').remove();
            }
        })
}

$(window).on('load', function (){
    // Добавление нагрузки для команды
    $('#loads-form').on('submit', function(e) {
        e.preventDefault()
        let send_data = getFormData($(this))
        console.log(send_data)
        ajax_loads_action($(this).attr('method'), send_data, 'create load').then(function () {
            loads_table.ajax.reload()
        })
    })
})