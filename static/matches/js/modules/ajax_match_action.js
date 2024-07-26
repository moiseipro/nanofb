async function ajax_match_action(method, data, action = '', id = '', func = '') {

    let url = "/match/api/action/"
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
                //console.log(data)

            },
            error: function(jqXHR, textStatus, errorThrown){
                //console.log(errorThrown)
                swal(gettext('Match'), gettext('Error when action the match!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                $('.block-loader-wrapper').remove();
            }
        })
}