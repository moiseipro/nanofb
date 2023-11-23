var user_select_id;
var club_select_id;
var users_menu_state = null

$(window).on("load", function () {
    generate_ajax_users_table("calc(100vh - 240px)")
    generate_ajax_clubs_table("calc(100vh - 240px)")

    users_table.on('preInit.dt', function () {
        check_admin_button()
    });

    $('.change-management-table').on('shown.bs.tab', function () {
        users_table.columns.adjust();
        clubs_table.columns.adjust();
    })

    $('#toggle_btn').on('click', function () {
        setTimeout(function (){
            users_table.columns.adjust();
            clubs_table.columns.adjust();
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

    $('#edit-user-button').on('click', function () {
        if(!$('#edit-user-form').valid()) return
        let personal = $('#edit-user-form').serializeArray()
        let has_demo = false;
        let is_super = false;
        for (const data of personal) {
            if (data.name=='is_demo_mode'){
                has_demo = true;
            }
            if (data.name=='is_superuser'){
                is_super = true;
            }
        }
        if (!has_demo){
            personal.push({name:'is_demo_mode', value:'off'})
        }
        if (!is_super){
            personal.push({name:'is_superuser', value:'off'})
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
})