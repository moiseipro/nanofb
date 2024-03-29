$(window).on('load', function (){

    $('#users-table-tab').on('click', '.check-permission', function () {
        console.log('click')
        let user_id = $('#users-table-tab #permission-block').attr('data-user');
        let group_id = $(this).attr('value')
        let send_data = {group_id}
        ajax_users_action('POST', send_data, 'change permission', user_id, 'change_permission').then(function (data) {
            console.log(data)
        })
    })

    $('#users-table-tab').on('click', '.check-team', function () {
        console.log('click')
        let user_id = $('#users-table-tab #permission-block').attr('data-user');
        let team_id = $(this).attr('value')
        let send_data = {user_id}
        ajax_team_action('POST', send_data, 'change permission', team_id, 'change_permission').then(function (data) {
            console.log(data)
        })
    })

})


function load_group_data(id = -1) {
    let permission_panel = $('#users-table-tab #permission-user .permission-panel')
    permission_panel.html('')
    if(id == -1) return false;
    $('#users-table-tab #permission-block').attr('data-user', id)
    let send_group = {}
    let send_users = {}
    ajax_group_action('GET', send_group, 'group data', id, 'get_available_group').then(function (data) {
        console.log(data)

        let available_group = data['objs']

        ajax_users_action('GET', send_users, 'user data', id, 'get_user_group').then(function (data) {
            console.log(data)

            let user_group = data['data']

            for (var available_value of available_group) {
                console.log(available_value)
                let permission_row = ''
                let is_active = false
                let can_check = false

                for (var user_value of user_group) {
                    if (available_value.id == user_value.id) {
                        is_active = true
                        break
                    }
                }

                if (available_value.permissions.length != 0){
                    can_check = true
                }

                if (available_value.customgroup.parent_group == -1){
                    let section_row = $(`#users-table-tab #permission-block .section-row[data-section="${available_value.id}"]`)
                    if (section_row.length == 0){
                        let check_html = ``
                        if(can_check){
                            check_html = `
                            <div class="col-3 px-0 border text-center">
                                <div class="form-check">
                                    <input type="checkbox" name="group_value" value="${available_value.id}" class="form-check-input position-static check-permission" id="group_${available_value.id}" ${is_active? 'checked' : ''}>
                                </div>
                            </div>
                            `
                        }
                        permission_panel.append(
                            `
                            <div class="row section-row" data-section="${available_value.id}">
                                <div class="col-12">
                                    <div class="row bg-light text-dark">
                                        <div class="${can_check ? 'col-9' : 'col-12'} pl-2 pr-0 font-weight-bold border text-nowrap text-truncate">
                                            <span class="float-left">${available_value.name}</span>
                                        </div>
                                        ${check_html}                                        
                                    </div>
                                </div>
                                <div class="col-12 permission-col">
                                    
                                </div>
                            </div>
                            `
                        )
                    }
                }

            }

            for (var available_value of available_group) {
                //console.log(user_value)
                let permission_row = ''
                let is_active = false
                let can_check = false

                for (var user_value of user_group) {
                    if (available_value.id == user_value.id) {
                        is_active = true
                        break
                    }
                }

                if (available_value.permissions.length != 0){
                    can_check = true
                }

                let check_html = ``
                if(can_check){
                    check_html = `
                    <div class="col-3 px-0 border text-center">
                        <div class="form-check">
                            <input type="checkbox" name="group_value" value="${available_value.id}" class="form-check-input position-static check-permission" id="group_${available_value.id}" ${is_active? 'checked' : ''}>
                        </div>
                    </div>
                    `
                }
                permission_row +=
                    `
                    <div class="row permission-row" data-id="${available_value.id}">
                        <div class="${can_check ? 'col-9' : 'col-12'} pl-2 pr-0 border text-nowrap text-truncate">
                            <span class="float-left">${available_value.name}</span>
                        </div>
                        ${check_html}
                    </div>
                    
                    `
                if (available_value.customgroup.parent_group != -1){
                    let section_row = $(`#users-table-tab #permission-block .section-row[data-section="${available_value.customgroup.parent_group}"]`)
                    if(section_row.length == 0){
                        permission_panel.prepend(permission_row)
                    } else {
                        section_row.find('.permission-col').append(permission_row)
                    }
                }

            }
        })
    })
}

function load_team_data(id= -1){
    let permission_team_panel = $('#users-table-tab #permission-team .permission-panel')
    permission_team_panel.html('')
    if(id == -1) return false;
    $('#users-table-tab #permission-block').attr('data-user', id)
    let send_data = {}

    ajax_team_action('GET', send_data, 'get team').then(function (data) {
        console.log(data)
        let teams = data


        for (var team of teams) {
            if(!('users' in team)) return false
            let permission_row = ''
            let is_active = team.users.includes(id)

            permission_row +=
                `
            <div class="row permission-row" data-id="${team.id}">
                <div class="col-9 px-2 border text-nowrap text-truncate">
                    <span class="float-left">${team.name}</span>
                </div>
                <div class="col-3 px-2 border text-center">
                    <div class="form-check">
                        <input type="checkbox" name="team_value" value="${team.id}" class="form-check-input position-static check-team" id="team-permission-${team.id}" ${is_active ? 'checked' : ''}>
                    </div>
                </div>
            </div>
            
            `
            permission_team_panel.prepend(permission_row)

        }

    })
}