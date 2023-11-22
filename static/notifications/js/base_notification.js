$(window).on("load", function () {
    generate_ajax_users_table("calc(100vh - 240px)", false)
    generate_ajax_notification_table("calc(100vh - 240px)")
    generate_ajax_notification_sent_table("calc(100vh - 240px)")


    //Загрузка сохраненных фильтров
    users_table.on('preInit.dt', function () {
        users_table.columns( '.main-setting-col' ).visible( false );
        users_table.columns( '.side-info-col' ).visible( false );
        users_table.columns('.flag-info-col').visible(true);
        users_table.columns(' .notifications-info-col ').visible(true);
    });

    notification_sent_table.on('preInit.dt', function () {
        notification_sent_table.columns( '.additional-info-col' ).visible( false );
    });

    $('#toggle_btn').on('click', function () {
        setTimeout(function (){
            notification_table.columns.adjust();
            notification_sent_table.columns.adjust();
            users_table.columns.adjust();
        }, 400);
    })

    $('.datetimepickerfilter').datetimepicker({
        format: 'DD/MM/YYYY',
        useCurrent: false,
        buttons: {
            showClear: true,
        },
        locale: get_cur_lang(),
        icons: {
            up: "fa fa-angle-up",
            down: "fa fa-angle-down",
            next: 'fa fa-angle-right',
            previous: 'fa fa-angle-left'
        }
    });

    users_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = users_table.rows( indexes ).data().toArray();
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                user_select_id = cur_edit_data.id
                notification_sent_table.columns('.notification-user-filter').search( user_select_id ).draw();
                load_user_data(user_select_id)
                check_admin_button()
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = users_table.rows( indexes ).data().toArray();
            let cur_edit_data = rowData[0]
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                user_select_id = null
                notification_sent_table.columns('.notification-user-filter').search( '' ).draw();
            }
        })

    notification_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = notification_table.rows( indexes ).data().toArray();
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                notification_select_id = cur_edit_data.id
                //users_table.columns('.notification-user-filter').search( user_select_id ).draw();
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = notification_table.rows( indexes ).data().toArray();
            let cur_edit_data = rowData[0]
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                notification_select_id = null
                clear_notification_form()
                $('#notification-create-button').text(gettext('Create'))
                //users_table.columns('.notification-user-filter').search( '' ).draw();
            }
        })

    notification_sent_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = notification_sent_table.rows( indexes ).data().toArray();
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                notification_sent_select_id = cur_edit_data.id
                //users_table.columns('.notification-user-filter').search( user_select_id ).draw();
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = notification_sent_table.rows( indexes ).data().toArray();
            let cur_edit_data = rowData[0]
            if(type=='row') {
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                notification_sent_select_id = null
                //users_table.columns('.notification-user-filter').search( '' ).draw();
            }
        })


    // $('#notification-create-button').on('click', function () {
    //     let notification_form = $('#notification-form')
    //     if (notification_select_id == null){
    //         notification_form.attr('method', 'POST')
    //         notification_form.find('#notification-title').val('')
    //         document.articleEditor.setData('')
    //     }
    // })

    // Submitting a notification creation form
    $('#notification-form').submit(function (event) {
        event.preventDefault();

        let form_data = $(this).serializeArray()
        let method = $(this).attr('method')
        //let id = $(this).attr('data-id')
        let form_list = {}
        for (const key in form_data) {
            if (form_data[key].name=='date_receiving'){
                form_data[key].value = moment(form_data[key].value).format('DD/MM/YYYY hh:mm')
            }
            form_list[form_data[key].name] = form_data[key].value
        }

        if (method == 'POST')
        ajax_notification_action(method, form_list, 'notification', method != 'POST' ? notification_select_id : '').then(function (data) {
            console.log(data)
            notification_table.ajax.reload();
            notification_select_id = null
            $('#notification-table-button').click()
        })
    })

    // Submitting a notification creation form
    $('#notification-send-form').submit(function (event) {
        event.preventDefault();
        let form_data = $(this).serializeArray()
        let method = $(this).attr('method')
        let id = $(this).attr('data-id')
        let user_table_data = users_table.ajax.json()
        console.log(form_data)
        let form_list = {}
        for (const key in form_data) {
            form_list[form_data[key].name] = form_data[key].value
        }
        let send_data = []
        if (typeof user_select_id != 'undefined' && user_select_id != null){
            send_data = {
                'user': user_select_id,
                'notification': form_data.find((element) => element.name == "notification").value,
                'date_receiving': moment(form_data.find((element) => element.name == "date_receiving").value).format('DD/MM/YYYY hh:mm')
            }
        } else {
            for (const user of user_table_data.data) {
                send_data.push({
                    'user': user.id,
                    'notification': form_data.find((element) => element.name == "notification").value,
                    'date_receiving': moment(form_data.find((element) => element.name == "date_receiving").value).format('DD/MM/YYYY hh:mm')
                })
            }
        }

        console.log(send_data)

        ajax_notification_send_action(method, send_data , 'notification', id).then(function (data) {
            console.log(data)
            notification_sent_table.ajax.reload();
        })


    })

    notification_table.on('click', '.delete-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        ajax_notification_action('DELETE', send_data, 'notification', id).then(function (data) {
            console.log(data)
            notification_table.ajax.reload();
        })
    })

    notification_table.on('click', '.edit-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        let notification_form = $('#notification-form')

        ajax_notification_action('GET', send_data, 'notification', id).then(function (data) {
            console.log(data)

            if (notification_select_id != null) {
                notification_form.attr('method', 'PUT')
                notification_form.find('#notification-title').val(data.title)
                document.articleEditor.setData(data.content)
                $('#notification-create-button').text(gettext('Edit'))
                $('#notification-create-button').click()
            }

        })
    })

    notification_table.on('click', '.view-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        ajax_notification_action('GET', send_data, 'notification', id).then(function (data) {
            console.log(data)
            let notification = data;
            let date = 'date_receiving' in notification ? moment(notification.date_receiving, "DD/MM/YYYY hh:ss").format("DD/MM/YYYY") : ''
            if (notification_select_id != null) {
                $('#notification-view-modal').modal('show');
                let html = ''
                html += `
                <div class="row mb-4 border notification-row" data-id="${notification.id}">
                    <div class="col-md-10 col-8 bg-light mb-2">
                        <h5>${notification.title}</h5>
                    </div>
                    <div class="col-md-2 col-4 bg-light mb-2">
                        <span class="badge badge-light">${date}</span>
                    </div>
                    <div class="col-12 py-2 articleViewer">
                        ${notification.content}
                    </div>
                </div>
                `
                $('#notification-view').html(html)
                generate_ckeditor_notifications()
            }

        })
    })

    notification_sent_table.on('click', '.view-sent-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        ajax_notification_send_action('GET', send_data, 'notification', id).then(function (data) {
            console.log(data)
            let notification = data;
            let date = 'date_receiving' in notification ? moment(notification.date_receiving, "DD/MM/YYYY hh:ss").format("DD/MM/YYYY") : ''
            if (notification_sent_select_id != null) {
                $('#notification-view-modal').modal('show');
                let html = ''
                html += `
                <div class="row mb-4 border notification-row" data-id="${notification.id}">
                    <div class="col-md-10 col-8 bg-light mb-2">
                        <h5>${notification.title}</h5>
                    </div>
                    <div class="col-md-2 col-4 bg-light mb-2">
                        <span class="badge badge-light">${date}</span>
                    </div>
                    <div class="col-12 py-2 articleViewer">
                        ${notification.content}
                    </div>
                </div>
                `
                $('#notification-view').html(html)
                generate_ckeditor_notifications()
            }

        })
    })

    $('#notification-table-button').on('shown.bs.tab', function () {
        notification_table.columns.adjust();
    })

    notification_sent_table.on('click', '.delete-sent-notification', function (){
        let id = $(this).attr('data-id')
        let send_data = {}

        ajax_notification_send_action('DELETE', send_data, 'notification', id).then(function (data) {
            console.log(data)
            notification_sent_table.ajax.reload();
        })
    })

    $('#notification-send-table-button').on('shown.bs.tab', function () {
        notification_sent_table.columns.adjust();
    })

    $('#notification-video').on('click', (e) => {
        $('#videoSelectorModal').modal('show');
    });
})

function clear_notification_form() {
    let notification_form = $('#notification-form')
    if (notification_select_id == null){
        notification_form.attr('method', 'POST')
        notification_form.find('#notification-title').val('')
        document.articleEditor.setData('')
    }
}