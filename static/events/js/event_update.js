
function ajax_event_action(method, data, action = '', id = '') {
    //if (!confirm(gettext('Apply action to event?'))) return false
    let url = "/events/api/action/"
    if(method !== 'POST') url += `${id}/`

    $('.page-loader-wrapper').fadeIn();

    return $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function(data){
            console.log(data)
            swal(gettext('Event '+action), gettext('Event action "'+action+'" successfully!'), "success");
        },
        error: function(jqXHR, textStatus){
            console.log(jqXHR)
            swal(gettext('Event '+action), gettext('Error when action "'+action+'" the event!'), "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}