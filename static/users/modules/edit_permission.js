function load_group_data(id = -1) {
    if(id == -1) return false;
    let send_group = {}
    let send_users = {}
    ajax_group_action('GET', send_group, 'group data', id, 'get_available_group').then(function (data) {
        console.log(data)

        let available_group = data['objs']

        let permission_panel = $('#permission-user .permission-panel')

        

        ajax_users_action('GET', send_users, 'user data', id, 'get_user_group').then(function (data) {
            console.log(data)

            let user_group = data['data']

            //permission_panel.html('')

            let section_row = ''
            let permission_col = ''

            for (var user_value of user_group) {
                console.log(user_value)

                let is_available = false
                for (var available_value of available_group) {
                    console.log(available_value)

                    if (available_value.id == user_value.id){
                        is_available = true
                    }

                }

                permission_col +=
                    `
                    <div class="row permission-row">
                        <div class="col-9 px-2 border text-nowrap">
                            <span class="float-left">События</span>
                        </div>
                        <div class="col-3 px-2 border text-center">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="events_view">
                                <label class="custom-control-label" for="events_view"></label>
                            </div>
                        </div>
                    </div>
                    
                    `

                section_row +=
                    `
                    <div class="row section-row">
                        <div class="col-12 bg-light text-dark border">
                            События
                        </div>
                        <div class="col-12 permission-col">
                            ${permission_col}
                        </div>
                    </div>
                    `

            }

            permission_panel.html(section_row)



        })
    })

}