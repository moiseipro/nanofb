
var user_select_id;

$(window).on("load", function () {
    generate_ajax_users_table("calc(100vh - 310px)")

    if(!Cookies.get('user_selected_id')){
        $('#open-profile-modal').prop('disabled', true)
    }

    $('#open-profile-modal').on('click', function () {

        $('#user-management-block').removeClass('d-none').addClass('col-sm-7');
        $('#users-table-block').removeClass('col-sm-12').addClass('col-sm-5');

        users_table.columns( [2,3,6,7,8,9,10,11,12,13,14] ).visible( false );

    })

    $('#back-users-table').on('click', function () {

        $('#user-management-block').addClass('d-none').removeClass('col-sm-7');
        $('#users-table-block').removeClass('col-sm-5').addClass('col-sm-12');

        users_table.columns( [2,3,6,7,8,9,10,11,12,13,14] ).visible( true );

    })

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
        for (const data of personal) {
            if (data.name=='is_demo_mode'){
                has_demo = true;
            }
        }
        if (!has_demo){
            personal.push({name:'is_demo_mode', value:'off'})
        }
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_select_id, 'edit_user').then(function (data) {
            console.log(data)
        })
    })

    $('#users-table').on('click', '.archive-user', function () {
        let is_archive
        let user_id = $(this).attr('data-id')
        if ($(this).hasClass('active')){
            is_archive = 0
            $(this).removeClass('active')
        } else {
            is_archive = 1
            $(this).addClass('active')
        }
        let send_data = {'is_archive' : is_archive}
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_id, 'edit_user').then(function (data) {
            console.log(data)
        })
    })

    $('#generate-password-user-button').on('click', function () {
        let send_data = {}
        ajax_users_action('POST', send_data, 'new password', user_select_id, 'generate_new_password').then(function (data) {
            console.log(data)
        })
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
                $('#users-table-block #open-profile-modal').prop('disabled', false)
                user_select_id = cur_edit_data.id
                load_user_data(user_select_id)
            }
        })
        .on( 'deselect', function ( e, dt, type, indexes ) {
            let rowData = users_table.rows( indexes ).data().toArray();
            let cur_edit_data = rowData[0]
            // if(user_select_id == cur_edit_data.id){
            //     $('#users-table-block .open-profile-modal').prop('disabled', true)
            //     $('#back-users-table').click()
            //     user_select_id = null
            // }


        })

})

function load_user_data(id = -1) {
    if(id == -1) return false;
    let send_data = {}
    ajax_users_action('GET', send_data, 'user data', id, 'get_user_data').then(function (data) {
        //console.log(data)
        let user = data.data
        for (const idKey in user) {
            $('select[name="'+idKey+'"]').val(user[idKey])
            if (idKey == 'is_demo_mode'){
                $('input[name="'+idKey+'"]').prop('checked', user[idKey])
            } else {
                $('input[name="'+idKey+'"]').val(user[idKey])
            }
            if (idKey == 'personal'){
                for (const idKey2 in user.personal) {
                    //console.log(idKey2)
                    $('input[name="'+idKey2+'"]').val(user.personal[idKey2])
                }
            }
        }
    })
}