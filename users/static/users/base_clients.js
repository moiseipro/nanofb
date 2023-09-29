var user_select_id;
var users_menu_state = null

$(window).on("load", function () {
    generate_ajax_users_table("calc(100vh - 240px)")
    generate_ajax_clubs_table("calc(100vh - 240px)")

    check_admin_button()

    $('.datetimepickerfilter').datetimepicker({
        format: 'DD/MM/YYYY',
        useCurrent: false,
        buttons: {
            showClear: true,
        },
        locale: get_cur_lang(),
        icons: {
            up: "fa fa-angle-up",
            down: "fa fa-angle-down",
            next: 'fa fa-angle-right',
            previous: 'fa fa-angle-left'
        }
    });

    $('#country-filter').select2({
        minimumResultsForSearch: -1,
        placeholder: gettext("Country"),
        language: get_cur_lang(),
        theme: 'bootstrap4',
        width: '100%',
        ajax: {
            url: '/user/countries_list',
            dataType: 'json',
            data: function (params) {
                // var query = {
                //     search: params.term,
                //     page: params.page || 1
                // }
                //
                // // Query parameters will be ?search=[term]&page=[page]
                //return query;
            },
            processResults: function (data, params) {
                // parse the results into the format expected by Select2
                // since we are using custom formatting functions we do not need to
                // alter the remote JSON data, except to indicate that infinite
                // scrolling can be used
                console.log(data)

                return {
                    results: data,
                    pagination: {
                      more: false
                    }
                };
            },
            cache: true
        },
        templateResult: function (state) {
            console.log(state)
            var $state = $(`
                <div class="w-100"><img src="${state.flag}" class="img-flag" /> ${state.text} <span class="float-right">${state.count ? '('+state.count+')':''}</span></div>
                
            `);
            return $state;
        }
    })

    $('#version-filter').select2({
        minimumResultsForSearch: -1,
        multiple: true,
        placeholder: gettext("Version"),
        language: get_cur_lang(),
        theme: 'bootstrap4',
        width: '100%',
        ajax: {
            url: '/user/versions_list',
            dataType: 'json',
            data: function (params) {

            },
            processResults: function (data, params) {
                console.log(data)
                return {
                    results: data,
                    pagination: {
                      more: false
                    }
                };
            },
            cache: true
        },
        templateResult: function (state) {
            console.log(state)
            var $state = $(`
                <div class="w-100"> ${state.text} <span class="float-right">${state.count ? '('+state.count+')':''}</span></div>
                
            `);
            return $state;
        }
    })

    $('#club-filter').select2({
        minimumResultsForSearch: -1,
        multiple: true,
        placeholder: gettext("Club"),
        language: get_cur_lang(),
        theme: 'bootstrap4',
        width: '100%',
        ajax: {
            url: '/user/clubs_list',
            dataType: 'json',
            data: function (params) {

            },
            processResults: function (data, params) {
                console.log(data)
                return {
                    results: data,
                    pagination: {
                      more: false
                    }
                };
            },
            cache: true
        },
        templateResult: function (state) {
            console.log(state)
            var $state = $(`
                <div class="w-100"> ${state.text} <span class="float-right">${state.count ? '('+state.count+')':''}</span></div>
                
            `);
            return $state;
        }
    })
    
    // $('.function-block').on("shown.bs.collapse hidden.bs.collapse", function (event) {
    //     check_admin_button()
    // })
    
    // $('#open-profile-modal').on('click', function () {
    //
    //     if (users_menu_state == 'table_settings'){
    //         $('#open-table-settings').click()
    //     } else if (users_menu_state == 'user_info'){
    //         $('#back-users-table').click()
    //         return false
    //     }
    //
    //
    //     users_menu_state = 'user_info'
    //
    //     $('#user-management-block').removeClass('d-none').addClass('col-sm-7');
    //     $('#users-table-block').removeClass('col-sm-12').addClass('col-sm-5');
    //
    //     users_table.columns( '.main-info-col' ).visible( true );
    //     users_table.columns( '.side-info-col' ).visible( false );
    //     users_table.columns( '.additional-info-col' ).visible( false );
    //
    //     $('.toggle-user-column').prop('checked', false)
    //
    // })
    //
    // $('#open-table-settings').on('click', function () {
    //
    //     if (users_menu_state == 'user_info')
    //         $('#back-users-table').click()
    //
    //     if (users_menu_state == 'table_settings'){
    //         users_menu_state = null
    //         $(this).children('i').removeClass('fa-indent').addClass('fa-outdent')
    //         $('#user-table-settings-block').addClass('d-none').removeClass('col-sm-2');
    //         $('#users-table-block').removeClass('col-sm-10').addClass('col-sm-12');
    //         users_table.columns.adjust().draw( false );
    //         return false;
    //     }
    //
    //     users_menu_state = 'table_settings'
    //
    //     $(this).children('i').removeClass('fa-outdent').addClass('fa-indent')
    //     $('#user-table-settings-block').removeClass('d-none').addClass('col-sm-2');
    //     $('#users-table-block').removeClass('col-sm-12').addClass('col-sm-10');
    //
    // })

    //$('#open-table-settings').click()

    // $('#back-users-table').on('click', function () {
    //
    //     users_menu_state = null
    //
    //     $('#user-management-block').addClass('d-none').removeClass('col-sm-7');
    //     $('#users-table-block').removeClass('col-sm-5').addClass('col-sm-12');
    //
    //     users_table.columns( '.main-info-col' ).visible( true );
    //     users_table.columns( '.side-info-col' ).visible( true );
    //
    // })

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
        let has_demo = false;
        for (const data of personal) {
            if (data.name=='is_demo_mode'){
                has_demo = true;
            }
        }
        if (!has_demo){
            personal.push({name:'is_demo_mode', value:'off'})
        }
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_select_id, 'edit_user').then(function (data) {
            console.log(data)
        })
    })

    $('#add-user-button').on('click', function () {
        if(!$('#add-user-form').valid()) return
        let personal = $('#add-user-form').serializeArray()
        // let has_demo = false;
        // for (const data of personal) {
        //     if (data.name=='is_demo_mode'){
        //         has_demo = true;
        //     }
        // }
        // if (!has_demo){
        //     personal.push({name:'is_demo_mode', value:'off'})
        // }
        let send_data = personal
        console.log(send_data);

        ajax_users_action('POST', send_data, 'create').then(function (data) {
            console.log(data)
        })
    })

    // Настройки показа колонок в таблице пользователей
    $('.toggle-user-column').on('change', function () {
        let checkbox = $(this);
        console.log(checkbox.is(':checked'))

        let col_data = checkbox.attr('data-col')
        users_table.columns( '.'+col_data ).visible( checkbox.is(':checked') );
        check_active_filters()
    })

    $('#users-table').on('click', '.archive-user', function () {
        let is_archive
        let user_id = $(this).attr('data-id')
        if ($(this).hasClass('active')){
            is_archive = 0
            $(this).removeClass('active text-danger')
        } else {
            is_archive = 1
            $(this).addClass('active text-danger')
        }
        let send_data = {'is_archive' : is_archive}
        console.log(send_data);

        ajax_users_action('POST', send_data, 'edit', user_id, 'edit_user').then(function (data) {
            console.log(data)
        })
    })

    $('#users-table').on('click', '.delete-user', function () {
        let user_id = $(this).attr('data-id')
        let send_data = {}
        console.log(send_data);
        swal({
            title: gettext("Delete user?"),
            text: gettext("After deletion, all workouts, folders and exercises of the user will be cleaned."),
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                ajax_users_action('DELETE', send_data, 'delete', user_id).then(function (data) {
                    users_table.ajax.reload()
                })
            } else {

            }
        });

    })

    $('#generate-password-user-button').on('click', function () {
        let send_data = {}
        swal({
            title: gettext("Are you sure you want to generate a new password?"),
            text: "The new password will be sent by email!",
            icon: "warning",
            buttons: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                ajax_users_action('POST', send_data, 'new password', user_select_id, 'generate_new_password').then(function (data) {
                    console.log(data)
                })
            }
        });

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
                user_select_id = cur_edit_data.id
                load_user_data(user_select_id)
                load_group_data(user_select_id)
                load_team_data(user_select_id)
                check_admin_button()
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

    //Загрузка сохраненных фильтров
    $('#users-table').on('preInit.dt', function () {
        $('.user-table-filter').each(function() {
            let filter = $(this).attr('data-filter')
            let value = Cookies.get(filter)
            console.log(filter + ':' + value)
            if(value) {
                if ($(this).attr('type')=="checkbox") $(this).prop('checked', true).change()
                else if($(this).hasClass('datetimepickerfilter')) $(this).datetimepicker('date', moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY'))
                else $(this).val(value).trigger('change')
            }
        });
    });


    // Фильтрация таблицы пользователей
    $('.user-table-filter').on('change, change.datetimepicker', function (e) {
        let value = $(this).val()
        if ($(this).hasClass('datetimepickerfilter') && value != ''){
            value = moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD')
            console.log(value)
        }
        if ($(this).hasClass('form-check-input')){
            if (!$(this).is(":checked")){
                value = ''
            }

            console.log(value)
        }
        console.log(value)
        let filter = $(this).attr('data-filter')
        let filter_obj = `.${filter}`;
        Cookies.set(filter, value);
        console.log(filter_obj)
        if(value == 'all' || value == null){
            users_table.columns(filter_obj).search( '' ).draw();
        } else{
            users_table.columns(filter_obj).search( value ).draw();
        }
        check_active_filters()
    })

    // Сброс фильтров
    $('#clear-user-filters').on('click', function () {
        clear_filters()
    })

    $('#add-club-form').submit(function (event) {
        let form_Data = new FormData(this)
        console.log(form_Data)

        ajax_club_action('POST', form_Data, 'club').then(function (data) {
            console.log(data)
        })
        event.preventDefault();
    })
})

function check_active_filters() {
    let is_filled = false
    $('.user-table-filter').each(function() {
        let value = $(this).not('[type="checkbox"]').val()
        if (value != '' && value != null && value != undefined && value != "all" || $(this).is(':checked')) is_filled = true
        console.log($(this).not('[type="checkbox"]').val())
    })
    $('.toggle-user-column').each(function() {
        if ($(this).is(':checked')) is_filled = true
    })

    console.log(is_filled)
    is_filled ? $('.only-selected[data-target=".table-settings-block"]').addClass('border-danger') : $('.only-selected[data-target=".table-settings-block"]').removeClass('border-danger')
}

function clear_filters() {
    $('.user-table-filter').each(function() {
        let filter = $(this).attr('data-filter')
        Cookies.remove(filter)
        if($(this).attr('type')=="checkbox") $(this).prop('checked', false)
        else if($(this).hasClass('datetimepickerfilter')) $(this).datetimepicker('date', '')
        else $(this).val('').trigger('change')
        users_table.ajax.reload()
    });
    check_active_filters()
}