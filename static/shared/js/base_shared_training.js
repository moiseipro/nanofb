$(window).on('load', function () {
    $('.calculate-name input').each(function( index ) {
        let name_obj = $(this)
        let names = $.parseJSON(name_obj.attr('data-value').replace(/\'/g, '"'));
        name_obj.val(get_translation_name(names))
        console.log(get_translation_name(names))
    })
})