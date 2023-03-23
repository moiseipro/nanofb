
$(window).on('load', function () {

})

$('#training-exercise-additional-modal').on('show.bs.modal', function () {
    ajax_exercise_additional('GET').then(function (data_additional) {
        let options = data_additional;
        console.log(options)
        let option_html = ''
        $.each( options, function( key, option ) {
            option_html+=`
                <div class="col-12 additional-row border">
                     <input class="edit-input" name="additional_id" type="checkbox" value="${ option.id }" id="additional-${ option.id }" ${!edit_mode ? 'disabled' : ''}>
                     <label class="form-check-label" for="additional-${ option.id }">
                        ${ get_translation_name(option.translation_names) }
                     </label>
                </div>
            `
        })
        $('.exercise-additional-list').html(option_html)
    })
})