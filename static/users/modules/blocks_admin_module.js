$(window).on("load", function () {

    $('.only-selected').on('click', function (e) {
        let data_target = $(this).attr('data-target')
        Cookies.set('blocks_admin_modules', data_target, { expires: 1 })
        toggle_modules(data_target)
    })

})

function check_admin_button() {
    let is_selected = $('#users-table tr.selected').length>0 || $('#clubs-table tr.selected').length>0
    $('.only-selected').not('.always-active').prop('disabled', !is_selected)

    let data_target = Cookies.get('blocks_admin_modules')
    if(!is_select_user && (typeof is_select_club !== 'undefined' ? !is_select_club : true)){
        Cookies.remove('blocks_admin_modules')
    }

    if (!is_select_user && (typeof is_select_club !== 'undefined' ? !is_select_club : true)) toggle_modules(data_target)
}

function toggle_modules(data_target = '') {
    let table_block = '.tab-pane.show .table-block'
    let target = '.tab-pane.show '+data_target;
    let select_obj = $('.only-selected[data-target="'+data_target+'"]')
    let col = 12
    if(select_obj.hasClass('active')){
        select_obj.removeClass('active')
        $(target).collapse('hide')
    } else {
        $('.only-selected').removeClass('active')
        select_obj.addClass('active')
        let data_col = $(target).attr('data-col')
        if (data_col) {
            col -= parseInt($(target).attr('data-col'));
        }
        $('.function-block:not('+data_target+')').collapse('hide')
        $(target).collapse('show')
    }

    $(table_block).removeClass('col-'+$(table_block).attr('curr-col'))
    $(table_block).attr('curr-col', col)
    $(table_block).addClass('col-'+col)
    try {
        users_table.columns.adjust();
        clubs_table.columns.adjust();
    } catch {

    }
}