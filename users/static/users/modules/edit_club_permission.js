$(window).on('load', function (){

    $('#clubs-table-tab').on('click', '.check-permission', function () {
        console.log('click')
        let user_id = $('#clubs-table-tab #permission-block').attr('data-club');
        let group_id = $(this).attr('value')
        let formData = new FormData();
        formData.append('group_id', group_id);

        ajax_club_action('POST', formData, 'change permission', user_id, 'change_permission').then(function (data) {
            console.log(data)
        })
    })

})


function load_club_group_data(id = -1) {
    let permission_panel = $('#clubs-table-tab #permission-user .permission-panel')
    permission_panel.html('')
    if(id == -1) return false;
    $('#clubs-table-tab #permission-block').attr('data-club', id)
    let send_group = {}
    let send_users = {}
    console.log("Load")
    ajax_group_action('GET', send_group, 'group data', id, 'get_club_available_group').then(function (data) {
        console.log(data)

        let available_group = data['objs']

        ajax_club_action('GET', send_users, 'user data', id, 'get_club_group').then(function (data) {
            console.log(data)

            let club_group = data['data']

            for (var available_value of available_group) {
                console.log(available_value)
                let permission_row = ''
                let is_active = false
                let can_check = false

                for (var club_value of club_group) {
                    if (available_value.id == club_value.id) {
                        is_active = true
                        break
                    }
                }

                if (available_value.permissions.length != 0){
                    can_check = true
                }

                if (available_value.customgroup.parent_group == -1){
                    let section_row = $(`#clubs-table-tab #permission-block .section-row[data-section="${available_value.id}"]`)
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

                for (var club_value of club_group) {
                    if (available_value.id == club_value.id) {
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
                    let section_row = $(`#clubs-table-tab #permission-block .section-row[data-section="${available_value.customgroup.parent_group}"]`)
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