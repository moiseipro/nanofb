function load_user_data(id = -1) {
    if(id == -1) return false;
    let send_data = {}
    ajax_users_action('GET', send_data, 'user data', id, 'get_user_data').then(function (data) {
        console.log(data)
        let user = data.data
        for (const idKey in user) {
            if (idKey == 'group'){
                var newOption = new Option(user[idKey] ? user[idKey] : '', user[idKey] ? user[idKey] : '', false, true);
                $('#users-table-tab .management-main-block select[name="'+idKey+'"]').append(newOption).trigger('change');
            } else {
                $('#users-table-tab .management-main-block select[name="'+idKey+'"]').val(user[idKey])
            }

            if (idKey == 'is_demo_mode' || idKey == 'is_superuser'){
                $('#users-table-tab .management-main-block input[name="'+idKey+'"]').prop('checked', user[idKey])
            } else {
                $('#users-table-tab .management-main-block input[name="'+idKey+'"]').val(user[idKey])
            }
            if (idKey == 'personal'){
                for (const idKey2 in user.personal) {
                    //console.log(idKey2)
                    $('#users-table-tab .management-profile-block select[name="'+idKey2+'"]').val(user.personal[idKey2])
                    $('#users-table-tab .management-profile-block input[name="'+idKey2+'"]').val(user.personal[idKey2])
                }
            }
        }
    })
}