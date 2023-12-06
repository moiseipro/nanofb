
async function ajax_microcycle_update(method, data, id) {
    if (method != 'GET' && !confirm(gettext('Save changes to the microcycle?'))) return false

    let url = "/events/api/microcycles/"
    if(method != 'POST') url += id+"/"

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function (data) {
            //console.log(data)
            if(method != 'GET') {
                if(data != null && 'status' in data && data.status == 'microcycle_full'){
                    swal(gettext('Microcycle'), gettext('Microcycles should not overlap and go beyond the season!'), 'warning');
                } else {
                    swal(gettext('Microcycle'), gettext('The action with the microcycle was successfully completed!'), "success");
                }
                generateData()
                microcycles_table.ajax.reload()
            }
        },
        error: function (jqXHR, textStatus) {
            alert( gettext('Error when updating the microcycle. ') + gettext(textStatus) );
        },
        complete: function (data) {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}