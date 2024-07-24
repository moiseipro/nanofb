async function ajax_aloads_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/aloads/"
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
                if(method != 'GET') swal(gettext('Load'), gettext('Load action successfully!'), "success");
            },
            error: function(jqXHR, textStatus, errorThrown){
                //console.log(errorThrown)
                swal(gettext('Load'), gettext('Error when action the load!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                $('.block-loader-wrapper').remove();
            }
        })
}

$(window).on('load', function (){
    // Добавление задач для команды
    $('#admin-loads-form').on('submit', function(e) {
        e.preventDefault()
        let send_data = getFormData($(this))
        console.log(send_data)
        ajax_aloads_action($(this).attr('method'), send_data, 'create load').then(function () {
            aloads_table.ajax.reload()
        })
    })
})