var reference_data = null;

$(window).on('load', function (){

    $('.reference-edit').on("click", function () {
        $('#form-reference-edit-modal').modal('show')
    })

    $('button#additional-exercise-data').on("click", function () {
        let send_data = {}
        $('#form-reference-edit-modal .modal-body').attr('id', $(this).attr('id'))
        $('#form-reference-edit-modal-label').text($(this).text())
        ajax_exercise_additional('GET', send_data).then(function (data) {
            load_reference_data(data)
        })
    })

    $('.add-reference-row').on('click', function () {
        let modal_body = $(this).closest('.modal-body')

        let send_data = {}
        send_data['short_name'] = $('#create-reference-data [name="short_name"]').val();
        let translation_names = {}
        translation_names[get_cur_lang()] = $('#create-reference-data [name="name"]').val()
        send_data['translation_names'] = JSON.stringify(translation_names)
        send_data['order'] = $('#reference_list .reference-row').length
        console.log(send_data)

        switch (modal_body.attr('id')) {
            case 'additional-exercise-data':
                ajax_exercise_additional('POST', send_data).then(function (data) {
                    ajax_exercise_additional('GET', send_data).then(function (data) {
                        load_reference_data(data)
                    })
                })
                break;
        }
    })
    // Удаление элемента справочника
    $('#reference_list').on('click', '.delete-reference-row', function () {
        let id = $(this).closest('.reference-row').attr('data-id')
        let send_data = {}
        ajax_exercise_additional('DELETE', send_data, 'delete', id).then(function (data) {
            $('#reference_list .reference-row[data-id="'+id+'"]').remove()
        })
    })
    // Включит редактирование строки
    $('#reference_list').on('click', '.edit-reference-row', function () {
        let obj = $(this).closest('.reference-row')

        obj.find('input').prop('disabled', false)
        obj.find('.edit-button').toggleClass('d-none', false)
        obj.find('.view-button').toggleClass('d-none', true)

    })
    // Отмена редактирования строки
    $('#reference_list').on('click', '.cancel-reference-row', function () {
        let obj = $(this).closest('.reference-row')
        let order = obj.attr('data-order')

        obj.find('[name="short_name"]').val(reference_data[order].short_name)
        obj.find('[name="name"]').val(get_translation_name(reference_data[order].translation_names))

        obj.find('input').prop('disabled', true)
        obj.find('.edit-button').toggleClass('d-none', true)
        obj.find('.view-button').toggleClass('d-none', false)

    })
    // Сохранение элемента справочника
    $('#reference_list').on('click', '.save-reference-row', function () {
        let obj = $(this).closest('.reference-row')
        let id = obj.attr('data-id')
        let order = obj.attr('data-order')
        let send_data = reference_data[order]
        send_data['short_name'] = obj.find('[name="short_name"]').val()
        send_data['translation_names'][get_cur_lang()] = obj.find('[name="name"]').val()
        send_data['translation_names'] = JSON.stringify(send_data['translation_names'])
        console.log(send_data)
        ajax_exercise_additional('PUT', send_data, 'update', id).then(function (data) {
            console.log(data)
            reference_data[order] = data
            obj.find('.cancel-reference-row').click()
        })
    })
    // Перемещение элемента справочника вверх
    // $('#reference_list').on('click', '.up-reference-row', function () {
    //     let obj = $(this).closest('.reference-row')
    //     let id = obj.attr('data-id')
    //     let order = obj.attr('data-order')
    //     let send_data = reference_data[order]
    //     send_data['order'] = order-1;
    //     console.log(send_data)
    //     ajax_exercise_additional('PUT', send_data, 'update', id).then(function (data) {
    //
    //     })
    // })

})

function load_reference_data(data) {
    console.log(data)
    reference_data = data;
    let html = ''
    let count = reference_data.length
    $.each(reference_data, function(index, ref) {
        html+= `
        <div class="row reference-row" data-id="${ref.id}" data-order="${ref.order}">
            <div class="col-4 px-1">
                <input type="text" name="short_name" class="form-control form-control-sm" value="${ref.short_name}" placeholder="${gettext("Short name")}" disabled>
            </div>
            <div class="col-4 px-1">
                <input type="text" name="name" class="form-control form-control-sm" value="${ get_translation_name(ref.translation_names) }" placeholder="${gettext("Title")}" disabled>
            </div>
            <div class="col-2 px-1">
                <button type="button" class="btn btn-sm btn-block btn-warning view-button edit-reference-row"><i class="fa fa-pencil" aria-hidden="true"></i></button>
                <button type="button" class="btn btn-sm btn-block btn-success edit-button save-reference-row mt-0 d-none"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
            </div>
            <div class="col-2 px-1">
                <button type="button" class="btn btn-sm btn-block btn-danger view-button delete-reference-row"><i class="fa fa-trash" aria-hidden="true"></i></button>
                <button type="button" class="btn btn-sm btn-block btn-warning edit-button cancel-reference-row mt-0 d-none"><i class="fa fa-ban" aria-hidden="true"></i></button>
            </div>
            
        </div>
        `
        //     <div class="col-1 px-1">
        //         <button type="button" class="btn btn-sm btn-block btn-primary up-reference-row" ${index==0?'disabled':''}><i class="fa fa-arrow-up" aria-hidden="true"></i></button>
        //     </div>
        //     <div class="col-1 px-1">
        //         <button type="button" class="btn btn-sm btn-block btn-primary down-reference-row" ${index==count-1?'disabled':''}><i class="fa fa-arrow-down" aria-hidden="true"></i></button>
        //     </div>
    })


    $('#reference_list').html(html)
}