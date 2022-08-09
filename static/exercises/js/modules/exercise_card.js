function RenderSplitExsCardCols() {
    $('#exerciseCard').find('div.gutter').remove();
    sizesArr = window.dataForSplitExsCardCols;
    window.splitExsCardCols = Split(['#splitCol_exscard_0', '#splitCol_exscard_1', '#splitCol_exscard_2'], {
        sizes: sizesArr,
        dragInterval: 1,
        gutterSize: 15,
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
    $('#exerciseCard').find('.exs_edit_field').removeClass('empty-field');
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

function LoadExerciseOne(exsID = null, fromNFB = 0) {
    let searchParams = new URLSearchParams(window.location.search);
    if (!exsID) {
        try {
            exsID = parseInt(searchParams.get('id'));
        } catch (e) {}
    }
    if (fromNFB == 0) {
        try {
            fromNFB = parseInt(searchParams.get('nfb'));
        } catch (e) {}
    }
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
            window.lastListUsed = "exercises";
        }
    });
}

function RenderExerciseOne(data) {
    function CheckMultiRows(exsCard, data, elem, cId) {
        let cloneRow = null;
        if (!Array.isArray(data)) {
            data = [''];
        }
        $(exsCard).find(`.wider_row.value_row[data-id="${cId}"]`).remove();
        for (let key in data) {
            let elem = data[key];
            if (cId == "additions1") {
                cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"]`).clone();
            } else {
                let cType = (elem.type == "INPUT" || elem.type == "TEXTAREA") ? "text" : elem.type == "SELECT" ? "list" : "";
                if (cId == "notes" && cType != "text") {cType = "";}
                cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
            }
            if ($(cloneRow).length > 0) {
                $(cloneRow).addClass('wider_row value_row');
                $(cloneRow).find('.form-control').addClass('exs_edit_field');
                $(cloneRow).find('.form-control').addClass('exs_team_param');
                $(cloneRow).find('.form-control').prop('disabled', true);
                $(cloneRow).find('.exs_edit_field').val(elem.value);
                $(cloneRow).find('.exs_edit_field').change();
                if (cId == "additional_data") {
                    $(cloneRow).find('[name="additional_data_select[]"]').val(elem.id);
                    $(cloneRow).find('[name="additional_data_select[]"]').change();
                }
                $(cloneRow).find('.remove-row').addClass('btn-on');
                $(cloneRow).find('.remove-row').prop('disabled', false);
                $(cloneRow).insertAfter($('#exerciseCard').find(`.wider_row[data-id="${cId}"]`).last());
            }
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

        $(exsCard).find('.exs_edit_field[name="ref_goal"]').val(data.ref_goal);
        $(exsCard).find('.exs_edit_field[name="ref_ball"]').val(data.ref_ball);
        $(exsCard).find('.exs_edit_field[name="ref_team_category"]').val(data.ref_team_category);
        $(exsCard).find('.exs_edit_field[name="ref_age_category"]').val(data.ref_age_category);
        $(exsCard).find('.exs_edit_field[name="ref_train_part"]').val(data.ref_train_part);
        $(exsCard).find('.exs_edit_field[name="ref_cognitive_load"]').val(data.ref_cognitive_load);

        CheckMultiRows(exsCard, data.additional_data, '.exs_edit_field[name="additional_data[]"]', 'additional_data');

        CheckMultiRows(exsCard, data.keyword, '.exs_edit_field[name="keyword[]"]', 'keyword');
        CheckMultiRows(exsCard, data.stress_type, '.exs_edit_field[name="stress_type[]"]', 'stress_type');
        CheckMultiRows(exsCard, data.purposes, '.exs_edit_field[name="purposes[]"]', 'purposes');
        CheckMultiRows(exsCard, data.coaching, '.exs_edit_field[name="coaching[]"]', 'coaching');
        CheckMultiRows(exsCard, data.notes, '.exs_edit_field[name="notes[]"]', 'notes');

        $(exsCard).find('.exs_edit_field[name="title"]').val(data.title);
        if (document.descriptionEditor2) {
            document.descriptionEditor2.setData(data.description);
        }
        if (document.descriptionEditorView) {
            document.descriptionEditorView.setData(data.description);
        }

        $('#carouselSchema').find('.carousel-item').first().html(data.scheme_data[0]);
        $('#carouselSchema').find('.carousel-item').last().html(data.scheme_data[1]);
        $('#card_drawing1').find('.card').last().html(data.scheme_data[0]);
        $('#card_drawing2').find('.card').last().html(data.scheme_data[1]);

        if (data.video_data[0]) {
            $('#carouselVideo').find('.carousel-item').first().removeClass('d-none');
            // $('#carouselVideo').find('.carousel-item').first().html(data.video_data[0]);
        } else {
            $('#carouselVideo').find('.carousel-item').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
            $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
        }
        if (data.video_data[1]) {
            $('#carouselVideo').find('.carousel-item').last().removeClass('d-none');
            // $('#carouselVideo').find('.carousel-item').last().html(data.video_data[1]);
        } else {
            $('#carouselVideo').find('.carousel-item').last().addClass('d-none');
            $('#carouselVideo').find('.carousel-indicators > li').last().addClass('d-none');
            $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
            $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
        }
        if (data.animation_data.default[0]) {
            $('#carouselAnim').find('.carousel-item').first().removeClass('d-none');
            // $('#carouselAnim').find('.carousel-item').first().html(data.animation_data.default[0]);
        } else {
            $('#carouselAnim').find('.carousel-item').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
            $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
        }
        if (data.animation_data.default[1]) {
            $('#carouselAnim').find('.carousel-item').last().removeClass('d-none');
            // $('#carouselAnim').find('.carousel-item').last().html(data.animation_data.default[1]);
        } else {
            $('#carouselAnim').find('.carousel-item').last().addClass('d-none');
            $('#carouselAnim').find('.carousel-indicators > li').last().addClass('d-none');
            $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
            $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
        }

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

        $(exsCard).find('.exs_edit_field.folder_nfb').toggleClass('d-none', true);
        $(exsCard).find('.exs_edit_field.folder_default').toggleClass('d-none', false);
        $(exsCard).find(`.folder_default[name="folder_parent"]`).val('');
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find(`.folder_default[name="folder_main"]`).val('');

        $(exsCard).find('.exs_edit_field').val('');
        if (document.descriptionEditor2) {
            document.descriptionEditor2.disableReadOnlyMode('');
            document.descriptionEditor2.setData('');
        }
        if (document.descriptionEditorView) {
            document.descriptionEditorView.disableReadOnlyMode('');
            document.descriptionEditorView.setData('');
        }
        
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="additional_data[]"]', 'additional_data');

        CheckMultiRows(exsCard, '', '.exs_edit_field[name="keyword[]"]', 'keyword');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="stress_type[]"]', 'stress_type');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="purposes[]"]', 'purposes');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="coaching[]"]', 'coaching');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="notes[]"]', 'notes');

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
    dataToSend.data['additional_data[]'] = [];
    dataToSend.data['keyword[]'] = [];
    dataToSend.data['stress_type[]'] = [];
    dataToSend.data['purposes[]'] = [];
    dataToSend.data['coaching[]'] = [];
    dataToSend.data['notes[]'] = [];
    $('#exerciseCard').find('.exs_edit_field.exs_team_param').each((ind, elem) => {
        let cName = $(elem).attr('name');
        let dataElem = {
            'type': $(elem).prop('tagName'),
            'value': $(elem).val()
        };
        if (cName == "additional_data[]") {
            dataElem['id'] = $(elem).parent().parent().find('[name="additional_data_select[]"]').val();
        }
        try {
            dataToSend.data[cName].push(dataElem);
        } catch(e) {}
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
    dataToSend.data['scheme_1'] = $('#card_drawing1').find('.card').html();
    dataToSend.data['scheme_2'] = $('#card_drawing2').find('.card').html();
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

function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight - 7)+"px";
    if (element.scrollHeight == 0) {
        let text = element.value;
        let linesCount = text.split("\n").length;
        element.style.height = (linesCount * 28)+"px";
    }
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
            $('.resizeable-block').css('height', `235px`);
        })
        .catch(err => {
            console.error(err);
        });


    window.dataForSplitExsCardCols = JSON.parse(localStorage.getItem('split_exs_card_cols'));
    if (!window.dataForSplitExsCardCols) {
        window.dataForSplitExsCardCols = [30, 30, 40];
        localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
    }
    RenderSplitExsCardCols();


    ToggleEditFields(false);


    $('#exerciseCard').on('click', '#openDescription', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_description').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_description').removeClass('d-none');

        $('.scheme-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openDrawing1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_drawing1').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_drawing1').removeClass('d-none');

        if ($('#editExs').attr('data-active') == '1') {
            $('#card_drawing1').addClass('d-none');
            $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing1').find('.card').html());
            $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            $('.scheme-editor').removeClass('d-none');
        }
    });
    $('#exerciseCard').on('click', '#openDrawing2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');;
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_drawing2').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_drawing2').removeClass('d-none');

        if ($('#editExs').attr('data-active') == '1') {
            $('#card_drawing2').addClass('d-none');
            $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing2').find('.card').html());
            $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            $('.scheme-editor').removeClass('d-none');
        }
    });
    $('#exerciseCard').on('click', '#openVideo1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_video1').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_video1').removeClass('d-none');

        $('.scheme-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openVideo2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_video2').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_video2').removeClass('d-none');

        $('.scheme-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openAnimation1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_animation1').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_animation1').removeClass('d-none');

        $('.scheme-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openAnimation2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_animation2').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_animation2').removeClass('d-none');

        $('.scheme-editor').addClass('d-none');
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
        if (cId == "additions1") {
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"]`).clone();
        } else {
            let cType = $('#exerciseCard').find('.selected[data-type="add"]').attr('data-id');
            if (cId == "notes" || cId == "additional_data") {cType = "text";}
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
        }
        $(cloneRow).addClass('wider_row value_row');
        $(cloneRow).find('.form-control').addClass('exs_edit_field');
        $(cloneRow).find('.form-control').addClass('exs_team_param');
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


    $('#exerciseCard').on('click', '.user-param', (e) => {
        let exsId = $('#exerciseCard').attr('data-exs');
        let cId = $(e.currentTarget).attr('data-id');
        let isOn = $(e.currentTarget).hasClass('u-prm-on');
        let fromNFB = 0;
        let searchParams = new URLSearchParams(window.location.search);
        if (fromNFB == 0) {
            try {
                fromNFB = parseInt(searchParams.get('nfb'));
            } catch (e) {}
        }
        let dataToSend = {'edit_exs_user_params': 1, 'exs': exsId, 'nfb': fromNFB, 'data': {'key': cId, 'value': isOn ? 0 : 1}};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (!res.success) {
                    swal("Ошибка", `При изменении параметра произошла ошибка (${res.err}).`, "error");
                } else {
                    if (cId == "like" || cId == "dislike") {
                        $('#exerciseCard').find('.user-param[data-id="like"]').toggleClass('u-prm-on', false);
                        $('#exerciseCard').find('.user-param[data-id="dislike"]').toggleClass('u-prm-on', false);
                    }
                    $(e.currentTarget).toggleClass('u-prm-on', !isOn);
                }
            },
            error: function (res) {
                swal("Ошибка", "При изменении параметра произошла ошибка.", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });

    $('#exerciseCard').on('change', '.exs_edit_field', (e) => {
        if (!$(e.currentTarget).prop('required')) {return;}
        let isEmpty = $(e.currentTarget).val() == '';
        $(e.currentTarget).toggleClass('empty-field', isEmpty);
    });


    $('#editExs').on('click', (e) => {
        let isActive = $(e.currentTarget).attr('data-active');
        $(e.currentTarget).attr('data-active', isActive == '1' ? 0 : 1);
        $(e.currentTarget).toggleClass('btn-secondary', isActive == '1');
        $(e.currentTarget).toggleClass('btn-warning', isActive != '1');
        $(e.currentTarget).attr('title', isActive == '1' ? "Редактировать" : "Отменить");
        $('#saveExs').toggleClass('btn-secondary', isActive == '1');
        $('#saveExs').prop('disabled', isActive == '1');
        $('#saveExs').toggleClass('btn-success', isActive != '1');
        $('.modal-header').toggleClass('d-none', isActive == '1');
        ToggleEditFields(isActive != '1');
        if (isActive == '1') {LoadExerciseOne();}

        if (isActive != '1') {
            if ($('#card_drawing1').hasClass('active')) {
                $('#card_drawing1').addClass('d-none');
                $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing1').find('.card').html());
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
                $('.scheme-editor').removeClass('d-none');
            }
            if ($('#card_drawing2').hasClass('active')) {
                $('#card_drawing2').addClass('d-none');
                $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing2').find('.card').html());
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
                $('.scheme-editor').removeClass('d-none');
            }
        } else {
            if ($('#card_drawing1').hasClass('active')) {
                $('#card_drawing1').removeClass('d-none');
                $('.scheme-editor').addClass('d-none');
            }
            if ($('#card_drawing2').hasClass('active')) {
                $('#card_drawing2').removeClass('d-none');
                $('.scheme-editor').addClass('d-none');
            }
        }
    });

    // scheme autosave
    $('#saveScheme').on('click', (e) => {
        let cloneSvgParent = $('.scheme-editor').find('iframe').contents().find('#svgparent').clone();
        $(cloneSvgParent).find('#block').css({'width' : '', 'height' : ''});
        $(cloneSvgParent).find('#selects').html('');
        $(cloneSvgParent).find('#dots').html('');
        let content = $(cloneSvgParent).html();
        if ($('#card_drawing1').hasClass('active')) {
            $('#card_drawing1').find('.card').html(content);
        }
        if ($('#card_drawing2').hasClass('active')) {
            $('#card_drawing2').find('.card').html(content);
        }
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
