function RenderSplitExsCardCols() {
    $('#exerciseCard').find('div.gutter').remove();
    sizesArr = window.dataForSplitExsCardCols;
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
        CorrectBlockBorders();

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

        console.log(data)
        if (data.video_data[0] && data.video_data[0] != -1) {
            $('#carouselVideo').find('.carousel-item').first().removeClass('d-none');
            $(exsCard).find('.video-value[name="video1"]').val(data.video_data[0]);
            RenderVideo(data.video_data[0], $(exsCard).find('.video-value[name="video1"]'), window.videoPlayerCard1);
        } else {
            $('#carouselVideo').find('.carousel-item').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
            $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="video1"]').val('');
        }
        if (data.video_data[1] && data.video_data[1] != -1) {
            $('#carouselVideo').find('.carousel-item').last().removeClass('d-none');
            $(exsCard).find('.video-value[name="video2"]').val(data.video_data[1]);
            RenderVideo(data.video_data[1], $(exsCard).find('.video-value[name="video2"]'), window.videoPlayerCard2);
        } else {
            $('#carouselVideo').find('.carousel-item').last().addClass('d-none');
            $('#carouselVideo').find('.carousel-indicators > li').last().addClass('d-none');
            $('#carouselVideo').find('.carousel-control-prev').addClass('d-none');
            $('#carouselVideo').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="video2"]').val('');
        }
        if (data.animation_data.default[0] && data.animation_data.default[0] != -1) {
            $('#carouselAnim').find('.carousel-item').first().removeClass('d-none');
            $(exsCard).find('.video-value[name="animation1"]').val(data.animation_data.default[0]);
            RenderVideo(data.animation_data.default[0], $(exsCard).find('.video-value[name="animation1"]'), window.videoPlayerCard3);
        } else {
            $('#carouselAnim').find('.carousel-item').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-indicators > li').first().addClass('d-none');
            $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
            $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="animation1"]').val('');
        }
        if (data.animation_data.default[1] && data.animation_data.default[1] != -1) {
            $('#carouselAnim').find('.carousel-item').last().removeClass('d-none');
            $(exsCard).find('.video-value[name="animation2"]').val(data.animation_data.default[1]);
            RenderVideo(data.animation_data.default[1], $(exsCard).find('.video-value[name="animation2"]'), window.videoPlayerCard4);
        } else {
            $('#carouselAnim').find('.carousel-item').last().addClass('d-none');
            $('#carouselAnim').find('.carousel-indicators > li').last().addClass('d-none');
            $('#carouselAnim').find('.carousel-control-prev').addClass('d-none');
            $('#carouselAnim').find('.carousel-control-next').addClass('d-none');
            $(exsCard).find('.video-value[name="animation2"]').val('');
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
        CorrectBlockBorders();

        $(exsCard).find('.video-value[name="video1"]').val('');
        $(exsCard).find('.video-value[name="video2"]').val('');
        $(exsCard).find('.video-value[name="animation1"]').val('');
        $(exsCard).find('.video-value[name="animation2"]').val('');

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
    dataToSend.data['video_1'] = $('#card_video1').find('.video-value').val();
    dataToSend.data['video_2'] = $('#card_video2').find('.video-value').val();
    dataToSend.data['animation_1'] = $('#card_animation1').find('.video-value').val();
    dataToSend.data['animation_2'] = $('#card_animation2').find('.video-value').val();

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
                window.location.href = `/exercises/exercise?id=${window.exsList.list[window.exsList.index - 1]}&nfb=${nfbVal}`;
                try {
                    lastExsData.exs = window.exsList.list[window.exsList.index - 1];
                } catch(e) {}
                window.exsList.index -= 1;
            }
            break;
        // dir = 1 -> next exs
        case 1:
            if (isNextOn) {
                window.location.href = `/exercises/exercise?id=${window.exsList.list[window.exsList.index + 1]}&nfb=${nfbVal}`;
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

function CheckSelectedRowInVideoTable() {
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
    RenderVideo(value, $('.video-editor').find('#video-player-card'), window.videoPlayerCardEdit);
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

function RenderVideo(value, htmlElem, windowElem) {
    if (!value || value == -1) {
        $(htmlElem).addClass('d-none');
        return;
    }
    get_video_ids(value)
    .then(data => {
        if (data.links) {
            $(htmlElem).removeClass('d-none');
            $(htmlElem).removeClass('not-active');
            if ('nftv' in data['links'] && data['links']['nftv'] != '') {
                windowElem.src({type: 'video/mp4', src: `https://213.108.4.28/video/player/${data['links']['nftv']}`});
            } else if ('youtube' in data['links'] && data['links']['youtube'] != '') {
                windowElem.src({techOrder: ["youtube"], type: 'video/youtube', src: `https://www.youtube.com/watch?v=${data['links']['youtube']}`});
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
    let valueInt = -1;
    try {
        valueInt = parseInt(value);
        if (isNaN(valueInt)) {valueInt = -1;}
    } catch (e) {}
    RenderVideo(valueInt, $('.video-editor').find('#video-player-card'), window.videoPlayerCardEdit);
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
                $(document).find('.ck-editor__main').addClass('read-mode');
            }
            $('.resizeable-block').css('height', `235px`);
        })
        .catch(err => {
            console.error(err);
        });


    window.dataForSplitExsCardCols = JSON.parse(localStorage.getItem('split_exs_card_cols'));
    if (!window.dataForSplitExsCardCols) {
        window.dataForSplitExsCardCols = [27, 45, 28];
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
        $('#exerciseCard').find('button[data-type="add"]').removeClass('d-none');

        $('.scheme-editor').addClass('d-none');
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
            $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing1').find('.card').html());
            $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            setTimeout((e) => {
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            }, 100);
            $('.scheme-editor').removeClass('d-none');
        }
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
            $('.scheme-editor').find('iframe').contents().find('#svgparent').html($('#card_drawing2').find('.card').html());
            $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            setTimeout((e) => {
                $('.scheme-editor').find('iframe')[0].contentWindow.svgBlockResize();
            }, 100);
            $('.scheme-editor').removeClass('d-none');
        }
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
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
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
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
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
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
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
        CheckSelectedRowInVideoTable();
        $('.video-editor').removeClass('d-none');
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
        CorrectBlockBorders();
        window.changedData = true;
    });
    $('#exerciseCard').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().parent().parent().remove();
        CorrectBlockBorders();
        window.changedData = true;
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


    $('#exerciseCard').on('change', '.exs_edit_field', (e) => {
        window.changedData = true;
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
    LoadExerciseOne();
    $('#exerciseCard').on('click', '#saveExs', (e) => {
        SaveExerciseOne();
    });

    $('#exerciseCard').on('click', '#deleteExercise', (e) => {
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


    window.videoPlayerCardEdit = videojs('video-player-card-edit', {
        preload: 'auto',
        autoplay: false,
        controls: true,
        aspectRatio: '16:9',
        youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
    });

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


    try {
        generate_ajax_video_table();
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
        video_table
            .on('select', (e, dt, type, indexes) => {
                let rowData = video_table.rows(indexes).data().toArray();
                if(type == 'row') {
                    let currentData = rowData[0];
                    SetVideoId(currentData.id);
                }
            })
            .on('deselect', (e, dt, type, indexes) => {});
        $('.video-editor').on('click', 'tr', (e) => {
            let isSelected = $(e.currentTarget).hasClass('selected');
            if (!isSelected) {SetVideoId('');}
        });
    } catch(e) {}


});

