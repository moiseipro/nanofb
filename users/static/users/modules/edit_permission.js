$(window).on('load', function (){

    $(document).on('click', '.check-permission', function () {
        console.log('click')
        let user_id = $('#permission-block').attr('data-user');
        let group_id = $(this).attr('value')
        let send_data = {group_id}
        ajax_users_action('POST', send_data, 'change permission', user_id, 'change_permission').then(function (data) {
            console.log(data)
        })
    })

})


function load_group_data(id = -1) {
    if(id == -1) return false;
    $('#permission-block').attr('data-user', id)
    let permission_panel = $('#permission-user .permission-panel')
    permission_panel.html('')
    let send_group = {}
    let send_users = {}
    ajax_group_action('GET', send_group, 'group data', id, 'get_available_group').then(function (data) {
        console.log(data)

        let available_group = data['objs']

        ajax_users_action('GET', send_users, 'user data', id, 'get_user_group').then(function (data) {
            console.log(data)

            let user_group = data['data']

            for (var available_value of available_group) {
                //console.log(user_value)
                let permission_row = ''
                let is_active = false

                for (var user_value of user_group) {
                    if (available_value.id == user_value.id) {
                        is_active = true
                        break
                    }
                }

                permission_row +=
                    `
                    <div class="row permission-row" data-id="${available_value.id}">
                        <div class="col-9 px-2 border text-nowrap">
                            <span class="float-left">${available_value.name}</span>
                        </div>
                        <div class="col-3 px-2 border text-center">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" name="group_value" value="${available_value.id}" class="custom-control-input check-permission" id="group_${available_value.id}" ${is_active? 'checked' : ''}>
                                <label class="custom-control-label" for="group_${available_value.id}"></label>
                            </div>
                        </div>
                    </div>
                    
                    `
                if (available_value.customgroup.section){
                    let section_row = $(`#permission-block .section-row[data-section="${available_value.customgroup.section.id}"]`)
                    if (section_row.length == 0){
                        permission_panel.append(
                            `
                            <div class="row section-row" data-section="${available_value.customgroup.section.id}">
                                <div class="col-12 bg-light text-dark font-weight-bold border">
                                    ${available_value.customgroup.section.name}
                                </div>
                                <div class="col-12 permission-col">
                                    ${permission_row}
                                </div>
                            </div>
                            `
                        )
                    } else {
                        section_row.find('.permission-col').append(permission_row)
                    }
                } else {
                    permission_panel.prepend(permission_row)
                }

            }

            for (var user_value of user_group) {
                let permission_row = $(`#permission-block .permission-row[data-id="${user_value.id}"]`)

                if (permission_row.length == 0){
                    permission_row =
                    `
                    <div class="row permission-row bg-warning" data-id="${user_value.id}">
                        <div class="col-9 px-2 border text-nowrap">
                            <span class="float-left">${user_value.name}</span>
                        </div>
                        <div class="col-3 px-2 border text-center">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" name="group_value" value="${user_value.id}" class="custom-control-input check-permission" id="group_${user_value.id}" checked>
                                <label class="custom-control-label" for="group_${user_value.id}"></label>
                            </div>
                        </div>
                    </div>
                    
                    `
                    permission_panel.prepend(permission_row)
                }
            }
        })
    })

}