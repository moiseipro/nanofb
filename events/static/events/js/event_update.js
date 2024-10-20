
async function ajax_event_action(method, data, action = '', id = '', func = '') {
    //if (!confirm(gettext('Apply action to event?'))) return false
    let url = "/events/api/action/"
    if(id !== '' && id != 0) url += `${id}/`
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
            if(data!= undefined && 'status' in data){
                if(data['status'] == 'event_type_full') {
                    swal(gettext('Event'), gettext('You have created the maximum number of events of this type for one day!'), "error");
                } else if (data['status'] == 'training_copied'){
                    swal(gettext('Event'), gettext('The training was successfully copied!'), "success");
                } else {

                }
            }else if (method == 'POST' || method == 'UPDATE' || method == 'PUT' || method == 'DELETE'){
                swal(gettext('Event'), gettext('Event action successfully!'), "success");
            } else {

            }

        },
        error: function(jqXHR, textStatus){
            console.log(jqXHR)
            swal(gettext('Event'), gettext('Error when action the event!'), "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}

async function ajax_event_request(method, data, action = '', id = '', url = '') {
    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function(data){
            console.log(data)
            if(data!= undefined && 'status' in data){
                if(data['status'] == 'event_type_full') {
                    swal(gettext('Event'), gettext('You have created the maximum number of events of this type for one day!'), "error");
                } else if (data['status'] == 'training_copied'){
                    swal(gettext('Event'), gettext('The training was successfully copied!'), "success");
                } else {

                }
            }else if (method == 'POST' || method == 'UPDATE' || method == 'PUT' || method == 'DELETE'){
                swal(gettext('Event'), gettext('Event action successfully!'), "success");
            } else {

            }

        },
        error: function(jqXHR, textStatus){
            console.log(jqXHR)
            swal(gettext('Event'), gettext('Error when action the event!'), "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}