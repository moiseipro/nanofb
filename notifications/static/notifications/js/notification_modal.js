

$(window).on("load", function () {
    $('#view-notifications-button').on('click', function () {
        ajax_notification_send_action('GET', {}, 'notification', '', 'get_user_notification').then(function (data) {
            console.log(data)
            let notifications_list = data.data;
            let html = ''
            for (const notification of notifications_list) {
                html += `
                <div class="row mb-4 border notification-row" data-id="${notification.id}">
                    <div class="col-md-8 col-6 bg-light mb-2">
                        <h5>${notification.title}</h5>
                    </div>
                    <div class="col-md-2 col-3 bg-light mb-2">
                        <span class="badge badge-light">${moment(notification.date_receiving, "DD/MM/YYYY hh:ss").format("DD/MM/YYYY")}</span>
                    </div>
                    <div class="col-md-2 col-3 bg-light mb-2">
                        <button class="btn btn-sm btn-block btn-danger read-notification">${gettext("Delete")}</button>
                    </div>
                    <div class="col-12 py-2 articleViewer">
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
            current_button.addClass('d-none')
        })
    })
})