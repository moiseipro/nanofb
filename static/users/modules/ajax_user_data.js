function load_user_data(id = -1) {
    if(id == -1) return false;
    let send_data = {}
    ajax_users_action('GET', send_data, 'user data', id, 'get_user_data').then(function (data) {
        console.log(data)
        let user = data.data
        for (const idKey in user) {
            $('#profile-user select[name="'+idKey+'"]').val(user[idKey])
            if (idKey == 'is_demo_mode'){
                $('#profile-user input[name="'+idKey+'"]').prop('checked', user[idKey])
            } else {
                $('#profile-user input[name="'+idKey+'"]').val(user[idKey])
            }
            if (idKey == 'personal'){
                for (const idKey2 in user.personal) {
                    //console.log(idKey2)
                    $('#profile-user select[name="'+idKey2+'"]').val(user.personal[idKey2])
                    $('#profile-user input[name="'+idKey2+'"]').val(user.personal[idKey2])
                }
            }
        }
    })
}