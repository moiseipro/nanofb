async function ajax_aobjectives_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/aobjectives/"
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
                if(method != 'GET') swal(gettext('Objective'), gettext('Objective action successfully!'), "success");
            },
            error: function(jqXHR, textStatus, errorThrown){
                //console.log(errorThrown)
                swal(gettext('Objective'), gettext('Error when action the objective!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                $('.block-loader-wrapper').remove();
            }
        })
}

$(window).on('load', function (){
    // Добавление задач для команды
    $('#admin-objectives-form').on('submit', function(e) {
        e.preventDefault()
        let send_data = getFormData($(this))
        console.log(send_data)
        ajax_aobjectives_action($(this).attr('method'), send_data, 'create objective').then(function () {
            aobjectives_table.ajax.reload()
        })
    })
})