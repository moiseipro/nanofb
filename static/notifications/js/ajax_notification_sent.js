async function ajax_notification_send_action(method, data, action = '', id = '', func = '') {

    let url = "/notifications/api/sent/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        contentType: "application/json; charset=utf-8",
        url: url,
        type: method,
        dataType: "JSON",
        data: JSON.stringify(data),
        success: function(data){
            //console.log(data)
            // if('status' in data && data.status == 'success'){
            //     swal(gettext('User'), data.message, 'success');
            // } else if('registration' in data && data.registration != '') {
            //     swal(gettext('User registration'), data.registration, "success");
            // }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR)
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}

$(window).on("load", function () {

    $('#notification-select').select2({
        minimumResultsForSearch: -1,
        multiple: false,
        placeholder: gettext("Notification"),
        language: get_cur_lang(),
        theme: 'bootstrap4',
        width: '100%',
        ajax: {
            url: '/notifications/notification_list/',
            dataType: 'json',
            data: function (params) {

            },
            processResults: function (data, params) {
                console.log(data)
                return {
                    results: data,
                    pagination: {
                        more: false
                    }
                };
            },
            cache: true
        },
        templateResult: function (state) {
            console.log(state)
            var $state = $(`
                <div class="w-100"> ${state.text} </div>
                
            `);
            return $state;
        }
    })
})