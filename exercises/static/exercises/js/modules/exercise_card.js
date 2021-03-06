function RenderSplitExsCardCols() {
    $('#exerciseCard').find('div.gutter').remove();
    sizesArr = window.dataForSplitExsCardCols;
    window.splitExsCardCols = Split(['#splitCol_exscard_0', '#splitCol_exscard_1'], {
        sizes: sizesArr,
        dragInterval: 1,
        gutterSize: 20,
        onDrag: () => {
            let sizes = window.splitExsCardCols.getSizes();
            try {
            } catch(e) {}
        },
        onDragEnd: (arr) => {
            window.dataForSplitExsCardCols = arr;
            localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
        }
    });
    $('#exerciseCard').find('div.gutter').toggleClass('d-none', true);
}

function ToggleEditFields(flag) {
    $('#exerciseCard').find('.exs_edit_field').prop('disabled', !flag);
    $('#exerciseCard').find('.add-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').parent().toggleClass('d-none', !flag);
    try {
        if (flag) {
            document.descriptionEditor2.disableReadOnlyMode('');
            $(document).find('.ck-editor__top').removeClass('d-none');
        } else {
            document.descriptionEditor2.enableReadOnlyMode('');
            $(document).find('.ck-editor__top').addClass('d-none');
        }
    } catch (e) {}
    window.onlyViewMode = !flag;
}

function LoadExerciseOne() {
    let searchParams = new URLSearchParams(window.location.search);
    let exsID = null;
    let fromNFB = 0;
    try {
        exsID = parseInt(searchParams.get('id'));
        fromNFB = parseInt(searchParams.get('nfb'));
    } catch (e) {}
    if (!exsID) {return;}
    let data = {'get_exs_one': 1, 'exs': exsID, 'get_nfb': fromNFB};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                RenderExerciseOne(res.data);
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderExerciseOne(data) {
    function CheckMultiRows(exsCard, data, elem, isSelect = false) {
        let parentElem = $(exsCard).find(elem).first().parent().parent().parent();
        let cloneElem = $(exsCard).find(elem).first().parent().parent().clone();
        if (!Array.isArray(data)) {
            data = [''];
        }
        $(exsCard).find(elem).parent().parent().remove();
        for (let key in data) {
            let elem = data[key];
            let tmpClone = $(cloneElem).clone();
            $(tmpClone).find('.exs_edit_field').val(elem);
            $(tmpClone).find('.remove-row').toggleClass('btn-on', key != 0);
            $(tmpClone).find('.remove-row').prop('disabled', key == 0);
            $(parentElem).append(tmpClone);
        }
    }
    function TryToSetValue(card, elem, value, isValueStrList = false) {
        if (isValueStrList) {
            let tList = Array.isArray(value) ? value : [];
            for (let i = 0; i < tList.length; i++) {
                try {
                    $(card).find(`${elem}`).eq(i).val(tList[i]);
                } catch(e) {}
            }
        } else {
            try {
                $(card).find(elem).val(value);
            } catch(e) {}
        }
    }

    let exsCard = $('#exerciseCard');
    if (data && data.id) {
        let folderType = data.nfb ? "folder_nfb" : "folder_default";

        $(exsCard).attr('data-exs', data.id);

        $(exsCard).find('.exs_edit_field.folder_nfb').toggleClass('d-none', !data.nfb);
        $(exsCard).find('.exs_edit_field.folder_default').toggleClass('d-none', data.nfb);
        $(exsCard).find(`.${folderType}[name="folder_parent"]`).val(data.folder_parent_id);
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find('[name="folder_main"]').find(`option[data-parent=${data.folder_parent_id}]`).removeClass('d-none');
        $(exsCard).find(`.${folderType}[name="folder_main"]`).val(data.folder_id);

        $(exsCard).find('.exs_edit_field[name="ref_ball"]').val(data.ref_ball);
        $(exsCard).find('.exs_edit_field[name="ref_goal"]').val(data.ref_goal);
        $(exsCard).find('.exs_edit_field[name="ref_cognitive_load"]').val(data.ref_cognitive_load);
        TryToSetValue(exsCard, '.exs_edit_field[name="keyword[]"]', data.keyword, true);
        TryToSetValue(exsCard, '.exs_edit_field[name="players_ages[]"]', data.players_ages, true);
        TryToSetValue(exsCard, '.exs_edit_field[name="players_amount[]"]', data.players_amount, true);
        $(exsCard).find('.exs_edit_field[name="ref_age_category"]').val(data.ref_age_category);

        CheckMultiRows(exsCard, data.condition, '.exs_edit_field[name="conditions[]"]');
        CheckMultiRows(exsCard, data.stress_type, '.exs_edit_field[name="stress_type[]"]');
        CheckMultiRows(exsCard, data.purpose, '.exs_edit_field[name="purposes[]"]');
        CheckMultiRows(exsCard, data.coaching, '.exs_edit_field[name="coaching[]"]');
        CheckMultiRows(exsCard, data.notes, '.exs_edit_field[name="notes[]"]');

        $(exsCard).find('.exs_edit_field[name="title"]').val(data.title);
        document.descriptionEditor2.setData(data.description);
    } else {
        $(exsCard).attr('data-exs', '-1');

        $(exsCard).find('.btn-only-edit').prop('disabled', true);
        $(exsCard).find('.btn-not-view').toggleClass('d-none', false);
        $(exsCard).find('.exs_edit_field').prop('disabled', false);
        $(exsCard).find('.add-row').prop('disabled', false);
        $(exsCard).find('.remove-row').prop('disabled', true);
        $(exsCard).find('.remove-row.btn-on').prop('disabled', false);
        $(exsCard).find('.add-row').toggleClass('d-none', false);
        $(exsCard).find('.remove-row').toggleClass('d-none', false);
        document.descriptionEditor2.disableReadOnlyMode('');

        $(exsCard).find('.exs_edit_field.folder_nfb').toggleClass('d-none', true);
        $(exsCard).find('.exs_edit_field.folder_default').toggleClass('d-none', false);
        $(exsCard).find(`.folder_default[name="folder_parent"]`).val('');
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find(`.folder_default[name="folder_main"]`).val('');

        $(exsCard).find('.exs_edit_field').val('');
        document.descriptionEditor2.setData('');

        CheckMultiRows(exsCard, '', '.exs_edit_field[name="conditions[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="stress_type[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="purposes[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="coaching[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="notes[]"]');

        $('.exs-list-group').find('.list-group-item').removeClass('active');
        // clear video, animation and scheme
    }
}

function SaveExerciseOne() {
    let exsId = $('#exerciseCard').attr('data-exs');
    let dataToSend = {'edit_exs': 1, 'exs': exsId, 'data': {}};
    $('#exerciseCard').find('.exs_edit_field').each((ind, elem) => {
        if (!$(elem).hasClass('d-none')) {
            let name = $(elem).attr('name');
            if (name in dataToSend.data) {
                if (!Array.isArray(dataToSend.data[name])) {
                    let tVal = dataToSend.data[name];
                    dataToSend.data[name] = [tVal];
                }
                dataToSend.data[name].push($(elem).val());
            } else {
                dataToSend.data[name] = $(elem).val();
            }
        }
    });
    dataToSend.data['description'] = document.descriptionEditor2.getData();
    if (dataToSend.data.title == "") {
        swal("Внимание", "Добавьте название для упражнения.", "info");
        return;
    }
    if (dataToSend.data.folder_parent == "" || dataToSend.data.folder_main == "") {
        swal("Внимание", "Выберите папку для упражнения.", "info");
        return;
    }
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Упражнение успешно создано / изменено.", "success")
                .then((value) => {
                    $('.page-loader-wrapper').fadeIn();
                    let searchParams = new URLSearchParams(window.location.search);
                    let exsID = searchParams.get('id');
                    if (exsID == "new") {window.location.href = "/exercises";}
                    else {window.location.reload();}
                });
            } else {
                swal("Ошибка", `При создании / изменении упражнения произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Упражнение не удалось создать / изменить.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function DeleteExerciseOne() {
    swal({
        title: "Вы точно хотите удалить упражнение?",
        text: "После удаления данное упражнение невозможно будет восстановить!",
        icon: "warning",
        buttons: ["Отмена", "Подтвердить"],
        dangerMode: true,
    })
    .then((willDelete) => {
        if (willDelete) {
            let exsId = $('#exerciseCard').attr('data-exs');
            let data = {'delete_exs': 1, 'exs': exsId};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "exercises_api",
                success: function (res) {
                    if (res.success) {
                        swal("Готово", "Упражнение успешно удалено.", "success")
                        .then((value) => {
                            $('.page-loader-wrapper').fadeIn();
                            window.location.href = "/exercises";
                        });
                    }
                },
                error: function (res) {
                    swal("Ошибка", "Упражнение удалить не удалось.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                    $('#exerciseCopyModal').modal('hide');
                }
            });
        }
    });
}



$(function() {

    let cLang = $('#select-language').val();
    ClassicEditor
        .create(document.querySelector('#descriptionEditor2'), {
            language: cLang
        })
        .then(editor => {
            document.descriptionEditor2 = editor;
            if (window.onlyViewMode) {
                document.descriptionEditor2.enableReadOnlyMode('');
                $(document).find('.ck-editor__top').addClass('d-none');
            }
        })
        .catch(err => {
            console.error(err);
        });


    window.dataForSplitExsCardCols = JSON.parse(localStorage.getItem('split_exs_card_cols'));
    if (!window.dataForSplitExsCardCols) {
        window.dataForSplitExsCardCols = [40, 60];
        localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
    }
    RenderSplitExsCardCols();


    ToggleEditFields(false);


    $('#exerciseCard').on('click', '#openDescription', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_description').addClass('show active');
    });
    $('#exerciseCard').on('click', '#openDrawing', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_drawing').addClass('show active');
    });
    $('#exerciseCard').on('click', '#openVideo', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_video').addClass('show active');
    });
    $('#exerciseCard').on('click', '#openAnimation', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_animation').addClass('show active');
    });


    $('#exerciseCard').on('click', 'button[data-type="add"]', (e) => {
        $('#exerciseCard').find('button[data-type="add"]').removeClass('selected');
        $(e.currentTarget).addClass('selected');
    });


    $('#exerciseCard').on('click', '.graphics-block-toggle', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseCard').find('.graphics-block-toggle').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        $('#exerciseCard').find('.graphics-block').addClass('d-none');
        $('#exerciseCard').find(`.graphics-block[data-id=${cId}]`).removeClass('d-none');
    });


    $('#columnsSizeInCard2').on('click', (e) => {
        $('#exerciseCard').find('div.gutter').toggleClass('d-none');
    });


    $('#exerciseCard').on('click', '.add-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cloneRow = null;
        console.log(cId)
        if (cId == "additions1") {
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"]`).clone();
        } else {
            let cType = $('#exerciseCard').find('.selected[data-type="add"]').attr('data-id');
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
        }
        $(cloneRow).addClass('wider_row');
        $(cloneRow).find('.form-control').addClass('exs_edit_field');
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cloneRow).insertAfter($('#exerciseCard').find(`.wider_row[data-id="${cId}"]`).last());
    });
    $('#exerciseCard').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().parent().parent().remove();
    });


    $('#exerciseCard').on('change', '.folder_nfb[name="folder_parent"]', (e) => {
        let cId = $(e.currentTarget).val();
        $('#exerciseCard').find('.folder_nfb[name="folder_main"').val('');
        $('#exerciseCard').find('.folder_nfb[name="folder_main" > option').each((ind, elem) => {
            $(elem).toggleClass('d-none', !($(elem).attr('data-parent') == cId));
        });
    });
    $('#exerciseCard').on('change', '.folder_default[name="folder_parent"]', (e) => {
        let cId = $(e.currentTarget).val();
        $('#exerciseCard').find('.folder_default[name="folder_main"').val('');
        $('#exerciseCard').find('.folder_default[name="folder_main"] > option').each((ind, elem) => {
            $(elem).toggleClass('d-none', !($(elem).attr('data-parent') == cId));
        });
    });


    $('#editExs').on('click', (e) => {
        let isActive = $(e.currentTarget).attr('data-active');
        $(e.currentTarget).attr('data-active', isActive == '1' ? 0 : 1);
        $(e.currentTarget).toggleClass('btn-warning', isActive == '1');
        $(e.currentTarget).toggleClass('btn-danger', isActive != '1');
        $(e.currentTarget).text(isActive == '1' ? "Редактировать" : "Отменить");
        $('#saveExs').toggleClass('btn-secondary', isActive == '1');
        $('#saveExs').prop('disabled', isActive == '1');
        $('#saveExs').toggleClass('btn-success', isActive != '1');
        ToggleEditFields(isActive != '1');
        if (isActive == '1') {LoadExerciseOne();}
    });



    // Save and Load exercise
    LoadExerciseOne();
    $('#exerciseCard').on('click', '#saveExs', (e) => {
        SaveExerciseOne();
    });

    $('#exerciseCard').on('click', '#deleteExercise', (e) => {
        DeleteExerciseOne();
    });


});