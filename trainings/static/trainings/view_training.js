

$(window).on('load', function (){
    $('.add-exercise').on('click', function (){
        var urlsplit = $(location).attr('pathname').split("/");
        var id = urlsplit[urlsplit.length-1];
        if(id==='')
        {
            id = urlsplit[urlsplit.length-2];
        }
        data = {}
        data.group = $(this).attr('data-group')
        data.duration = 10
        ajax_training_action('POST', data, 'add exercise', id, 'add_exercise')
    })
})

function ajax_training_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/action/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                console.log(data)
                swal(gettext('Training '+action), gettext('Training action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                console.log(jqXHR)
                swal(gettext('Training '+action), gettext('Error when action "'+action+'" the training!'), "error");
            },
            complete: function () {
                if(method === 'POST') {

                }
            }
        })
}