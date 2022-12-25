function RenderSplitExsCardCols() {
    $('#exerciseCard').find('div.gutter').remove();
    sizesArr = window.dataForSplitExsCardCols;
    try {
        window.splitExsCardCols = Split(['#splitCol_exscard_0', '#splitCol_exscard_1', '#splitCol_exscard_2'], {
            sizes: sizesArr,
            dragInterval: 1,
            gutterSize: 15,
            onDrag: () => {
                let sizes = window.splitExsCardCols.getSizes();
                if (sizes.length != 3) {return;} 
                if (sizes[0] < 26) {
                    sizes[0] = 26;
                    sizes[1] = 37;
                    sizes[2] = 37;
                }
                if (sizes[1] < 36) {
                    sizes[0] = 32;
                    sizes[1] = 36;
                    sizes[2] = 32;
                }
                if (sizes[2] < 26) {
                    sizes[0] = 37;
                    sizes[1] = 37;
                    sizes[2] = 26;
                }
                try {
                    window.splitExsCardCols.setSizes(sizes);
                } catch(e) {}
            },
            onDragEnd: (arr) => {
                window.dataForSplitExsCardCols = arr;
                localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
            }
        });
        $('#exerciseCard').find('div.gutter').toggleClass('d-none', true);
    } catch(e) {}
}

function ToggleEditFields(flag) {
    $('#exerciseCard').find('.exs_edit_field').removeClass('empty-field');
    $('#exerciseCard').find('.exs_edit_field').prop('disabled', !flag);
    $('#exerciseCard').find('.add-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').parent().toggleClass('d-none', !flag);

    $('#exerciseCard').find('tr.additional-params-container.empty').toggleClass('d-none', !flag);
    try {
        if (flag) {
            document.descriptionEditor2.disableReadOnlyMode('');
            $(document).find('.ck-editor__top').removeClass('d-none');
            $(document).find('.ck-editor__main').removeClass('read-mode');
            $(document).find('.ck-editor__main').addClass('edit-mode');
        } else {
            document.descriptionEditor2.enableReadOnlyMode('');
            $(document).find('.ck-editor__top').addClass('d-none');
            $(document).find('.ck-editor__main').addClass('read-mode');
            $(document).find('.ck-editor__main').removeClass('edit-mode');
        }
    } catch (e) {}
    window.onlyViewMode = !flag;
}

function LoadExerciseOne(exsID = null, fromNFB = 0, folderType = "") {
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
    if (!folderType || folderType == "") {
        folderType = searchParams.get('type');
    }
    if (!exsID) {return;}
    let data = {'get_exs_one': 1, 'exs': exsID, 'get_nfb': fromNFB, 'f_type': folderType};
    $('.page-loader-wrapper').fadeIn();
    let tCall = $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
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
    try {
        PauseCountExsCalls(tCall);
    } catch(e) {}
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
                // if (cId == "notes" && cType != "text") {cType = "";}
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
        $(exsCard).attr('data-exs', data.id);

        $('.exercise-card-header').toggleClass('disabled', data.copied_from_nfb == true);

        ToggleFoldersType(data);

        $(exsCard).find('.exs_edit_field[name="ref_goal"]').val(data.ref_goal);
        $(exsCard).find('.exs_edit_field[name="ref_ball"]').val(data.ref_ball);
        $(exsCard).find('.exs_edit_field[name="ref_team_category"]').val(data.ref_team_category);
        $(exsCard).find('.exs_edit_field[name="ref_age_category"]').val(data.ref_age_category);
        $(exsCard).find('.exs_edit_field[name="ref_train_part"]').val(data.ref_train_part);
        $(exsCard).find('.exs_edit_field[name="ref_cognitive_load"]').val(data.ref_cognitive_load);
        $(exsCard).find('.exs_edit_field[name="ref_stress_type"]').val(data.ref_stress_type);
        $(exsCard).find('.exs_edit_field[name="field_players"]').val(data.field_players);
        $(exsCard).find('.exs_edit_field[name="field_goal"]').val(data.field_goal);
        $(exsCard).find('.exs_edit_field[name="field_age"]').val(data.field_age);
        $(exsCard).find('.exs_edit_field[name="field_task"]').val(data.field_task);

        $(exsCard).find('.exs_edit_field[name="scheme_1"]').val(data.scheme_1);
        $(exsCard).find('.exs_edit_field[name="scheme_2"]').val(data.scheme_2);

        $(exsCard).find('.exs_edit_field[name="tags"]').val(data.tags).trigger('change');
        window.changedData = false;

        // // CheckMultiRows(exsCard, data.additional_data, '.exs_edit_field[name="additional_data[]"]', 'additional_data');
        // CheckMultiRows(exsCard, data.keyword, '.exs_edit_field[name="keyword[]"]', 'keyword');
        // CheckMultiRows(exsCard, data.stress_type, '.exs_edit_field[name="stress_type[]"]', 'stress_type');
        // CheckMultiRows(exsCard, data.purposes, '.exs_edit_field[name="purposes[]"]', 'purposes');
        // // CheckMultiRows(exsCard, data.coaching, '.exs_edit_field[name="coaching[]"]', 'coaching');
        // CheckMultiRows(exsCard, data.notes, '.exs_edit_field[name="notes[]"]', 'notes');

        $(exsCard).find('tr.additional-params-container').remove();
        let htmlParamsStr = "";
        for (let i in data.additional_params) {
            let tmpParam = data.additional_params[i];
            htmlParamsStr += `
                <tr class="bck-custom border-y-custom additional-params-container ${!tmpParam.value || tmpParam.value == "" ? 'empty d-none' : ''}">
                    <td class="text-center align-middle">
                        ${tmpParam.title}
                    </td>
                    <td class="text-center h-100">
                        <input name="additional_params__${tmpParam.id}" class="form-control form-control-sm exs_edit_field text-center" type="text" 
                        value="${tmpParam.value ? tmpParam.value : ''}" placeholder="" autocomplete="off" disabled="" style="height: 100% !important;">
                    </td>
                </tr>
            `;
        }
        $(exsCard).find('tr.add-params-container-after').after(htmlParamsStr);

        CorrectBlockBorders();

        $(exsCard).find('.exs_edit_field[name="coaching[]"]').trigger('onkeyup');

        $(exsCard).find('.exs_edit_field[name="title"]').val(data.title);
        if (document.descriptionEditor2) {
            document.descriptionEditor2.setData(data.description);
        }
        if (document.descriptionEditorView) {
            document.descriptionEditorView.setData(data.description);
        }
        
        $('#carouselSchema').find('.carousel-item.new-scheme').remove();
        $('#carouselSchema').find('.carousel-indicators > li.new-scheme').remove();
        $('#carouselSchema').find('.carousel-item').first().html(data.scheme_data[0]);
        $('#carouselSchema').find('.carousel-item').last().html(data.scheme_data[1]);
        let carouselIndicatorNum = 2;
        if (data.scheme_2 && data.scheme_2 != "") {
            let link = `http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${data.scheme_2}`;
            $('#carouselSchema').find('.carousel-item').first().before(`
                <div class="carousel-item new-scheme">
                    <img src="${link}" alt="scheme" width="100%" height="100%"> 
                </div>
            `);
            $('#carouselSchema').find('.carousel-indicators > li').last().after(`
                <li class="new-scheme" data-target="#carouselSchema" data-slide-to="${carouselIndicatorNum}"></li>
            `);
            carouselIndicatorNum ++;
        }
        if (data.scheme_1 && data.scheme_1 != "") {
            let link = `http://62.113.105.179/api/canvas-draw/v1/canvas/render?id=${data.scheme_1}`;
            $('#carouselSchema').find('.carousel-item').first().before(`
                <div class="carousel-item new-scheme">
                    <img src="${link}" alt="scheme" width="100%" height="100%"> 
                </div>
            `);
            $('#carouselSchema').find('.carousel-indicators > li').last().after(`
                <li class="new-scheme" data-target="#carouselSchema" data-slide-to="${carouselIndicatorNum}"></li>
            `);
        }

        $('#card_drawing1').find('.card').last().html(data.scheme_data[0]);
        $('#card_drawing2').find('.card').last().html(data.scheme_data[1]);

        $('#carouselVideo').find('.carousel-item').removeClass('d-none');
        $('#carouselVideo').find('.carousel-indicators > li').removeClass('d-none');
        $('#carouselVideo').find('.carousel-control-prev').removeClass('d-none');
        $('#carouselVideo').find('.carousel-control-next').removeClass('d-none');
        $('#carouselAnim').find('.carousel-item').removeClass('d-none');
        $('#carouselAnim').find('.carousel-indicators > li').removeClass('d-none');
        $('#carouselAnim').find('.carousel-control-prev').removeClass('d-none');
        $('#carouselAnim').find('.carousel-control-next').removeClass('d-none');

        
        if (data.video_1 && data.video_1.id && data.video_1.id != -1) {
            $('#carouselVideo').find('.carousel-item').first().removeClass('d-none');
            $(exsCard).find('.video-value[name="video1"]').val(data.video_1.id);
            RenderVideo(data.video_1.id, $(exsCard).find('.video-value[name="video1"]'), window.videoPlayerCard1);
        } else {
            $('#carouselVideo').find('.carousel-item').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
            $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="video1"]').val('');
        }
        if (data.video_2 && data.video_2.id && data.video_2.id != -1) {
            $('#carouselVideo').find('.carousel-item').last().removeClass('d-none');
            $(exsCard).find('.video-value[name="video2"]').val(data.video_2.id);
            RenderVideo(data.video_2.id, $(exsCard).find('.video-value[name="video2"]'), window.videoPlayerCard2);
        } else {
            $('#carouselVideo').find('.carousel-item').last().addClass('d-none');
            $('#carouselVideo').find('.carousel-indicators > li').last().addClass('d-none');
            $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
            $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="video2"]').val('');
        }
        if (data.animation_1 && data.animation_1.id && data.animation_1.id != -1) {
            $('#carouselAnim').find('.carousel-item').first().removeClass('d-none');
            $(exsCard).find('.video-value[name="animation1"]').val(data.animation_1.id);
            RenderVideo(data.animation_1.id, $(exsCard).find('.video-value[name="animation1"]'), window.videoPlayerCard3);
        } else {
            $('#carouselAnim').find('.carousel-item').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
            $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="animation1"]').val('');
        }
        if (data.animation_2 && data.animation_2.id && data.animation_2.id != -1) {
            $('#carouselAnim').find('.carousel-item').last().removeClass('d-none');
            $(exsCard).find('.video-value[name="animation2"]').val(data.animation_2.id);
            RenderVideo(data.animation_2.id, $(exsCard).find('.video-value[name="animation2"]'), window.videoPlayerCard4);
        } else {
            $('#carouselAnim').find('.carousel-item').last().addClass('d-none');
            $('#carouselAnim').find('.carousel-indicators > li').last().addClass('d-none');
            $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
            $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="animation2"]').val('');
        }
        $('#carouselSchema').find('.carousel-item').removeClass('active');
        $('#carouselSchema').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselSchema').find('.carousel-indicators > li').removeClass('active');
        $('#carouselSchema').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-item').removeClass('active');
        $('#carouselVideo').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-indicators > li').removeClass('active');
        $('#carouselVideo').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-item').removeClass('active');
        $('#carouselAnim').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-indicators > li').removeClass('active');
        $('#carouselAnim').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        try {
            RenderCarouselAll();
        } catch(e) {}

    } else {
        $(exsCard).attr('data-exs', '-1');

        $('.exercise-card-header').toggleClass('disabled', false);

        $(exsCard).find('.btn-only-edit').prop('disabled', true);
        $(exsCard).find('.btn-not-view').toggleClass('d-none', false);
        $(exsCard).find('.exs_edit_field').prop('disabled', false);
        $(exsCard).find('.add-row').prop('disabled', false);
        $(exsCard).find('.remove-row').prop('disabled', true);
        $(exsCard).find('.remove-row.btn-on').prop('disabled', false);
        $(exsCard).find('.add-row').toggleClass('d-none', false);
        $(exsCard).find('.remove-row').toggleClass('d-none', false);

        ToggleFoldersType();

        $(exsCard).find('.exs_edit_field').val('');
        if (document.descriptionEditor2) {
            document.descriptionEditor2.disableReadOnlyMode('');
            document.descriptionEditor2.setData('');
        }
        if (document.descriptionEditorView) {
            document.descriptionEditorView.disableReadOnlyMode('');
            document.descriptionEditorView.setData('');
        }
        
        // CheckMultiRows(exsCard, '', '.exs_edit_field[name="additional_data[]"]', 'additional_data');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="keyword[]"]', 'keyword');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="stress_type[]"]', 'stress_type');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="purposes[]"]', 'purposes');
        // CheckMultiRows(exsCard, '', '.exs_edit_field[name="coaching[]"]', 'coaching');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="notes[]"]', 'notes');
        CorrectBlockBorders();

        $('#carouselVideo').find('.carousel-item').addClass('d-none');
        $('#carouselVideo').find('.carousel-indicators > li').addClass('d-none');
        $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
        $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
        $('#carouselAnim').find('.carousel-item').addClass('d-none');
        $('#carouselAnim').find('.carousel-indicators > li').addClass('d-none');
        $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
        $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
        $(exsCard).find('.video-value[name="video1"]').val('');
        $(exsCard).find('.video-value[name="video2"]').val('');
        $(exsCard).find('.video-value[name="animation1"]').val('');
        $(exsCard).find('.video-value[name="animation2"]').val('');
        $('#carouselSchema').find('.carousel-item.new-scheme').remove();
        $('#carouselSchema').find('.carousel-indicators > li.new-scheme').remove();
        $('#carouselSchema').find('.carousel-item').removeClass('active');
        $('#carouselSchema').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselSchema').find('.carousel-indicators > li').removeClass('active');
        $('#carouselSchema').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-item').removeClass('active');
        $('#carouselVideo').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselVideo').find('.carousel-indicators > li').removeClass('active');
        $('#carouselVideo').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-item').removeClass('active');
        $('#carouselAnim').find('.carousel-item:not(.d-none)').first().addClass('active');
        $('#carouselAnim').find('.carousel-indicators > li').removeClass('active');
        $('#carouselAnim').find('.carousel-indicators > li:not(.d-none)').first().addClass('active');
        try {
            RenderCarouselAll();
        } catch(e) {}

        $('.exs-list-group').find('.list-group-item').removeClass('active');
        // clear video, animation and scheme
    }
}

function SaveExerciseOne() {
    let searchParams = new URLSearchParams(window.location.search);
    let folderType = searchParams.get('type');
    let exsId = $('#exerciseCard').attr('data-exs');
    let dataToSend = {'edit_exs': 1, 'exs': exsId, type: folderType, 'data': {}};
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
    dataToSend.data['scheme_1_old'] = $('#card_drawing1').find('.card').html();
    dataToSend.data['scheme_2_old'] = $('#card_drawing2').find('.card').html();
    dataToSend.data['video_1'] = $('#card_video1').find('.video-value').val();
    dataToSend.data['video_2'] = $('#card_video2').find('.video-value').val();
    dataToSend.data['animation_1'] = $('#card_animation1').find('.video-value').val();
    dataToSend.data['animation_2'] = $('#card_animation2').find('.video-value').val();

    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
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
    let deleteSwal = swal({
        title: "Вы точно хотите удалить упражнение?",
        text: `После удаления данное упражнение невозможно будет восстановить!`,
        icon: "warning",
        buttons: ["Отмена", "Подтвердить"],
        dangerMode: true,
    });
    if ($('#splitCol_exscard_2').find('.delete-exs-radio').length > 0) {
        let htmlStr = `<br>${$('#splitCol_exscard_2').find('.delete-exs-radio').html()}<br>`;
        $(document).find('.swal-modal > .swal-text').prepend(htmlStr);
    }
    deleteSwal.then((willDelete) => {
        if (willDelete) {
            let searchParams = new URLSearchParams(window.location.search);
            let folderType = searchParams.get('type');
            let exsId = $('#exerciseCard').attr('data-exs');
            let deleteType = $(document).find('.swal-modal').find('input[name="delete_exs_type"]:checked').val();
            let data = {'delete_exs': 1, 'exs': exsId, 'type': folderType, 'delete_type': deleteType};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
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
                    let errText = "Упражнение удалить не удалось.";
                    if (res.responseJSON.in_training == true) {
                        errText += "\nТак как данное упражнение прикреплено к тренировке.";
                    }
                    swal("Ошибка", errText, "error");
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

function CorrectBlockBorders() {
    if ($('#card_description').find('tr.wider_row[data-id="additional_data"]').length == 1) {
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-bottom-custom');
    } else {
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').addClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').first().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').first().addClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="additional_data"]').last().addClass('border-top-custom');
    }

    if ($('#card_description').find('tr.wider_row[data-id="stress_type"]').length == 1) {
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().addClass('border-top-custom');
    } else {
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').addClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="stress_type"]').last().addClass('border-top-custom');
    }

    if ($('#card_description').find('tr.wider_row[data-id="notes"]').length == 1) {
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().addClass('border-top-custom');
    } else {
        $('#card_description').find('tr.wider_row[data-id="notes"]').removeClass('border-top-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').removeClass('border-bottom-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').addClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().removeClass('border-y-custom');
        $('#card_description').find('tr.wider_row[data-id="notes"]').last().addClass('border-top-custom');
    }
}

function ToggleExsDir(dir = 0) {
    let lastExsData = {};
    try {
        lastExsData = JSON.parse(sessionStorage.getItem('last_exs'));
    } catch(e) {}
    const params = new URLSearchParams(window.location.search);
    let nfbVal = params.get('nfb') == '1' ? 1 : 0;
    let folderType = params.get('type');
    let isPrevOn = false, isNextOn = false;
    try {
        isPrevOn = window.exsList.list[window.exsList.index - 1] ? true : false;
    } catch(e) {}
    try {
        isNextOn = window.exsList.list[window.exsList.index + 1] ? true : false;
    } catch(e) {}
    switch (dir) {
        // dir = 0 -> check exs list
        case 0:
            $('.exs-change[data-dir="prev"]').prop('disabled', !isPrevOn);
            $('.exs-change[data-dir="next"]').prop('disabled', !isNextOn);
            break;
        // dir = -1 -> previous exs
        case -1:
            if (isPrevOn) {
                window.location.href = `/exercises/exercise?id=${window.exsList.list[window.exsList.index - 1]}&nfb=${nfbVal}&type=${folderType}`;
                try {
                    lastExsData.exs = window.exsList.list[window.exsList.index - 1];
                } catch(e) {}
                window.exsList.index -= 1;
            }
            break;
        // dir = 1 -> next exs
        case 1:
            if (isNextOn) {
                window.location.href = `/exercises/exercise?id=${window.exsList.list[window.exsList.index + 1]}&nfb=${nfbVal}&type=${folderType}`;
                try {
                    lastExsData.exs = window.exsList.list[window.exsList.index + 1];
                } catch(e) {}
                window.exsList.index += 1;
            }
            break;
        default:
            break;
    }
    let exsListStr = JSON.stringify(window.exsList);
    sessionStorage.setItem('exs_list', exsListStr);
    let lastExsStr = JSON.stringify(lastExsData);
    sessionStorage.setItem('last_exs', lastExsStr);
}

function ToggleFoldersType(data = null) {
    let searchParams = new URLSearchParams(window.location.search);
    let folderType = searchParams.get('type');
    let exsCard = $('#exerciseCard');
    let folderName = "";
    $(exsCard).find('tr.folder-container').addClass('d-none');
    if (data == null) {
        $(exsCard).find('.exs_edit_field.nfb_folders').toggleClass('d-none', folderType != "nfb_folders");
        $(exsCard).find('.exs_edit_field.team_folders').toggleClass('d-none', folderType != "team_folders");
        $(exsCard).find(`.${folderType}[name="folder_parent"]`).val('');
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find(`.${folderType}[name="folder_main"]`).val('');
    } else {
        $(exsCard).find('.exs_edit_field.nfb_folders').toggleClass('d-none', folderType != "nfb_folders");
        $(exsCard).find('.exs_edit_field.team_folders').toggleClass('d-none', folderType != "team_folders");
        $(exsCard).find(`.${folderType}[name="folder_parent"]`).val(data.folder_parent_id);
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find('[name="folder_main"]').find(`option[data-parent=${data.folder_parent_id}]`).removeClass('d-none');
        $(exsCard).find(`.${folderType}[name="folder_main"]`).val(data.folder_id);
        folderName = $(exsCard).find(`.${folderType}[name="folder_main"]`).find(`option[value="${data.folder_id}"]`).text();
    }
    $(exsCard).find('tr[data-id="folder_name"] > td.folder-text').text(folderName);
}

function CheckSelectedRowInVideoTable(onlySetVideo = false) {
    let value = -1;
    if ($('#openVideo1').hasClass('selected2')) {value = $('.video-value[name="video1"]').val();}
    if ($('#openVideo2').hasClass('selected2')) {value = $('.video-value[name="video2"]').val();}
    if ($('#openAnimation1').hasClass('selected2')) {value = $('.video-value[name="animation1"]').val();}
    if ($('#openAnimation2').hasClass('selected2')) {value = $('.video-value[name="animation2"]').val();}
    try {
        value = parseInt(value);
        if (isNaN(value)) {value = -1;}
    } catch(e) {}
    window.currentVideoId = value;
    if (!onlySetVideo) {
        SelectRowInVideoTable(video_table, value);
    }
    SetCurrentVideo(value);
    RenderVideo(value, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
}

function SelectRowInVideoTable(table, value) {
    try {
        table.rows().deselect();
        for (let i = 0; i < table.rows().data().length; i++) {
            if (table.rows().data()[i].id == value) {
                table.row(i).select();
                break;
            }
        }
    } catch(e) {}
}

async function SetCurrentVideo(value) {
    ajax_get_video_data(value)
        .then((data) => {
            let exsFoldersStr = "";
            for (let exs_ind in data.exercises) {
                let elem = data.exercises[exs_ind];
                if (elem.folder && Array.isArray(elem.videos)) {
                    exsFoldersStr += `
                        ${elem.folder.short_name} <span class="other-exercises font-weight-bold" data-ids="${elem.videos.toString()}">(${elem.videos.length})</span>
                    `;
                }
            }
            let tags = Array.isArray(data.taggit) ? data.taggit.toString() : "";
            let htmlStr = `
                <tr id="${data.id}" role="row" class="odd current">
                    <td class="sorting_1"> -> </td>
                    <td>${data.id}</td>
                    <td>${data.videosource_name}</td>
                    <td>${exsFoldersStr}</td>
                    <td>${data.duration}</td>
                    <td>${data.name}</td>
                    <td>${tags}</td>
                </tr>
            `;
            $('#video').find('tbody').find('tr.current').remove();
            $('#video').find('tbody').prepend(htmlStr);

            $('.video-editor').find('.video-toggle').attr('data-state', '1');
            $('.video-editor').find('.video-toggle').text('Открепить');
            $('.video-editor').find('.video-info').text(`Прикреплено. ID: ${data.id}, ${data.name}`);
        })
        .catch((e) => {
            console.log(e)
            $('.video-editor').find('.video-toggle').attr('data-state', '0');
            $('.video-editor').find('.video-toggle').text('Прикрепить');
            $('.video-editor').find('.video-info').text(``);
        })
        .finally(() => {});
}

async function GoToVideoLink(value) {
    ajax_get_video_data(value)
        .then((data) => {
            window.open(`/video/?id=${data.id}`, '_blank').focus();
        });

}

function RenderVideo(value, htmlElem, windowElem) {
    try {
        windowElem.pause();
    } catch(e) {}
    if (!value || value == -1) {
        $(htmlElem).addClass('d-none');
        return;
    }
    get_video_ids(value)
    .then(data => {
        if (data) {
            $(htmlElem).removeClass('d-none');
            $(htmlElem).removeClass('not-active');
            if ('nftv' in data['links'] && data['links']['nftv'] != '') {
                windowElem.src({type: 'video/mp4', src: `https://213.108.4.28/video/player/${data['links']['nftv']}`});
                windowElem.poster(`https://213.108.4.28/video/poster/${data['links']['nftv']}`);
            } else if ('youtube' in data['links'] && data['links']['youtube'] != '') {
                windowElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${data['links']['youtube']}`});
                windowElem.poster('');
            }
        } else {
            $(htmlElem).addClass('d-none');
        }
    })
    .catch(err => {
        $(htmlElem).addClass('d-none');
    });
}

function SetVideoId(value) {
    if ($('#openVideo1').hasClass('selected2')) {$('.video-value[name="video1"]').val(value);}
    if ($('#openVideo2').hasClass('selected2')) {$('.video-value[name="video2"]').val(value);}
    if ($('#openAnimation1').hasClass('selected2')) {$('.video-value[name="animation1"]').val(value);}
    if ($('#openAnimation2').hasClass('selected2')) {$('.video-value[name="animation2"]').val(value);}
    window.changedData = true;
}

function StopVideoForEdit() {
    try {
        window.videoPlayerCardEdit.pause();
    } catch (e) {}
}

function RenderExsAdditionalParams(data, disabled=true, selectedRow=null) {
    $('#exerciseAdditionalParamsModal').find('tbody').html('');
    let htmlStr = "";
    for (let i in data) {
        let elem = data[i];
        htmlStr += `
        <tr class="column-elem" data-id="${elem.id}">
            <td class=""></td>
            <td class="">
                <input name="field" class="form-control form-control-sm" type="text" value="${elem.field ? elem.field : ''}" placeholder="" autocomplete="off" ${disabled ? 'disabled=""' : ''} ">
            </td>
            <td class="text-center">
                <input type="checkbox" class="form-check-input" name="visible" ${elem.visible ? 'checked=""' : ''}>
            </td>
        </tr>
        `;
    }
    $('#exerciseAdditionalParamsModal').find('tbody').html(htmlStr);
    $('#exerciseAdditionalParamsModal').find(`.column-elem[data-id="${selectedRow}"]`).addClass('selected');

    LoadExerciseOne();
}

function EditExsAdditionalParam(mode="edit", fields={}) {
    let rowId = $('#exerciseAdditionalParamsModal').find('.column-elem.selected').attr('data-id');
    let dataToSend = {'edit_exs_additional_param': 1, 'mode': mode, 'row': rowId};
    dataToSend = Object.assign({}, dataToSend, fields);
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                let statusText = "";
                if (res.mode == "add") {
                    statusText = "Новый параметр успешно создан.";
                } else if (res.mode == "edit") {
                    statusText = "Параметр успешно изменён.";
                } else if (res.mode == "delete") {
                    statusText = "Параметр успешно удалён.";
                }
                swal("Готово", statusText, "success")
                .then((value) => {
                    RenderExsAdditionalParams(res.data, res.disabled, rowId);
                });
            } else {
                swal("Ошибка", `При создании / изменении параметра произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Параметр не удалось создать / изменить.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExsAdditionalParamsOrder(dir) {
    let wasChanged = false;
    let cID = $('#exerciseAdditionalParamsModal').find('.column-elem.selected').attr('data-id');
    let elems = $('#exerciseAdditionalParamsModal').find(`tr.column-elem`);
    let tFirst = null; let tLast = null; let newInd = 0;
    for (let i = 0; i < elems.length; i++) {
        if ($(elems[i]).attr('data-id') == cID) {
            wasChanged = true;
            if (dir == "up") {
                tLast = $(elems[i]);
                if (i - 1 < 0) {
                    newInd = elems.length - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertAfter($(tFirst));
                } else {
                    newInd = i - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertBefore($(tFirst));
                }
            } else if (dir == "down") {
                tFirst = $(elems[i]);
                if (i + 1 > elems.length - 1) {
                    newInd = 0;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertBefore($(tLast));
                } else {
                    newInd = i + 1;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertAfter($(tLast));
                }
            }
            break;
        }             
    }
    EditExsAdditionalParamsOrder();
}

function EditExsAdditionalParamsOrder() {
    let rowId = $('#exerciseAdditionalParamsModal').find('.column-elem.selected').attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseAdditionalParamsModal').find('.column-elem').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_additional_param': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                RenderExsAdditionalParams(res.data, res.disabled, rowId);
            } else {
                swal("Ошибка", `При изменении порядка параметров произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок параметров.", "error");
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

// Drag and drop functions for exercises' tags
function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
} 
function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    if (ev.target.tagName.toLowerCase() === 'div' && ev.target.classList.contains('category-block')) {
        ev.target.appendChild(document.getElementById(data));
        ChangeExsTagCategory(ev.target, document.getElementById(data));
    }
}

function LoadExercisesTagsAll() {
    let dataSend = {'get_exs_all_tags': 1};
    let dataResponse = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                dataResponse = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            RenderExercisesTagsAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderExercisesTagsAll(data) {
    function _rendering(data, type="nfb") {
        let categoriesHtml = "";
        if (data && data['categories'] && Array.isArray(data['categories'][type])) {
            for (let i = 0; i < data['categories'][type].length; i++) {
                let elem = data['categories'][type][i];
                categoriesHtml += `
                    <div class="row category-container" data-id="${elem.id}">
                        <div class="col-12 mb-1">
                            <input name="" class="form-control form-control-sm category-title" type="text" value="${elem.name ? elem.name : ''}" placeholder="Название категории" autocomplete="off" disabled=""> 
                        </div>
                        <div class="col-12">
                            <div class="category-block" ondrop="drop(event)" ondragover="allowDrop(event)">
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find('.category-container:not(.category-no)').remove();
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).prepend(categoriesHtml);
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find('.category-container').find('.category-block > span.drag').remove();
        if (data && Array.isArray(data[type])) {
            for (let i = 0; i < data[type].length; i++) {
                let elem = data[type][i];
                let tagHtml = `
                    <span class="drag" draggable="true" ondragstart="drag(event)" id="ex_tag_${type}_${i}" data-id="${elem.id}">
                        <a class="btn btn-sm btn-light">
                            <span class="mr-1">${elem.name}</span>
                            <span class="badge badge-danger tag-delete" title="Удалить элемент">
                                <i class="fa fa-trash-o" aria-hidden="true"></i>
                            </span>
                        </a>
                    </span>
                `;
                let fContainer = $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find(`.category-container[data-id="${elem.category}"]`);
                if (fContainer.length == 0) {
                    fContainer = $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find(`.category-container.category-no`);
                }
                $(fContainer).find('.category-block').append(tagHtml);
            }
        }
    }
    _rendering(data, "nfb");
    _rendering(data, "self");
}

function EditExsTagCategory(id, name, type, toDelete=0) {
    let dataSend = {'edit_exs_tag_category': 1, id, name, type, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить категорию ключевых слов!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменит / удалить категорию ключевых слов!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExsTagCategoryOrder(dir) {
    let wasChanged = false;
    let cID = $('#exerciseTagsModal').find('.row.category-container.selected:visible:not(.category-no)').attr('data-id');
    let elems = $('#exerciseTagsModal').find('.row.category-container:visible:not(.category-no)');
    let tFirst = null; let tLast = null; let newInd = 0;
    for (let i = 0; i < elems.length; i++) {
        if ($(elems[i]).attr('data-id') == cID) {
            wasChanged = true;
            if (dir == "up") {
                tLast = $(elems[i]);
                if (i - 1 < 0) {
                    newInd = elems.length - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertAfter($(tFirst));
                } else {
                    newInd = i - 1;
                    tFirst = $(elems[newInd]);
                    $(tLast).detach().insertBefore($(tFirst));
                }
            } else if (dir == "down") {
                tFirst = $(elems[i]);
                if (i + 1 > elems.length - 1) {
                    newInd = 0;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertBefore($(tLast));
                } else {
                    newInd = i + 1;
                    tLast = $(elems[newInd]);
                    $(tFirst).detach().insertAfter($(tLast));
                }
            }
            break;
        }             
    }
}

function SaveExsTagCategoryOrder() {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsModal').find('.row.category-container:visible:not(.category-no)').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_category': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок категорий ключевых слов успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка категорий ключевых слов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок категорий ключевых слов.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function SaveExsTagsOrder() {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsModal').find('span.drag:visible').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_one': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок ключевых слов успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка ключевых слов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок ключевых слов.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function EditExsTagOne(id, name, type, category, toDelete=0) {
    let dataSend = {'edit_exs_tag_one': 1, id, name, type, category, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось создать / удалить ключевое слово!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / удалить ключевое слово!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ChangeExsTagCategory(categoryElem, tagElem) {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let category = $(categoryElem).parent().parent().attr('data-id');
    let id = $(tagElem).attr('data-id');
    let dataSend = {'change_exs_tag_category': 1, id, category, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось переместить ключевое слово!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось переместить ключевое слово!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}



$(function() {

    let cLang = $('#select-language').val();
    try {
        ClassicEditor
            .create(document.querySelector('#descriptionEditor2'), {
                language: cLang
            })
            .then(editor => {
                document.descriptionEditor2 = editor;
                if (window.onlyViewMode) {
                    document.descriptionEditor2.enableReadOnlyMode('');
                    $(document).find('.ck-editor__top').addClass('d-none');
                    $(document).find('.ck-editor__main').addClass('read-mode');
                }
                $('.resizeable-block').css('height', `75vh`);
            })
            .catch(err => {
                console.error(err);
            });
    } catch(e) {}

    window.dataForSplitExsCardCols = JSON.parse(localStorage.getItem('split_exs_card_cols'));
    if (!window.dataForSplitExsCardCols) {
        window.dataForSplitExsCardCols = [27, 45, 28];
        localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
    }
    RenderSplitExsCardCols();


    ToggleEditFields(false);

    $('#exerciseCard').find('.exs_edit_field[name="tags"]').select2({
        maximumSelectionLength: 4
    });

    $('#exerciseCard').on('click', '#openDescription', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_description').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_description').removeClass('d-none');
        $('#exerciseCard').find('button[data-type="add"]').removeClass('d-none');

        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        $('.video-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openDrawing1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_drawing1').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_drawing1').removeClass('d-none');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        if ($('#editExs').attr('data-active') == '1') {
            $('#card_drawing1').addClass('d-none');
            // $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing1').find('.card').html());
            // $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // setTimeout((e) => {
            //     $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // }, 100);
            let cId = $('#exerciseCard').find('.exs_edit_field[name="scheme_1"]').val();
            let cSrc = "http://62.113.105.179/canvas/new";
            if (cId && cId != "") {
                cSrc = `http://62.113.105.179/canvas/edit/${cId}`;
            }
            $('.scheme-editor').find('iframe').attr('src', cSrc);
            window.addEventListener('message', (e) => {
                if (e.origin === "http://62.113.105.179") {
                    const { event, payload } = e.data;
                    let newId = null;
                    try {
                        newId = payload.canvas.id;
                    } catch (e) {}
                    if (newId && newId != "") {
                        let cSrc = `http://62.113.105.179/canvas/edit/${newId}`;
                        $('.scheme-editor').find('iframe').attr('src', cSrc);
                        if ($('#openDrawing1').hasClass('selected2')) {
                            $('#exerciseCard').find('.exs_edit_field[name="scheme_1"]').val(newId);
                        }
                    }
                }
            });
            $('.scheme-editor').removeClass('d-none');
        }
        StopVideoForEdit();
        $('.video-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openDrawing2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');;
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_drawing2').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_drawing2').removeClass('d-none');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        if ($('#editExs').attr('data-active') == '1') {
            $('#card_drawing2').addClass('d-none');
            // $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing2').find('.card').html());
            // $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // setTimeout((e) => {
            //     $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            // }, 100);
            let cId = $('#exerciseCard').find('.exs_edit_field[name="scheme_2"]').val();
            let cSrc = "http://62.113.105.179/canvas/new";
            if (cId && cId != "") {
                cSrc = `http://62.113.105.179/canvas/edit/${cId}`;
            }
            $('.scheme-editor').find('iframe').attr('src', cSrc);
            window.addEventListener('message', (e) => {
                if (e.origin === "http://62.113.105.179") {
                    const { event, payload } = e.data;
                    let newId = null;
                    try {
                        newId = payload.canvas.id;
                    } catch (e) {}
                    if (newId && newId != "") {
                        let cSrc = `http://62.113.105.179/canvas/edit/${newId}`;
                        $('.scheme-editor').find('iframe').attr('src', cSrc);
                        if ($('#openDrawing2').hasClass('selected2')) {
                            $('#exerciseCard').find('.exs_edit_field[name="scheme_2"]').val(newId);
                        }
                    }
                }
            });
            $('.scheme-editor').removeClass('d-none');
        }
        StopVideoForEdit();
        $('.video-editor').addClass('d-none');
    });
    $('#exerciseCard').on('click', '#openVideo1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_video1').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_video1').removeClass('d-none');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}
    });
    $('#exerciseCard').on('click', '#openVideo2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_video2').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_video2').removeClass('d-none');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}
    });
    $('#exerciseCard').on('click', '#openAnimation1', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_animation1').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_animation1').removeClass('d-none');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}
    });
    $('#exerciseCard').on('click', '#openAnimation2', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('selected2');
        $(e.currentTarget).addClass('selected2');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_animation2').addClass('show active');
        $('#exerciseCard').find('#cardBlock > .tab-pane').addClass('d-none');
        $('#exerciseCard').find('#cardBlock > #card_animation2').removeClass('d-none');
        $('#exerciseCard').find('button[data-type="add"]').addClass('d-none');

        $('.scheme-editor').addClass('d-none');
        StopVideoForEdit();
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
        try {
            video_table.columns.adjust().draw();
        } catch(e) {}
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
            // if (cId == "notes" || cId == "additional_data") {cType = "text";}
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
        }
        $(cloneRow).addClass('wider_row value_row');
        $(cloneRow).find('.form-control').addClass('exs_edit_field');
        $(cloneRow).find('.form-control').addClass('exs_team_param');
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cloneRow).insertAfter($('#exerciseCard').find(`.wider_row[data-id="${cId}"]`).last());
        CorrectBlockBorders();
        window.changedData = true;
    });
    $('#exerciseCard').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().parent().parent().remove();
        CorrectBlockBorders();
        window.changedData = true;
    });


    $('#exerciseCard').on('change', '.nfb_folders[name="folder_parent"]', (e) => {
        let cId = $(e.currentTarget).val();
        $('#exerciseCard').find('.nfb_folders[name="folder_main"]').val('');
        $('#exerciseCard').find('.nfb_folders[name="folder_main"] > option').each((ind, elem) => {
            $(elem).toggleClass('d-none', !($(elem).attr('data-parent') == cId));
        });
    });
    $('#exerciseCard').on('change', '.team_folders[name="folder_parent"]', (e) => {
        let cId = $(e.currentTarget).val();
        $('#exerciseCard').find('.team_folders[name="folder_main"]').val('');
        $('#exerciseCard').find('.team_folders[name="folder_main"] > option').each((ind, elem) => {
            $(elem).toggleClass('d-none', !($(elem).attr('data-parent') == cId));
        });
    });


    $('#exerciseCard').on('change', '.exs_edit_field', (e) => {
        window.changedData = true;
        if (!$(e.currentTarget).prop('required')) {return;}
        let isEmpty = $(e.currentTarget).val() == '';
        $(e.currentTarget).toggleClass('empty-field', isEmpty);
    });


    $('#splitCol_exscard_2').find('.btn-view').toggleClass('d-none', false);
    $('#splitCol_exscard_2').find('.btn-edit').toggleClass('d-none', true);

    $('#editExs').on('click', (e) => {
        let isActive = $(e.currentTarget).attr('data-active');
        $(e.currentTarget).attr('data-active', isActive == '1' ? 0 : 1);
        $(e.currentTarget).toggleClass('btn-secondary', isActive == '1');
        $(e.currentTarget).toggleClass('btn-warning', isActive != '1');
        $(e.currentTarget).attr('title', isActive == '1' ? "Редактировать" : "Отменить");
        $('#saveExs').toggleClass('btn-secondary', isActive == '1');
        $('#saveExs').prop('disabled', isActive == '1');
        $('#saveExs').toggleClass('btn-success', isActive != '1');
        $('.exercise-card-header').toggleClass('d-none', isActive == '1');
        $('#splitCol_exscard_2').find('.btn-view').toggleClass('d-none', isActive != '1');
        $('#splitCol_exscard_2').find('.btn-edit').toggleClass('d-none', isActive == '1');
        ToggleEditFields(isActive != '1');
        window.changedData = false;
        if (isActive == '1') {
            LoadExerciseOne();
        }
        if (isActive != '1') {
            $('#exerciseCard').find('tr.folder-container').removeClass('d-none');
            if ($('#card_drawing1').hasClass('active')) {
                $('#card_drawing1').addClass('d-none');
                $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing1').find('.card').html());
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
                setTimeout((e) => {
                    $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
                }, 100);
                $('.scheme-editor').removeClass('d-none');
            }
            if ($('#card_drawing2').hasClass('active')) {
                $('#card_drawing2').addClass('d-none');
                $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing2').find('.card').html());
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
                setTimeout((e) => {
                    $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
                }, 100);
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
        let setColumnsShort = $('.exercise-card-header').is(":visible");
        $('.left-col-card').toggleClass('short', setColumnsShort);
        $('.center-col-card').toggleClass('short', setColumnsShort);
        $('.right-col-card').toggleClass('short', setColumnsShort);
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
        window.changedData = true;
    });

    // scheme copy
    $('#copyScheme').on('click', (e) => {
        if ($('#card_drawing1').hasClass('active')) {
            $('#card_drawing2').find('.card').html(
                $('#card_drawing1').find('.card').html()
            );
        }
        if ($('#card_drawing2').hasClass('active')) {
            $('#card_drawing1').find('.card').html(
                $('#card_drawing2').find('.card').html()
            );
        }
        window.changedData = true;
    });


    // Save and Load exercise
    ToggleFoldersType();
    LoadExerciseOne();
    $('#exerciseCard').on('click', '#saveExs', (e) => {
        window.changedData = false;
        SaveExerciseOne();
    });

    $('#exerciseCard').on('click', '#deleteExercise', (e) => {
        window.changedData = false;
        DeleteExerciseOne();
    });
    

    window.exsList = {'list': [], 'index': -1};
    try {
        window.exsList = JSON.parse(sessionStorage.getItem('exs_list'));
        ToggleExsDir();
    } catch(e) {}
    $('.exs-change').on('click', (e) => {
        let dir = $(e.currentTarget).attr('data-dir');
        dir = dir == "prev" ? -1 : dir == "next" ? 1 : 0;
        ToggleExsDir(dir);
    });

    try {
        window.videoPlayerCardEdit = videojs('video-player-card-edit', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    } catch (e) {}

    try {
        window.videoPlayerCard1 = videojs('video-player-card-1', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
        window.videoPlayerCard2 = videojs('video-player-card-2', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
        window.videoPlayerCard3 = videojs('video-player-card-3', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
        window.videoPlayerCard4 = videojs('video-player-card-4', {
            preload: 'auto',
            autoplay: false,
            controls: true,
            aspectRatio: '16:9',
            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
        });
    } catch (e) {}
 

    window.currentVideoId = -1;
    try {
        generate_ajax_video_table('56vh');
        $('#video').on('xhr.dt', (e, settings, json, xhr) => {
            setTimeout(() => {
                let value = -1;
                if ($('#openVideo1').hasClass('selected2')) {value = $('.video-value[name="video1"]').val();}
                if ($('#openVideo2').hasClass('selected2')) {value = $('.video-value[name="video2"]').val();}
                if ($('#openAnimation1').hasClass('selected2')) {value = $('.video-value[name="animation1"]').val();}
                if ($('#openAnimation2').hasClass('selected2')) {value = $('.video-value[name="animation2"]').val();}
                try {
                    value = parseInt(value);
                    if (isNaN(value)) {value = -1;}
                } catch(e) {}
                SelectRowInVideoTable(video_table, value);
            }, 500);
        });

        $('#video').on('draw.dt', () => {
            SetCurrentVideo(window.currentVideoId);
        });

        video_table
            .on( 'select', (e, dt, type, indexes) => {
                let rowData = video_table.rows( indexes ).data().toArray();
                if (type=='row') {
                    let currentData = rowData[0];
                    window.currentVideoId = currentData.id;
                    RenderVideo(currentData.id, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
                    $('.video-editor').find('.video-toggle').attr('data-state', '0');
                    $('.video-editor').find('.video-toggle').text('Прикрепить');
                }
            })
            .on( 'deselect', (e, dt, type, indexes) => {});
        $('#video').on('click', 'tr', (e) => {
            let isSelected = $(e.currentTarget).hasClass('selected');
            if (!isSelected) {
                RenderVideo(-1, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
                CheckSelectedRowInVideoTable(true);
            }
        });

        $('.video-editor').on('click', '.video-toggle', (e) => {
            let selectedRow = video_table.rows({selected: true}).data().toArray()[0];
            let selectedId = selectedRow ? selectedRow.id : null;
            if ($(e.currentTarget).attr('data-state') == '1') {
                window.currentVideoId = -1;
                SetVideoId('');
                SetCurrentVideo(-1);
                RenderVideo(-1, $('.video-editor').find('#video-player-card-edit'), window.videoPlayerCardEdit);
            } else {
                if (selectedId) {
                    window.currentVideoId = selectedId;
                    SetVideoId(selectedId);
                    SetCurrentVideo(selectedId);
                }
            }
        });
        $('.video-editor').on('click', '.video-link', (e) => {
            GoToVideoLink(window.currentVideoId);
        });

        $('#video-card-modal-open').on('click', (e) => {
            let cId = -1;
            try {
                cId = parseInt($('#video').find('tbody > tr.selected').attr('id'));
                if (isNaN(cId)) {cId = -1;}
            } catch(e) {}
            if (cId != -1) {
                ajax_get_video_data(cId)
                .then((data) => {
                    render_json_block(data);
                });
            }
        });

    } catch(e) {}

    $('#exerciseCard').on('click', 'tr.add-params-container-after', (e) => {
        $('#exerciseCard').find('tr.additional-params-container:not(.empty)').toggleClass('d-none');
    });

    $('#exsAdditionalParamsRef').on('click', (e) => {
        $('#exerciseAdditionalParamsModal').modal();
    });
    $('#exerciseAdditionalParamsModal').on('click', '.column-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#exerciseAdditionalParamsModal').find('.column-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#exerciseAdditionalParamsModal').on('click', '.col-add', (e => {
        $('#exerciseAdditionalParamsModal').find('.column-elem').removeClass('selected');
        EditExsAdditionalParam("edit");
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-edit', (e => {
        $('#exerciseAdditionalParamsModal').find('input').prop('disabled', false);
    }));
    $('#exerciseAdditionalParamsModal').on('change', 'input', (e => {
        $('#exerciseAdditionalParamsModal').find('.column-elem').removeClass('selected');
        $(e.currentTarget).parent().parent().addClass('selected');
        let fieldName = $(e.currentTarget).attr('name');
        let fieldVal = $(e.currentTarget).attr('type') == "checkbox" ? $(e.currentTarget).prop('checked') : $(e.currentTarget).val();
        let field = {[fieldName]: fieldVal};
        EditExsAdditionalParam("edit", field);
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-delete', (e => {
        if ($('#exerciseAdditionalParamsModal').find('.column-elem.selected').length > 0) {
            EditExsAdditionalParam("delete");
        }
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-up', (e => {
        ToggleExsAdditionalParamsOrder("up");
    }));
    $('#exerciseAdditionalParamsModal').on('click', '.col-down', (e => {
        ToggleExsAdditionalParamsOrder("down");
    }));


    $('#exsTagsRef').on('click', (e) => {
        $('#exerciseTagsModal').modal();
    });
    $('#exerciseTagsModal').on('show.bs.modal', (e) => {
        LoadExercisesTagsAll();
    });
    $('#exerciseTagsModal').on('click', 'a.nav-link', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseTagsModal').find('a.nav-link').removeClass('active');
        $('#exerciseTagsModal').find('.content-container').addClass('d-none');
        $(e.currentTarget).addClass('active');
        $('#exerciseTagsModal').find(`.content-container[data-id="${cId}"]`).removeClass('d-none');
        $('#exerciseTagsModal').find('.row.category-container').removeClass('selected');
        $('#exerciseTagsModal').find('.tag-add-control').addClass('d-none');

    });
    $('#exerciseTagsModal').on('click', '.row.category-container', (e) => {
        if ($(e.target).is('span') || $(e.target).is('a') || $(e.target).is('i')) {
            return;
        }
        let isSelected = $(e.currentTarget).hasClass('selected');
        $('#exerciseTagsModal').find('.row.category-container').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !isSelected);
        $('#exerciseTagsModal').find('.tag-add-control').toggleClass('d-none', isSelected);
    });
    $('#exerciseTagsModal').on('click', '.col-add', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        EditExsTagCategory(null, "", cType);
    });
    $('#exerciseTagsModal').on('click', '.col-edit', (e) => {
        $('#exerciseTagsModal').find('.category-title').prop('disabled', false);
    });
    $('#exerciseTagsModal').on('change', '.category-title', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        let cName = $(e.currentTarget).val();
        EditExsTagCategory(cId, cName, cType);
    });
    $('#exerciseTagsModal').on('click', '.col-delete', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $('#exerciseTagsModal').find('.row.category-container.selected:visible').attr('data-id');
        EditExsTagCategory(cId, "", cType, 1);
    });
    $('#exerciseTagsModal').on('click', '.col-up', (e) => {
        ToggleExsTagCategoryOrder("up");
    });
    $('#exerciseTagsModal').on('click', '.col-down', (e) => {
        ToggleExsTagCategoryOrder("down");
    });
    $('#exerciseTagsModal').on('click', 'button.save', (e) => {
        SaveExsTagCategoryOrder();
        SaveExsTagsOrder();
    });
    $('#exerciseTagsModal').on('click', '.tag-new-add', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cCategory = $('#exerciseTagsModal').find('.row.category-container.selected:visible').attr('data-id');
        let cName = $('#exerciseTagsModal').find('input[name="add_new_tag"]').val();
        if (cCategory && cName != "") {
            EditExsTagOne(null, cName, cType, cCategory);
        }
        $('#exerciseTagsModal').find('input[name="add_new_tag"]').val('');
    });
    $('#exerciseTagsModal').on('click', '.tag-delete', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        EditExsTagOne(cId, "", cType, null, 1);
    });

});

