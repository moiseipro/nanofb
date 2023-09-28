$(window).on("load", function () {
    $('.function-block').on("shown.bs.collapse hidden.bs.collapse", function (event) {
        check_admin_button()
    })
})

function check_admin_button() {
    let is_selected = $('#users-table tr.selected').length>0
    console.log(is_selected)
    let table_block = '.tab-pane.show .table-block'
    let count = $('.function-block.show').length
    let col = 12
    $('.only-selected').each(function() {
        let target = '.tab-pane.show '+$(this).attr('data-target');

        if(!$(target).hasClass("show")) $(this).removeClass('active').prop('disabled', !is_selected || count>1)
        else {
            col -= parseInt($(target).attr('data-col'));
            $(this).addClass('active').prop('disabled', !is_selected)
        }
    })
    $(table_block).removeClass('col-'+$(table_block).attr('curr-col'))
    $(table_block).attr('curr-col', col)
    $(table_block).addClass('col-'+col)
    try {
        users_table.columns.adjust();
    } catch {

    }
}