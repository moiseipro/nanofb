var edit_mode = false;

$(window).on('load', function (){
    var urlsplit = $(location).attr('pathname').split("/");
    var id = urlsplit[urlsplit.length-1];
    if(id==='')
    {
        id = urlsplit[urlsplit.length-2];
    }
    $('.add-exercise').on('click', function (){

        data = {}
        data.group = $(this).attr('data-group')
        data.duration = 10
        ajax_training_action('POST', data, 'add exercise', id, 'add_exercise')
    })

    $('.toggle-edit-mode').on('click', function () {
        edit_mode = !edit_mode
        $('.edit-input').prop('disabled', !edit_mode)
        $('.edit-button').toggleClass('d-none', !edit_mode)
        $('.view-button').toggleClass('d-none', edit_mode)
    })
    $('#save-training').on('click', function () {
        let date = $('#block-training-info input[name="date"]')
        let time = $('#block-training-info input[name="time"]')
        data = {
            'date': date+' '+time
        }
        ajax_training_action('PUT', data, 'save training', id)
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