
var user_select_id;

$(window).on("load", function () {
    generate_ajax_users_table("calc(100vh - 310px)")

    if(!Cookies.get('user_selected_id')){
        $('#users-table-block .open-profile-modal').prop('disabled', true)
    }

    $('#users-table-block').on('click', '.open-profile-modal', function () {

        $('#user-management-block').removeClass('d-none').addClass('col-sm-8');
        $('#users-table-block').removeClass('col-sm-12').addClass('col-sm-4');

        users_table.columns( [3,4,5,6,7,8,9,10,11] ).visible( false );

    })

    $('#back-users-table').on('click', function () {

        $('#user-management-block').removeClass('col-sm-8').addClass('d-none');
        $('#users-table-block').removeClass('col-sm-4').addClass('col-sm-12');

        users_table.columns( [3,4,5,6,7,8,9,10,11] ).visible( true );

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
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_select_id, 'edit_user').then(function (data) {
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
                $('#users-table-block .open-profile-modal').prop('disabled', false)
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
            $('input[name="'+idKey+'"]').val(user[idKey])
            if (idKey == 'personal'){
                for (const idKey2 in user.personal) {
                    //console.log(idKey2)
                    $('input[name="'+idKey2+'"]').val(user.personal[idKey2])
                }
            }
        }
    })
}