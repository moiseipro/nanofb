$(window).on("load", function () {
    $('.function-block').on("shown.bs.collapse hidden.bs.collapse", function (event) {
        check_admin_button()
    })

    $('.only-selected').on('click', function () {
        let table_block = '.tab-pane.show .table-block'
        let target = '.tab-pane.show '+$(this).attr('data-target');
        let col = 12
        $('.only-selected').removeClass('active')
        $('.function-block').collapse('hide')
        $(this).addClass('active')
        col -= parseInt($(target).attr('data-col'));
        $(table_block).removeClass('col-'+$(table_block).attr('curr-col'))
        $(table_block).attr('curr-col', col)
        $(table_block).addClass('col-'+col)
        try {
        users_table.columns.adjust();
        } catch {

        }
    })
})

function check_admin_button() {
    let is_selected = $('#users-table tr.selected').length>0
    $('.only-selected').not('.always-active').prop('disabled', !is_selected)
}