function load_group_data(id = -1) {
    if(id == -1) return false;
    let send_group = {}
    let send_users = {}
    ajax_group_action('GET', send_group, 'group data', id, 'get_available_group').then(function (data) {
        console.log(data)

        let permission_panel = $('#permission-user .permission-panel')


        ajax_users_action('GET', send_users, 'user data', id, 'get_user_group').then(function (data) {
            console.log(data)
        })
    })

}