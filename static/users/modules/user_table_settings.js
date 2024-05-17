$(window).on("load", function () {
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

    $('#group-filter').select2({
        minimumResultsForSearch: -1,
        multiple: true,
        placeholder: gettext("Group"),
        language: get_cur_lang(),
        theme: 'bootstrap4',
        width: '100%',
        ajax: {
            url: '/user/group_list',
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
                <div class="" title="${state.text}"> ${state.text} <span class="float-right">${state.count ? '('+state.count+')':''}</span></div>
                
            `);
            return $state;
        },
        templateSelection: function (state) {
            console.log(state)
            var $state = $(`
                <div class="text-truncate" title="${state.text}"> ${state.text}</div>
                
            `);
            return $state;
        },
    })

    // Настройки показа колонок в таблице пользователей
    $('.toggle-user-column').on('change', function () {
        let checkbox = $(this);
        console.log(checkbox.is(':checked'))

        let col_data = checkbox.attr('data-col')
        users_table.columns( '.'+col_data ).visible( checkbox.is(':checked') );
        check_active_filters()
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