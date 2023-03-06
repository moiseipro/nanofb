
var user_select_id;

$(window).on("load", function () {
    generate_ajax_users_table("calc(100vh - 310px)")
    
    $('#users-table').on('click', '.open-profile-modal', function () {

        user_select_id = $(this).attr('data-id')
        console.log(user_select_id)

        $('#user-management-block').removeClass('d-none');
        $('#users-table-block').addClass('d-none');

        load_user_data(user_select_id)

    })

    $('#back-users-table').on('click', function () {

        $('#user-management-block').addClass('d-none');
        $('#users-table-block').removeClass('d-none');

    })

    $('#edit-profile-button').on('click', function () {
        if(!$('#edit-personal-form').valid()) return
        let personal = $('#edit-personal-form').serializeArray()
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_select_id, 'edit_personal').then(function (data) {
            console.log(data)
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
})

function load_user_data(id = -1) {
    if(id == -1) return false;
    let send_data = {}
    ajax_users_action('GET', send_data, 'user data', id, 'get_user_data').then(function (data) {
        console.log(data)
        let user = data.data
        for (const idKey in user) {
            $('select[name="'+idKey+'"]').val(user[idKey])
            $('input[name="'+idKey+'"]').val(user[idKey])
            if (idKey == 'personal'){
                for (const idKey2 in user.personal) {
                    console.log(idKey2)
                    $('input[name="'+idKey2+'"]').val(user.personal[idKey2])
                }
            }
        }
    })
}