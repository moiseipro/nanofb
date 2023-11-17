

$(window).on("load", function () {
       $('#notifications-view-modal').on('show.bs.modal', function () {
        ajax_notification_send_action('GET', {}, 'notification', '', 'get_user_notification').then(function (data) {
            console.log(data)
            let notifications_list = data.data;
            let html = ''
            for (const notification of notifications_list) {
                html += `
                <div class="row mb-4 border notification-row" data-id="${notification.id}">
                    <div class="col-md-8 col-6 bg-light mb-2" data-toggle="collapse" href="#notification-content-${notification.id}">
                        <h5>${notification.title}</h5>
                    </div>
                    <div class="col-md-2 col-3 bg-light mb-2">
                        <span class="badge badge-light">${moment(notification.date_receiving, "DD/MM/YYYY hh:ss").format("DD/MM/YYYY")}</span>
                    </div>
                    <div class="col-md-2 col-3 bg-light mb-2">
                        <button class="btn btn-sm btn-block btn-danger read-notification">${gettext("Delete")}</button>
                    </div>
                    <div id="notification-content-${notification.id}" class="col-12 py-2 articleViewer">
                        ${notification.content}
                    </div>
                </div>
                `
            }

            $('#notification-view-all').html(html)
            generate_ckeditor_notifications()
        })
    })

    $('#notifications-view-modal').on('click', '.read-notification', function () {
        let current_button = $(this)
        let id = $(this).closest('.notification-row').attr('data-id')

        ajax_notification_send_action('POST', {}, 'notification', id, 'set_view_notification').then(function (data) {
            console.log(data)
            current_button.closest('.notification-row').addClass('d-none')
        })
    })

    //Cookies.remove('notification-day-view');
    if ($('#view-notifications-button').attr('data-count') > 0){
        let cookie_view = Cookies.get('notification-day-view');

        if (cookie_view == undefined) $('#notifications-view-modal').modal('show')

        $('#notifications-view-modal').on('hidden.bs.modal', function () {
            Cookies.set('notification-day-view', '1', { expires: 1 })
        })
    }

})