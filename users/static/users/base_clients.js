var user_select_id;
var club_select_id;
var users_menu_state = null

$(window).on("load", function () {

    if(Cookies.get('club_selected_id')){
        $('#club-table-show-button').tab('show')
    } else {
        $('#user-table-show-button').tab('show')
    }

    generate_ajax_users_table("calc(100vh - 240px)")
    generate_ajax_clubs_table("calc(100vh - 240px)")
    generate_ajax_user_payment_table("calc(100vh - 310px)")
    user_payment_table.on('preInit.dt', function () {
        user_payment_table.columns( '.side-info-col' ).visible( false );
    });
    generate_ajax_club_payment_table("calc(100vh - 310px)")
    club_payment_table.on('preInit.dt', function () {
        club_payment_table.columns( '.side-info-col' ).visible( false );
    });

    users_table.on('preInit.dt', function () {
        check_admin_button()
    });

    $('.change-management-table').on('shown.bs.tab', function () {
        users_table.columns.adjust();
        clubs_table.columns.adjust();
        user_payment_table.columns.adjust();
        club_payment_table.columns.adjust();
    })

    $('.management-payment-block').on('shown.bs.collapse', function () {
        user_payment_table.columns.adjust();
        club_payment_table.columns.adjust();
    })



    $('#toggle_btn').on('click', function () {
        setTimeout(function (){
            users_table.columns.adjust();
            clubs_table.columns.adjust();
            user_payment_table.columns.adjust();
            club_payment_table.columns.adjust();
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

    $('#edit-profile-button').on('click', function () {
        if(!$('#edit-personal-form').valid()) return
        let personal = $('#edit-personal-form').serializeArray()
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_select_id, 'edit_personal').then(function (data) {
            console.log(data)
            users_table.ajax.reload()
        })
    })

    $('#group-select').select2({
        tags: true,
        allowClear: true,
        //dropdownParent: $('#microcycles-form'),
        placeholder: gettext("Group"),
        language: get_cur_lang(),
        theme: 'bootstrap4',
        width: '100%',
        ajax: {
            url: '/user/group_list',
            dataType: 'json',
            data: function (params) {
            },
            processResults: function (data, params) {
                console.log(data)
                let clearData = $.grep(data, function(value) {
                    return value.id != 'all';
                });
                //clearData.push({id: '', text: 'Group', count: ''})
                console.log(clearData)
                return {
                    results: clearData,
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
                <div class="" title="${state.text}">${state.text}</div>

            `);
            return $state;
        },
        templateSelection: function (state) {
            console.log(state)
            var $state = $(`
                <div class="text-truncate" title="${state.text}"> ${state.text}</div>

            `);
            return $state;
        },
    });

    $('#edit-user-button').on('click', function () {
        if(!$('#edit-user-form').valid()) return
        let personal = $('#edit-user-form').serializeArray()
        let has_demo = false;
        let is_super = false;
        let is_active = false;
        for (const data of personal) {
            if (data.name=='is_demo_mode'){
                has_demo = true;
            }
            if (data.name=='is_superuser'){
                is_super = true;
            }
            if (data.name=='is_active'){
                is_active = true;
            }
        }
        if (!has_demo){
            personal.push({name:'is_demo_mode', value:'off'})
        }
        if (!is_super){
            personal.push({name:'is_superuser', value:'off'})
        }
        if (!is_active){
            personal.push({name:'is_active', value:'off'})
        }
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_select_id, 'edit_user').then(function (data) {
            console.log(data)
        })
    })

    $('#add-user-button').on('click', function () {
        if(!$('#add-user-form').valid()) return
        let personal = $('#add-user-form').serializeArray()
        // let has_demo = false;
        // for (const data of personal) {
        //     if (data.name=='is_demo_mode'){
        //         has_demo = true;
        //     }
        // }
        // if (!has_demo){
        //     personal.push({name:'is_demo_mode', value:'off'})
        // }
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'create').then(function (data) {
            console.log(data)
        })
    })

    $('#users-table').on('click', '.archive-user', function () {
        let is_archive
        let user_id = $(this).attr('data-id')
        if ($(this).hasClass('active')){
            is_archive = 0
            $(this).removeClass('active text-danger')
        } else {
            is_archive = 1
            $(this).addClass('active text-danger')
        }
        let send_data = {'is_archive' : is_archive}
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_id, 'edit_user').then(function (data) {
            console.log(data)
        })
    })

    $('#users-table').on('click', '.delete-user', function () {
        let user_id = $(this).attr('data-id')
        let send_data = {}
        console.log(send_data);
        swal({
            title: gettext("Delete user?"),
            text: gettext("After deletion, all workouts, folders and exercises of the user will be cleaned."),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                ajax_users_action('DELETE', send_data, 'delete', user_id).then(function (data) {
                    users_table.ajax.reload()
                })
            } else {

            }
        });

    })

    $('#generate-password-user-button').on('click', function () {
        let send_data = {}
        swal({
            title: gettext("Are you sure you want to generate a new password?"),
            text: "The new password will be sent by email!",
            icon: "warning",
            buttons: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                ajax_users_action('POST', send_data, 'new password', user_select_id, 'generate_new_password').then(function (data) {
                    console.log(data)
                })
            }
        });

    })

    users_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = users_table.rows( indexes ).data().toArray();
            if(type=='row') {
                toggle_edit_mode(false)
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                Cookies.set('user_selected_id', cur_edit_data.id, { expires: 1 })
                user_select_id = cur_edit_data.id
                load_user_data(user_select_id)
                load_group_data(user_select_id)
                load_team_data(user_select_id)
                user_payment_table.columns('.user-payment-filter').search( user_select_id ).draw();

                check_admin_button()
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = users_table.rows( indexes ).data().toArray();
            if(type=='row') {
                toggle_edit_mode(false)
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                Cookies.remove('user_selected_id')
                user_select_id = null
                check_admin_button()
            }
        })

    clubs_table
        .on( 'select', function ( e, dt, type, indexes ) {
            console.log(type)
            let rowData = clubs_table.rows( indexes ).data().toArray();
            if(type=='row') {
                toggle_edit_mode(false)
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                Cookies.set('club_selected_id', cur_edit_data.id, { expires: 1 })
                club_select_id = cur_edit_data.id
                load_club_data(club_select_id)
                load_club_group_data(club_select_id)
                club_payment_table.columns('.club-payment-filter').search( club_select_id ).draw();

                check_admin_button()
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = clubs_table.rows( indexes ).data().toArray();
            if(type=='row') {
                toggle_edit_mode(false)
                let cur_edit_data = rowData[0]
                console.log(cur_edit_data)
                Cookies.remove('club_selected_id')
                club_select_id = null
                check_admin_button()
            }
        })

    $('.change-management-table').on('click', function () {
        users_table.rows('.selected').deselect()
        clubs_table.rows('.selected').deselect()
        is_select_club = false;
        is_select_user = false;
        check_admin_button()
    })

    $('#add-club-form').submit(function (event) {
        let form_Data = new FormData(this)
        console.log(form_Data)

        ajax_club_action('POST', form_Data, 'club').then(function (data) {
            console.log(data)
        })
        event.preventDefault();
    })

    $('#edit-club-form').submit(function (event) {
        let form_Data = new FormData(this)
        console.log(form_Data);

        ajax_club_action('PUT', form_Data, 'edit', club_select_id).then(function (data) {
            console.log(data)
            load_club_data(club_select_id)
        })
        event.preventDefault();
    })
    
    $('#add-user-payment-button').on('click', function () {
        if (user_select_id == null) return
        let send_data = []

        let obj = $('#payment-user-info-block')
        console.log(send_data)
        send_data.push({'name': 'date', 'value': moment(obj.find('[name="date"]').val()).format('DD/MM/YYYY')})
        send_data.push({'name': 'payment_before', 'value': moment(obj.find('[name="payment_before"]').val()).format('DD/MM/YYYY')})
        send_data.push({'name': 'payment', 'value': obj.find('[name="payment"]').val()})
        send_data.push({'name': 'user_id', 'value': user_select_id})

        console.log(send_data)

        ajax_user_payment_action('POST', send_data, 'add').then(function () {
            user_payment_table.ajax.reload()
            obj.find('[name="date"]').val('')
            obj.find('[name="payment_before"]').val('')
            obj.find('[name="payment"]').val('')
        })
    })

    $('#user-payment-table').on('click', '.delete-payment', function () {
        let payment_id = $(this).attr('data-id')
        let send_data = {}
        console.log(send_data);
        swal({
            title: gettext("Delete user payment?"),
            text: gettext("When you delete a payment, the date of access to the program does not change"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                ajax_user_payment_action('DELETE', send_data, 'delete', payment_id).then(function (data) {
                    user_payment_table.ajax.reload()
                })
            } else {

            }
        });

    })

    $('#add-club-payment-button').on('click', function () {
        if (club_select_id == null) return
        let send_data = []

        let obj = $('#payment-club-info-block')
        console.log(send_data)
        send_data.push({'name': 'date', 'value': moment(obj.find('[name="date"]').val()).format('DD/MM/YYYY')})
        send_data.push({'name': 'payment_before', 'value': moment(obj.find('[name="payment_before"]').val()).format('DD/MM/YYYY')})
        send_data.push({'name': 'payment', 'value': obj.find('[name="payment"]').val()})
        send_data.push({'name': 'club_id', 'value': club_select_id})

        console.log(send_data)

        ajax_club_payment_action('POST', send_data, 'add').then(function () {
            club_payment_table.ajax.reload()
            clubs_table.ajax.reload()
            obj.find('[name="date"]').val('')
            obj.find('[name="payment_before"]').val('')
            obj.find('[name="payment"]').val('')
        })
    })

    $('#club-payment-table').on('click', '.delete-payment', function () {
        let payment_id = $(this).attr('data-id')
        let send_data = {}
        console.log(send_data);
        swal({
            title: gettext("Delete club payment?"),
            text: gettext("When you delete a payment, the date of access to the program does not change"),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                ajax_club_payment_action('DELETE', send_data, 'delete', payment_id).then(function (data) {
                    club_payment_table.ajax.reload()
                })
            } else {

            }
        });

    })

    $('#send-mail-form').submit(function (event) {
        let form_Data = $(this).serializeArray()
        console.log(form_Data)

        ajax_users_action('POST', form_Data, 'send mail', user_select_id, 'send_mail').then(function (data) {
            console.log(data)
        })
        event.preventDefault();
    })
})