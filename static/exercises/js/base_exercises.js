function ToggleUpFilter(id, state) {
    switch(id) {
        case "toggle_side_filter":
            $('div.visual-block').toggleClass('col-auto', !state);
            $('div.visual-block').toggleClass('col-4', state);
            $('div.side-filter-block').toggleClass('d-none', !state);
            RenderSplitCols();
            if (!state && $('.up-filter-elem[data-id="cols_size"]').attr('data-state') == '1') {
                $('.up-filter-elem[data-id="cols_size"]').attr('data-state', '0');
                $('.up-filter-elem[data-id="cols_size"]').removeClass('btn-primary');
                $('.up-filter-elem[data-id="cols_size"]').addClass('btn-secondary');
                $('.exercises-list').find('div.gutter').addClass('d-none');
            }
            break;
        case "cols_size":
            if ($('.up-filter-elem[data-id="toggle_side_filter"]').attr('data-state') == '1') {
                $('.exercises-list').find('div.gutter').toggleClass('d-none', !state);
            } else {
                alert("Включите сначала \"Фильтрацию\"")
                $('.up-filter-elem[data-id="cols_size"]').attr('data-state', '0');
                $('.up-filter-elem[data-id="cols_size"]').removeClass('btn-primary');
                $('.up-filter-elem[data-id="cols_size"]').addClass('btn-secondary');
            }
            break;
        case "nfb_folders":
            $('.folders_list').toggleClass('d-none', state);
            $('.folders_nfb_list').toggleClass('d-none', !state);
            $('.exercises-list').find('.list-group-item').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
            break;
        case "copy":
            if ($('.exercises-list').find('.exs-elem.active').length <= 0) {
                $('.up-filter-elem[data-id="copy"]').removeClass('btn-primary');
                $('.up-filter-elem[data-id="copy"]').addClass('btn-secondary');
                $('.up-filter-elem[data-id="copy"]').attr('data-state', '0');
                alert("Выберите упр-ие для копирования.");
            } else {
                if (state) {
                    $('#exerciseCopyModal').modal('show');
                } else {
                    $('#exerciseCopyModal').modal('hide');
                }
            }
            break;
        default:
            break;
    }
}

function RenderSplitCols() {
    $('.exercises-list').find('div.gutter').remove();
    let stateSideFilter = $('.up-filter-elem[data-id="toggle_side_filter"]').attr('data-state') == '1';
    let sizesArr = [];
    if (stateSideFilter) {
        sizesArr = window.dataForSplit;
    } else {
        sizesArr = [window.dataForSplit[0], window.dataForSplit[1], (window.dataForSplit[2] + window.dataForSplit[3])];
    }
    Split(['#splitCol_0', '#splitCol_1', '#splitCol_2', '#splitCol_3'], {
        sizes: sizesArr,
        minSize: 180,
        maxSize: 700,
        gutterSize: 20,
        onDragEnd: (arr) => {
            window.dataForSplit = arr;
            localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
        }
    });
    let stateColSize = $('.up-filter-elem[data-id="cols_size"]').attr('data-state') == '1';
    $('.exercises-list').find('div.gutter').toggleClass('d-none', !stateColSize);
}

function RenderExerciseOne(data) {
    function CheckMultiRows(exsCard, data, elem, isSelect = false) {
        let parentElem = $(exsCard).find(elem).first().parent();
        let cloneElem = $(exsCard).find(elem).first().clone();
        if (!Array.isArray(data)) {
            data = [''];
        }
        $(exsCard).find(elem).remove();
        for (let key in data) {
            let elem = data[key];
            let tmpClone = $(cloneElem).clone();
            $(tmpClone).val(elem);
            $(parentElem).append(tmpClone);
        }
    }

    console.log(data)
    let exsCard = $('#exerciseCardModal');
    if (data && data.id) {
        let folderType = data.nfb ? "folder_nfb" : "folder_default";

        $(exsCard).attr('data-exs', data.id);
        $(exsCard).find('#editExs').toggleClass('d-none', data.nfb);

        $(exsCard).find('#editExs').attr('data-state', '0');
        $(exsCard).find('#editExs').toggleClass('btn-secondary', true);
        $(exsCard).find('#editExs').toggleClass('btn-success', false);
        $(exsCard).find('#editExs').text('Редактировать');
        $(exsCard).find('.btns-edit').find('button').prop('disabled', false);
        $(exsCard).find('.exs_edit_field').prop('disabled', true);
        $(exsCard).find('.add-row').prop('disabled', true);
        document.descriptionEditor.enableReadOnlyMode('');
        document.coachingEditor.enableReadOnlyMode('');

        $(exsCard).find('.exs_edit_field.folder_nfb').toggleClass('d-none', !data.nfb);
        $(exsCard).find('.exs_edit_field.folder_default').toggleClass('d-none', data.nfb);
        $(exsCard).find(`.${folderType}[name="folder_parent"]`).val(data.folder_parent_id);
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find('[name="folder_main"]').find(`option[data-parent=${data.folder_parent_id}]`).removeClass('d-none');
        $(exsCard).find(`.${folderType}[name="folder_main"]`).val(data.folder_id);

        $(exsCard).find('.exs_edit_field[name="ref_ball"]').val(data.ref_ball);
        let ageValue = ['', ''];
        try {
            let tmpVal = data.age.split(',');
            if (tmpVal.length == 2) {
                ageValue = tmpVal;
            }
        } catch (e) {}
        $(exsCard).find('.exs_edit_field[name="age[]"]').first().val(ageValue[0]);
        $(exsCard).find('.exs_edit_field[name="age[]"]').last().val(ageValue[1]);
        let playersAmountValue = ['', ''];
        try {
            let tmpVal = data.players_amount.split(',');
            if (tmpVal.length == 2) {
                playersAmountValue = tmpVal;
            }
        } catch (e) {}
        $(exsCard).find('.exs_edit_field[name="players_amount[]"]').first().val(playersAmountValue[0]);
        $(exsCard).find('.exs_edit_field[name="players_amount[]"]').last().val(playersAmountValue[1]);

        // CheckMultiRows(exsCard, data.play_zone, '.exs_edit_field[name="physical_qualities[]"]');

        CheckMultiRows(exsCard, data.play_zone, '.exs_edit_field[name="play_zone[]"]');
        CheckMultiRows(exsCard, data.neutral, '.exs_edit_field[name="neutral[]"]');
        CheckMultiRows(exsCard, data.touches_amount, '.exs_edit_field[name="touches_amount[]"]');
        CheckMultiRows(exsCard, data.series, '.exs_edit_field[name="series[]"]');
        CheckMultiRows(exsCard, data.pauses, '.exs_edit_field[name="pauses[]"]');

        CheckMultiRows(exsCard, data.notes, '.exs_edit_field[name="notes[]"]');

        $(exsCard).find('.exs_edit_field[name="title"]').val(data.title);
        document.descriptionEditor.setData(data.description);
        document.coachingEditor.setData(data.coaching);
    } else {
        $(exsCard).attr('data-exs', '-1');

        $(exsCard).find('#editExs').attr('data-state', '1');
        $(exsCard).find('#editExs').toggleClass('btn-secondary', false);
        $(exsCard).find('#editExs').toggleClass('btn-success', true);
        $(exsCard).find('#editExs').text('Сохранить');
        $(exsCard).find('.btns-edit').find('button').prop('disabled', true);
        $(exsCard).find('.exs_edit_field').prop('disabled', false);
        $(exsCard).find('.add-row').prop('disabled', false);
        document.descriptionEditor.disableReadOnlyMode('');
        document.coachingEditor.disableReadOnlyMode('');

        $(exsCard).find('.exs_edit_field.folder_nfb').toggleClass('d-none', true);
        $(exsCard).find('.exs_edit_field.folder_default').toggleClass('d-none', false);
        $(exsCard).find(`.folder_default[name="folder_parent"]`).val('');
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find(`.folder_default[name="folder_main"]`).val('');

        $(exsCard).find('.exs_edit_field').val('');
        document.descriptionEditor.setData('');
        document.coachingEditor.setData('');

        CheckMultiRows(exsCard, '', '.exs_edit_field[name="play_zone[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="neutral[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="touches_amount[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="series[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="pauses[]"]');

        CheckMultiRows(exsCard, '', '.exs_edit_field[name="notes[]"]');
    }
}

let exercises = {"nfb": {}};
function LoadFolderExercises() {
    let activeRow = $('.folders_list').find('.list-group-item.active');
    let activeNfbRow = $('.folders_nfb_list').find('.list-group-item.active');
    if (activeRow.length <= 0 && activeNfbRow.length <= 0) {return;}
    let isNfbExs = activeNfbRow.length > 0;
    let cFolderId = !isNfbExs ? $(activeRow).find('.folder-elem').attr('data-id') : $(activeNfbRow).find('.folder-nfb-elem').attr('data-id');
    let tExs = !isNfbExs ? exercises : exercises['nfb'];
    if (cFolderId in tExs) {
        RenderFolderExercises(cFolderId, tExs);
    } else {
        let data = {'get_exs_all': 1, 'folder': cFolderId, 'get_nfb': isNfbExs ? 1 : 0};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            data: data,
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (res.success) {
                    tExs[cFolderId] = res.data;
                } else {
                    tExs[cFolderId] = [];
                }
            },
            error: function (res) {
                tExs[cFolderId] = [];
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
                RenderFolderExercises(cFolderId, tExs);
            }
        });
    }
}
function RenderFolderExercises(id, tExs) {
    let exs = tExs[id];
    let exsHtml = "";
    for (let i = 0; i < exs.length; i++) {
        let exElem = exs[i];
        exsHtml += `
        <li class="exs-elem list-group-item py-2" data-id="${exElem.id}" data-folder="${exElem.folder}">
            <div class="row">
                <div class="col-12">
                    <span>${i+1}. Упражнение "ID:${exElem.id}", автор: ${exElem.user}</span>
                </div>
            </div>
        </li>
        `;
    }
    if (exs.length == 0) {exsHtml = `<li class="list-group-item py-2">В данной папке упр-ий нет.</li>`;}
    $('.exs-list-group').html(exsHtml);
}

$(function() {
    // Toggle upper buttons panel
    $('button.up-filter-elem').on('click', (e) => {
        let id = $(e.currentTarget).attr('data-id');
        let state = $(e.currentTarget).attr('data-state') == '1';
        $(e.currentTarget).toggleClass('btn-secondary', state);
        $(e.currentTarget).toggleClass('btn-primary', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        ToggleUpFilter(id, !state);
    });

    // Toggle side filter elements
    $('.side-filter-block').on('click', '.side-filter-elem', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        $(e.currentTarget).toggleClass('active', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
    });

    // Choose exs folder
    $('.folders_list').on('click', '.list-group-item', (e) => {
        $('.folders_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active');
        LoadFolderExercises();
    });
    $('.folders_nfb_list').on('click', '.list-group-item', (e) => {
        $('.folders_nfb_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active');
        LoadFolderExercises();
    });
    $(document).keypress((e) => {
        if ($('#exerciseCardModal').hasClass('show')) {return;}
        let currentList = $('.up-filter-elem[data-id="nfb_folders"]').attr('data-state') == '1' ? ".folders_nfb_list" : ".folders_list";
        let activeElem = $(currentList).find('.list-group-item.active');
        if (e.which == 119) { // w
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).prev().addClass('active');
            } else {
                $(currentList).find('.list-group-item').last().addClass('active');
            }
        }
        if (e.which == 115) { // s
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).next().addClass('active');
            } else {
                $(currentList).find('.list-group-item').first().addClass('active');
            }
        }
        LoadFolderExercises();
    });

    // Choose exercise
    $('.exercises-list').on('click', '.exs-elem', (e) => {
        if ($(e.currentTarget).hasClass('active')) {return;}
        $('.exercises-list').find('.exs-elem').removeClass('active');
        $(e.currentTarget).addClass('active');
        let exsId = $(e.currentTarget).attr('data-id');
        let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
        let data = {'get_exs_one': 1, 'exs': exsId, 'get_nfb': fromNfbFolder ? 1 : 0};
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
    });

    // Toggle video / animation panels
    $('#toggleVideoPanel').on('click', (e) => {
        if ($(e.currentTarget).hasClass('btn-secondary')) {
            $(e.currentTarget).removeClass('btn-secondary');
            $(e.currentTarget).addClass('btn-primary');
            $('#toggleAnimationPanel').removeClass('btn-primary');
            $('#toggleAnimationPanel').addClass('btn-secondary');
            $('div.exs-video').removeClass('d-none');
            $('div.exs-animation').addClass('d-none');
        }
    });
    $('#toggleAnimationPanel').on('click', (e) => {
        if ($(e.currentTarget).hasClass('btn-secondary')) {
            $(e.currentTarget).removeClass('btn-secondary');
            $(e.currentTarget).addClass('btn-primary');
            $('#toggleVideoPanel').removeClass('btn-primary');
            $('#toggleVideoPanel').addClass('btn-secondary');
            $('div.exs-animation').removeClass('d-none');
            $('div.exs-video').addClass('d-none');
        }
    });

    // Open exercise's card
    $('div.exs_drawing').on('click', (e) => {
        if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
            $('#exerciseCardModal').modal('show');
        }
    });
    $('#createExercise').on('click', (e) => {
        RenderExerciseOne(null);
        $('#exerciseCardModal').modal('show');
    });
    $('#exerciseCardModal').on('contextmenu', (e) => {
        e.preventDefault();
    });
    $('#exerciseCardModal').on('click', '#openDescription', (e) => {
        $('#exerciseCardModal').find('#openContent').removeClass('btn-success');
        $('#exerciseCardModal').find('#openContent').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-success');
        $('#exerciseCardModal').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal').find('#cardBlock > #card_description').addClass('show active');
    });
    $('#exerciseCardModal').on('click', '#openContent', (e) => {
        $('#exerciseCardModal').find('#openDescription').removeClass('btn-success');
        $('#exerciseCardModal').find('#openDescription').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-success');
        $('#exerciseCardModal').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal').find('#cardBlock > #card_content').addClass('show active');
    });
    // Load CkEditor fields
    // editor.setData( '<p>Some text.</p>' );
    // const data = editor.getData();
    let cLang = $('#select-language').val();
    ClassicEditor
        .create(document.querySelector('#descriptionEditor'), {
            language: cLang
        })
        .then(editor => {
            document.descriptionEditor = editor;
        })
        .catch(err => {
            console.error(err);
        });
    ClassicEditor
        .create(document.querySelector('#coachingEditor'), {
            language: cLang
        })
        .then(editor => {
            document.coachingEditor = editor;
        })
        .catch(err => {
            console.error(err);
        });
    $('#exerciseCardModal').on('click', '#editExs', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        if (state) {
            let exsId = $('#exerciseCardModal').attr('data-exs');
            let dataToSend = {'edit_exs': 1, 'exs': exsId, 'data': {}};
            $('#exerciseCardModal').find('.exs_edit_field').each((ind, elem) => {
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
            dataToSend.data['description'] = document.descriptionEditor.getData();
            dataToSend.data['coaching'] = document.coachingEditor.getData();
            if (dataToSend.data.title == "") {
                alert('Добавьте название для упп-ия.');
                return;
            }
            if (dataToSend.data.folder_parent == "" || dataToSend.data.folder_main == "") {
                alert('Выберите папку для упр-ия.');
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
                        alert('Упражнение успешно создано / изменено.');
                        window.location.reload();
                    } else {
                        alert(`При создании / изменении упр-ия произошла ошибка (${res.err}).`);
                    }
                },
                error: function (res) {
                    alert('Упражнение не удалось создать / изменить.');
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        } else {
            $(e.currentTarget).attr('data-state', '1');
            $(e.currentTarget).toggleClass('btn-secondary', state);
            $(e.currentTarget).toggleClass('btn-success', !state);
            $(e.currentTarget).text('Сохранить');
            $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', false);
            $('#exerciseCardModal').find('.add-row').prop('disabled', false);
            document.descriptionEditor.disableReadOnlyMode('');
            document.coachingEditor.disableReadOnlyMode('');
        }
    });
    $('#exerciseCardModal').on('change', '[name="folder_parent"]', (e) => {
        let tId = $(e.currentTarget).val();
        $('#exerciseCardModal').find('[name="folder_main"]').val('');
        $('#exerciseCardModal').find('[name="folder_main"]').find('option').addClass('d-none');
        $('#exerciseCardModal').find('[name="folder_main"]').find(`option[data-parent=${tId}]`).removeClass('d-none');
    });
    $('#exerciseCardModal').on('click', '.row-select', (e) => {
        if (!$(e.target).is('td')) {return;}
        let isOn = !$(e.currentTarget).hasClass('active');
        $("#exerciseCardModal").find('tr.row-select').removeClass('active');
        $(e.currentTarget).toggleClass('active', isOn);
    });
    $('#exerciseCardModal').on('click', '.add-row', (e) => {
        let groupNum = $(e.currentTarget).attr('data-num');
        let fRow = $('#exerciseCardModal').find(`.row-select.row-group-${groupNum}.active`);
        if ($(fRow).length > 0) {
            let cTd = $(fRow).find('.exs_edit_field').first().parent();
            let cloneField = $(fRow).find('.exs_edit_field').first().clone();
            $(cloneField).val('');
            $(cTd).append(cloneField);
        } else {
            alert('Выберите строку из соответ. колонки.');
        }
    });
    $('#exerciseCardModal').on('mouseup', '.exs_edit_field', (e) => {
        if ($(e.currentTarget).parent().parent().hasClass('row-select')) {
            let cVal = $(e.currentTarget).val();
            // e.which = 3 -> Right mouse buttom
            if (cVal == "" && e.which == 3 && $(e.currentTarget).parent().find('.exs_edit_field').length > 1) {
                $(e.currentTarget).remove();
            }
        }
    });


    // Split columns
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols'));
    if (!window.dataForSplit) {
        window.dataForSplit = [15, 35, 40, 10];
        localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
    }
    RenderSplitCols();


    // Copy Exs
    let foldersLoadedForCopy = false;
    $('#exerciseCopyModal').on('show.bs.modal', (e) => {
        if (!foldersLoadedForCopy) {
            let tList = $('.exercises-list').find('.folders_list').clone();
            $(tList).removeClass('d-none');
            $(tList).removeClass('folders_list');
            $(tList).addClass('folders_list_copy');
            $(tList).find('.folder-elem').addClass('folder-copy-elem');
            $(tList).find('.folder-elem').removeClass('folder-elem');
            $(tList).find('.pull-right').remove();
            $('#exerciseCopyModal').find('.modal-body').html(tList);
            foldersLoadedForCopy = true;
        }
    });
    $('#exerciseCopyModal').on('hidden.bs.modal', (e) => {
        $('.up-filter-elem[data-id="copy"]').removeClass('btn-primary');
        $('.up-filter-elem[data-id="copy"]').addClass('btn-secondary');
        $('.up-filter-elem[data-id="copy"]').attr('data-state', '0');
        $('#exerciseCopyModal').find('.folder-copy-elem').parent().removeClass('active');
    });
    $('#exerciseCopyModal').on('click', '.folder-copy-elem', (e) => {
        if ($(e.currentTarget).attr('data-root') != "1") {
            $('#exerciseCopyModal').find('.folder-copy-elem').parent().removeClass('active');
            $(e.currentTarget).parent().addClass('active');
        }
    });
    $('#exerciseCopyModal').on('click', '.btn-apply', (e) => {
        if ($('#exerciseCopyModal').find('.list-group-item.active').length > 0) {
            let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
            let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
            let selectedFolder = $('#exerciseCopyModal').find('.list-group-item.active').find('.folder-copy-elem').attr('data-id');
            let data = {'copy_exs': 1, 'exs': exsId, 'nfb_folder': fromNfbFolder ? 1 : 0, 'folder': selectedFolder};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "exercises_api",
                success: function (res) {
                    if (res.data.success) {
                        alert('Упражнение успешно скопировано. Обновите страницу, чтобы увидеть данное упражение.');
                    } else {
                        alert('Упражнение скопировать не удалось.');
                        console.log(res);
                    }
                },
                error: function (res) {
                    alert('Упражнение скопировать не удалось.');
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                    $('#exerciseCopyModal').modal('hide');
                }
            });
        }
    });



});
