function load_user_data(id = -1) {
    if(id == -1) return false;
    let send_data = {}
    ajax_users_action('GET', send_data, 'user data', id, 'get_user_data').then(function (data) {
        console.log(data)
        let user = data.data
        for (const idKey in user) {
            $('.management-main-block select[name="'+idKey+'"]').val(user[idKey])
            if (idKey == 'is_demo_mode'){
                $('.management-main-block input[name="'+idKey+'"]').prop('checked', user[idKey])
            } else {
                $('.management-main-block input[name="'+idKey+'"]').val(user[idKey])
            }
            if (idKey == 'personal'){
                for (const idKey2 in user.personal) {
                    //console.log(idKey2)
                    $('.management-profile-block select[name="'+idKey2+'"]').val(user.personal[idKey2])
                    $('.management-profile-block input[name="'+idKey2+'"]').val(user.personal[idKey2])
                }
            }
        }
    })
}