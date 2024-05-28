function RenderSplitCols() {
    $('.exercises-list').find('div.gutter').remove();
    let sizesArr = window.dataForSplit;
    window.split = Split(['#splitCol_0', '#splitCol_1'], {
        sizes: sizesArr,
        gutterSize: 12,
        onDrag: () => {
            let lastColWidth = 0;
            // try {
            //     let sizes = window.split.getSizes();
            //     lastColWidth = sizes[2];
            // } catch(e) {}
            // if (lastColWidth > 0) {
            //     $('#splitCol_2').css('width', `calc(${lastColWidth}% + 20px)`);
            // }
        },
        onDragEnd: (arr) => {
            if (!$('#toggleFoldersNames').attr('data-state') == '1' && false) {
                let oldValue = arr[0];
                arr[0] *= 2; let diff = oldValue - arr[0];
                arr[1] += diff;
            }
            window.dataForSplit = arr;
            localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
        }
    });
    let stateColSize = $('.up-tabs-elem[data-id="cols_size"]').attr('data-state') == '1';
    // $('.exercises-list').find('div.gutter').toggleClass('d-none', !stateColSize);
    $('.exercises-list').find('div.gutter').toggleClass('d-none', false);
    $('.exercises-list').find('div.gutter').addClass('my-2');
    ResizeSplitCols();
}

function ToggleFoldersNames() {
    let state = $('#toggleFoldersNames').attr('data-state') == '1' && false;
    $('.folders-block').find('.folder-elem').each((ind, elem) => {
        let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
        $(elem).find('.folder-title').text(tmpText);
    });
    $('.folders-block').find('.folder-nfb-elem').each((ind, elem) => {
        let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
        $(elem).find('.folder-title').text(tmpText);
    });
    $('.folders-block').find('.folder-club-elem').each((ind, elem) => {
        let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
        $(elem).find('.folder-title').text(tmpText);
    });
    $('#toggleFoldersNames').attr('data-state', state ? '0' : '1');
    $('#toggleFoldersNames').toggleClass('selected', !state);
    ResizeSplitCols();
    ToggleFoldersView(false, true);
}

function ResizeSplitCols() {
    let state = $('#toggleFoldersNames').attr('data-state') == '1' || true;
    let lastColWidth = 0;
    try {
        let sizes = window.split.getSizes();
        // if (!state) {
        //     let oldValue = sizes[0];
        //     sizes[0] /= 2; let diff = oldValue - sizes[0];
        //     sizes[1] += diff;
        // } else {
        //     let oldValue = sizes[0];
        //     sizes[0] *= 2; let diff = oldValue - sizes[0];
        //     sizes[1] += diff;
        // }
        // window.split.setSizes(sizes);
        // lastColWidth = sizes[2];
    } catch(e) {}
    // if (lastColWidth > 0) {
    //     $('#splitCol_2').css('width', `calc(${lastColWidth}% + 20px)`);
    // }
    // let colWidth = !state ? `calc(${$('#splitCol_0').css('width')} / 2)` : `calc(${$('#splitCol_2').css('width')} * 2)`;
    // $('#splitCol_0').css('width', colWidth);
}

let exercises = {"nfb": {}};
window.exercisesFilter = {};
function LoadFolderExercises() {
    if ($('.selected-exercise-panel').find('li').length > 0) {
        CopyOrMoveAjax();
        return;
    }
    let activeRow = $('.folders_list').find('.list-group-item.active');
    let isClub = false;
    let isTrainer = $('.up-tabs-elem[data-id="trainer_folders"]').length > 0 && !$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none');
    if (activeRow.length <= 0) {
        activeRow = $('.folders_club_list').find('.list-group-item.active');
        isClub = true;
    }
    let activeNfbRow = $('.folders_nfb_list').find('.list-group-item.active');
    if (activeRow.length <= 0 && activeNfbRow.length <= 0 && !isTrainer) {return;}
    let isNfbExs = activeNfbRow.length > 0;
    let fType = $('.folders-block').find('.folders_div.selected').attr('data-id');
    let folderElemStr = isClub ? '.folder-club-elem' : '.folder-elem';
    let cFolderId = !isNfbExs ? $(activeRow).find(folderElemStr).attr('data-id') : $(activeNfbRow).find('.folder-nfb-elem').attr('data-id');
    let tExs = !isNfbExs ? exercises : exercises['nfb'];
    if (cFolderId in tExs) {
        RenderFolderExercises(cFolderId, tExs);
    } else {
        if (isTrainer) {
            cFolderId = "trainer";
            fType = "__is_trainer";
        }
        let data = {'get_exs_all': 1, 'folder': cFolderId, 'get_nfb': isNfbExs ? 1 : 0, 'f_type': fType, 'filter': window.exercisesFilter};
        $('.page-loader-wrapper').fadeIn();
        let tCall = $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "/exercises/exercises_api",
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
                HideCopiedNFExs();
                if (fType == "__is_trainer") {
                    CountAllExsInList();
                } else {
                    if (window.lastExercise && window.lastExercise.exs) {
                        CountExsInFolder();
                        window.lastExercise = null;
                    } else {
                        CountExsInFolder(true, true);
                    }
                }
            }
        });
        PauseCountExsCalls(tCall);
    }
}

function RenderFolderExercises(id, tExs) {
    let exs = tExs[id];
    let exsHtml = "";
    $('.exs_counter').html(exs.length > 0 ? `(${exs.length})` : "(...)");
    $('.folders-block').find('.list-group-item.active').find('.folder-exs-counter').html(exs.length > 0 ? exs.length : "...");
    for (let i = 0; i < exs.length; i++) {
        let exElem = exs[i];
        let fieldKeywordFirst = null; let fieldKeywordSecond = null;
        try {
            fieldKeywordFirst = exElem.field_keyword_a;
        } catch(e) {}
        try {
            fieldKeywordSecond = exElem.field_keyword_b;
        } catch(e) {}
        let isField = false;
        try {
            isField = exElem.field_fields[0];
        } catch(e) {}
        let isIQ = false;
        try {
            isIQ = exElem.field_cognitive_loads[0].toUpperCase().replace('_', '-');
        } catch(e) {}
        let isGoalBig = false;
        let isGoalSmall = false;
        try {
            isGoalBig = exElem.field_goal.includes('g_big');
        } catch(e) {}
        try {
            isGoalSmall = exElem.field_goal.includes('g_small');
        } catch(e) {}
        exsHtml += `
        <li class="exs-elem list-group-item py-1 px-0 ${exElem.clone_nfb_id ? 'nf-cloned' : ''} ${exElem.blocked ? 'exs-blocked' : ''}" data-id="${exElem.id}" data-folder="${exElem.folder}">
            <div class="row w-100">
                <div class="col-12 d-flex px-0">
                    <span class="ml-3 w-100">
                        <span class="num">${i+1}.</span>
                        <span class="title">
                            ${exElem.title == "" ? "-- None --" : exElem.title}
                        </span>
                    </span>
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x ${exElem.favorite ? 'selected' : ''}" data-type="marker" data-id="favorite" style="--w-x:24px; min-width: 38px; --h-x:24px;" title="Избранное">
                        <span class="icon-custom ${exElem.favorite == true ? 'icon--favorite-selected' : 'icon--favorite'}" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    ${isGoalBig ? `
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x" data-type="marker" data-id="goal" title="Ворота">
                        <span class=""> G </span>
                    </button>
                    ` : ``}
                    ${isGoalSmall ? `
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x" data-type="marker" data-id="goal" title="Ворота">
                        <span class=""> g </span>
                    </button>
                    ` : ``}
                    ${exElem.trainer_exs_copied ? `
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x" data-type="marker" data-id="trainer_copied" title="Уже скопировано!">
                        X2
                    </button>
                    ` : ``}
                    ${exElem.in_trainer_folder ? `
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x" data-type="marker" data-id="trainer" data-val="1" title="Убрать из архива">
                        <i class="fa fa-lg fa-file-archive-o" aria-hidden="true" style="opacity: 1;"></i>
                    </button>
                    ` : true ? `` : `
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x" data-type="marker" data-id="trainer" data-val="0" title="Добавить в архив">
                        <i class="fa fa-lg fa-file-archive-o" aria-hidden="true" style="opacity: .4;"></i>
                    </button>
                    `}
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x ${exElem.video_1_watched ? 'selected' : ''}" data-type="marker" data-id="watched" title="Смотрел / Не смотрел">
                        <input type="checkbox" class="form-check-input" ${exElem.video_1_watched ? 'checked=""': ''}>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="players" style="--w-x:24px; min-width: 54px; --h-x:24px;" disabled="">
                        <div class="row w-100">
                            ${exElem.field_players_a == exElem.field_players_b ? `
                            <div class="col-12 px-0 text-center">
                                ${exElem.field_players_a ? exElem.field_players_a : ''}
                            </div>
                            ` : `
                            <div class="col-5 px-0 text-center">
                                ${exElem.field_players_a ? exElem.field_players_a : ''}
                            </div>
                            <div class="col-2 px-0 text-center">-</div>
                            <div class="col-5 px-0 text-center">
                                ${exElem.field_players_b ? exElem.field_players_b : ''}
                            </div>
                            `}
                        </div>
                    </button>
                    ${((fieldKeywordFirst && fieldKeywordFirst != "") || (fieldKeywordSecond && fieldKeywordSecond != "")) ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="keywords" style="--w-x:24px; min-width: 150px; --h-x:24px;" disabled="">
                            <div class="row w-100">
                                <div class="col-12 px-0 text-center">
                                    ${fieldKeywordFirst && fieldKeywordFirst != "" ? fieldKeywordFirst : ''}
                                </div>
                            </div>
                        </button>
                    ` : `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="keywords" style="--w-x:24px; min-width: 150px; --h-x:24px;" disabled="">
                            <div class="row w-100">
                                <div class="col-12 px-0 text-center">
                                    ...
                                </div>
                            </div>
                        </button>
                    `}
                    ${isField ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="field" style="--w-x:24px; min-width: 40px; --h-x:24px;" disabled="">
                            ${isField == "field_0" ? "1" : isField == "field_1" ? "1/2" : "..."}
                        </button>
                    ` : `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="field" style="--w-x:24px; min-width: 40px; --h-x:24px;" disabled="">
                            ...
                        </button>
                    `}
                    ${isIQ ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="iq" style="--w-x:24px; min-width: 50px; --h-x:24px;" disabled="">
                            ${isIQ}
                        </button>
                    ` : `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="iq" style="--w-x:24px; min-width: 50px; --h-x:24px;" disabled="">
                            ...
                        </button>
                    `}
                    ${exElem.has_notes == true ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" style="--w-x:24px; min-width: 24px; --h-x:24px;" disabled="" title="Есть примечания!">
                            <i class="fa fa-pencil text-danger" aria-hidden="true"></i>
                        </button>
                    ` : `
                    `}
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x ${exElem.opt_has_video == true ? 'selected' : ''}" data-type="icons" data-info="admin_options" data-id="opt_has_video" style="--w-x:24px; --h-x:24px;" title="Есть видео">
                        <input type="checkbox" value="" ${exElem.opt_has_video == true ? 'checked' : ''}>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x ${exElem.opt_has_animation == true ? 'selected' : ''}" data-type="icons" data-info="admin_options" data-id="opt_has_animation" style="--w-x:24px; --h-x:24px;" title="Есть анимация">
                        <input type="checkbox" value="" ${exElem.opt_has_animation == true ? 'checked' : ''}>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x ${exElem.opt_has_description == true ? 'selected' : ''}" data-type="icons" data-info="admin_options" data-id="opt_has_description" style="--w-x:24px; --h-x:24px;" title="Есть описание">
                        <input type="checkbox" value="" ${exElem.opt_has_description == true ? 'checked' : ''}>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x ${exElem.opt_has_scheme == true ? 'selected' : ''}" data-type="icons" data-info="admin_options" data-id="opt_has_scheme" style="--w-x:24px; --h-x:24px;" title="Есть схема">
                        <input type="checkbox" value="" ${exElem.opt_has_scheme == true ? 'checked' : ''}>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x ${exElem.visible == true ? 'selected' : ''}" data-type="icons" data-info="admin_options" data-id="visible" style="--w-x:24px; --h-x:24px;" title="Видно всем">
                        <input type="checkbox" value="" ${exElem.visible == true ? 'checked' : ''}>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x ${exElem.visible_demo == true ? 'selected' : ''}" data-type="icons" data-info="admin_options" data-id="visible_demo" style="--w-x:24px; --h-x:24px;" title="Видно всем (для демо-режима версии)">
                        <input type="checkbox" value="" ${exElem.visible_demo == true ? 'checked' : ''}>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="id" style="--w-x:24px; min-width: 24px; --h-x:24px;" disabled="" title="ID упражнения">
                        ${exElem.id}
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="lang" style="--w-x:24px; min-width: 24px; --h-x:24px;" title="">
                        <i class="fa fa-globe" aria-hidden="true"></i>
                    </button>
                    ${exElem.trainings_count >= 0 ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="" data-id="" style="--w-x:24px; min-width: 24px; --h-x:24px;" title="">
                            <span style="${exElem.clone_nfb_id ? '' : 'color:#ad2d2d;'}">[${exElem.trainings_count}]</span>
                        </button>
                    ` : ''}
                    ${exElem.blocked ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="" data-id="" style="--w-x:24px; min-width: 24px; --h-x:24px;" title="">
                            <span style="" title="Данное упражнение недоступно для демо-версии">?</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        </li>
        `;
    }
    if (exs.length == 0) {exsHtml = `<li class="list-group-item py-2">В данной папке упр-ий нет.</li>`;}
    $('.exs-list-group').html(exsHtml);
    // временно, упр-ия не кешируются
    exercises = {"nfb": {}};

    ToggleIconsInExs();
    ToggleMarkersInExs();

    try {
        RenderSelectedExercisesForDelete();
    } catch(e) {}

    if (window.lastExercise && window.lastExercise.exs) {
        $('.exs-list-group').find(`.exs-elem[data-id="${window.lastExercise.exs}"]`).click();
    }
}

// Handler for func LoadExerciseOne in exercise card:
function LoadExerciseOneHandler() {
    let activeExs = $('.exercises-list').find('.exs-elem.active:not(.exs-blocked)');
    if ($(activeExs).length <= 0) {return;}
    let cId = $(activeExs).attr('data-id');
    let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
    let folderType = $('.folders_div.selected').attr('data-id');
    let isTrainer = $('.up-tabs-elem[data-id="trainer_folders"]').length > 0 && !$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none');
    if (isTrainer) {
        folderType = "__is_trainer";
    }
    LoadExerciseOne(cId, fromNFB, folderType);
    if (folderType != "__is_trainer") {
        CountExsInFolder(true, true);
    }
    try {
        LoadContentInCardModalForEdit(cId, folderType);
    } catch(e) {}
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
    let exsCard = $('#exerciseCardModal');
    if (data && data.id) {
        let folderType = data.nfb ? "folder_nfb" : "folder_default";

        $(exsCard).attr('data-exs', data.id);
        // $(exsCard).find('#saveExs').toggleClass('d-none', data.nfb);

        // $(exsCard).find('.btn-only-edit').prop('disabled', false);
        // $(exsCard).find('.exs_edit_field').prop('disabled', true);
        // $(exsCard).find('.add-row').prop('disabled', true);
        // document.descriptionEditor.enableReadOnlyMode('');

        $(exsCard).find('.exs_edit_field.folder_nfb').toggleClass('d-none', !data.nfb);
        $(exsCard).find('.exs_edit_field.folder_default').toggleClass('d-none', data.nfb);
        $(exsCard).find(`.${folderType}[name="folder_parent"]`).val(data.folder_parent_id);
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find('[name="folder_main"]').find(`option[data-parent=${data.folder_parent_id}]`).removeClass('d-none');
        $(exsCard).find(`.${folderType}[name="folder_main"]`).val(data.folder_id);

        $(exsCard).find('.exs_edit_field[name="ref_ball"]').val(data.ref_ball);
        $(exsCard).find('.exs_edit_field[name="ref_goal"]').val(data.ref_goal);
        $(exsCard).find('.exs_edit_field[name="ref_workout_part"]').val(data.ref_workout_part);
        $(exsCard).find('.exs_edit_field[name="ref_cognitive_load"]').val(data.ref_cognitive_load);
        $(exsCard).find('.exs_edit_field[name="ref_age_category"]').val(data.ref_age_category);
        let playersAmount = "";
        try {
            playersAmount = data.players_amount[0];
        } catch (e) {}
        $(exsCard).find('.exs_edit_field[name="players_amount"]').val(playersAmount);
        $(exsCard).find('.exs_edit_field[name="ref_source"]').val(data.ref_source);

        CheckMultiRows(exsCard, data.condition, '.exs_edit_field[name="conditions[]"]');
        CheckMultiRows(exsCard, data.stress_type, '.exs_edit_field[name="stress_type[]"]');
        CheckMultiRows(exsCard, data.purpose, '.exs_edit_field[name="purposes[]"]');
        CheckMultiRows(exsCard, data.coaching, '.exs_edit_field[name="coaching[]"]');
        CheckMultiRows(exsCard, data.notes, '.exs_edit_field[name="notes[]"]');

        $(exsCard).find('.exs_edit_field[name="title"]').val(data.title);
        $(exsCard).find('.exs_edit_field[name="keyword"]').val(data.keyword);
        document.descriptionEditor.setData(data.description);
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
        document.descriptionEditor.disableReadOnlyMode('');

        $(exsCard).find('.exs_edit_field.folder_nfb').toggleClass('d-none', true);
        $(exsCard).find('.exs_edit_field.folder_default').toggleClass('d-none', false);
        $(exsCard).find(`.folder_default[name="folder_parent"]`).val('');
        $(exsCard).find('[name="folder_main"]').find('option').addClass('d-none');
        $(exsCard).find(`.folder_default[name="folder_main"]`).val('');

        $(exsCard).find('.exs_edit_field').val('');
        document.descriptionEditor.setData('');

        CheckMultiRows(exsCard, '', '.exs_edit_field[name="conditions[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="stress_type[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="purposes[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="coaching[]"]');
        CheckMultiRows(exsCard, '', '.exs_edit_field[name="notes[]"]');

        $('.exs-list-group').find('.list-group-item').removeClass('active');
        // clear video, animation and scheme
    }
}

function ToggleIconsInExs() {
    let isActivePlayers = $('.up-tabs-elem[data-id="players"]').attr('data-state') == "1";
    let isActiveKeywords = $('.up-tabs-elem[data-id="keywords"]').attr('data-state') == "1";
    let isActiveField = $('.up-tabs-elem[data-id="toggle_field"]').attr('data-state') == "1";
    let isActiveIQ = $('.up-tabs-elem[data-id="toggle_iq"]').attr('data-state') == "1";

    let isActiveExsAdminOpts = $('#toggleExsAdminOptions').attr('data-state') == "1";
    let isActiveExsID = $('#toggleExsID').attr('data-state') == "1";
    let isActiveLang = $('#toggleExsLangName').attr('data-state') == "1";
    $('.exercises-block').find(`[data-type="icons"]`).toggleClass('d-none', true);

    $('.exercises-block').find(`[data-type="icons"][data-id="players"]`).toggleClass('d-none', !isActivePlayers);
    $('.exercises-block').find(`[data-type="icons"][data-id="keywords"]`).toggleClass('d-none', !isActiveKeywords);
    $('.exercises-block').find(`[data-type="icons"][data-id="field"]`).toggleClass('d-none', !isActiveField);
    $('.exercises-block').find(`[data-type="icons"][data-id="iq"]`).toggleClass('d-none', !isActiveIQ);

    $('.exercises-block').find(`[data-type="icons"][data-info="admin_options"]`).toggleClass('d-none', !isActiveExsAdminOpts);
    $('.exercises-block').find(`[data-type="icons"][data-id="id"]`).toggleClass('d-none', !isActiveExsID);
    $('.exercises-block').find(`[data-type="icons"][data-id="lang"]`).toggleClass('d-none', !isActiveLang);
}
function ToggleMarkersInExs() {
    let isActiveFavorite = $('.up-tabs-elem[data-id="toggle_favorite"]').attr('data-state') == "1";
    let isActiveGoal = $('.up-tabs-elem[data-id="goal"]').attr('data-state') == "1";
    let isActiveWatched = $('.up-tabs-elem[data-id="toggle_watched"]').attr('data-state') == "1";
    let isActiveWatchedNot = $('.up-tabs-elem[data-id="toggle_watched_not"]').attr('data-state') == "1";
    let isActiveEditBlock = !$('.exs-edit-block').hasClass('d-none');
    $('.exercises-block').find(`[data-type="marker"][data-id="favorite"]`).toggleClass('d-none', !isActiveFavorite);
    $('.exercises-block').find(`[data-type="marker"][data-id="goal"]`).toggleClass('d-none', !isActiveGoal);
    $('.exercises-block').find(`[data-type="marker"][data-id="watched"]`).toggleClass('d-none', !(isActiveWatched || isActiveWatchedNot));
    $('.exercises-block').find(`[data-type="marker"][data-id="trainer"]`).toggleClass('d-none', false);
}

function PauseCountExsCalls(currentCall) {
    let restartCallsList = [];
    for (let i in window.count_exs_calls) {
        let call = window.count_exs_calls[i]['call'];
        if (call.status != 200) {
            restartCallsList.push(window.count_exs_calls[i]);
        }
        call.abort();
    }
    if (restartCallsList.length > 0) {
        $(document).ajaxComplete((event,request, settings) => {
            if (request == currentCall) {
                RestartCountExsInFolders(restartCallsList);
            }
        });
    }
}

function ToggleFoldersView(saveView, ignoreViewStatus=false) {
    if (saveView) {
        let data = {'folder-elem': [], 'folder-nfb-elem': [], 'folder-club-elem': []};
        $('.folders_div').find('.folder-elem').each((ind, elem) => {
            let isRoot = $(elem).parent().hasClass('root-elem');
            let isVisible = !$(elem).parent().hasClass('d-none');
            if (!isRoot || true) {
                data['folder-elem'].push({'id': $(elem).attr('data-id'), 'visible': isVisible});
            }
        });
        $('.folders_div').find('.folder-nfb-elem').each((ind, elem) => {
            let isRoot = $(elem).parent().hasClass('root-elem');
            let isVisible = !$(elem).parent().hasClass('d-none');
            if (!isRoot || true) {
                data['folder-nfb-elem'].push({'id': $(elem).attr('data-id'), 'visible': isVisible});
            }
        });
        $('.folders_div').find('.folder-club-elem').each((ind, elem) => {
            let isRoot = $(elem).parent().hasClass('root-elem');
            let isVisible = !$(elem).parent().hasClass('d-none');
            if (!isRoot || true) {
                data['folder-club-elem'].push({'id': $(elem).attr('data-id'), 'visible': isVisible});
            }
        });
        // sessionStorage.setItem("folders_views", JSON.stringify(data));
    } else {
        if (window.foldersViewStatus && !ignoreViewStatus) {return;}
        // let data = {};
        // try {
        //     data = JSON.parse(sessionStorage.getItem("folders_views"));
        // } catch(e) {}
        let setDefaultFoldersVisible = true;
        // for (let key in data) {
        //     data[key].forEach(elem => {
        //         $('.folders_div').find(`.${key}[data-id="${elem['id']}"]`).parent().toggleClass('d-none', !elem['visible']);
        //         setDefaultFoldersVisible = false;
        //     });
        // }
        if (setDefaultFoldersVisible) {
            $('.folders_div').find('li.list-group-item').each((ind, elem) => {
                let isRoot = $(elem).hasClass('root-elem');
                if (isRoot) {
                    $(elem).toggleClass('d-none', true);
                } else {
                    $(elem).toggleClass('d-none', false);
                }
            });
            ToggleFoldersView(true);
        }
        window.foldersViewStatus = true;
    }
}



$(function() {

    // Toggle columns size
    $('#columnsSizeToggle').on('click', (e) => {
        // $('.exercises-list').find('div.gutter').toggleClass('d-none');
    });


    // Choose exs folder
    $('.folders_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        let isRoot = $(e.currentTarget).hasClass('root-elem');
        if (isRoot) {
            let cId = $(e.currentTarget).find('.folder-elem').attr('data-id');
            let isVisible = !$('.folders_div').find(`.folder-elem[data-parent="${cId}"]`).parent().hasClass('d-none');
            $('.folders_div').find(`.folder-elem[data-parent="${cId}"]`).parent().toggleClass('d-none', isVisible);
            ToggleFoldersView(true);
        } else {
            $('.folders_list').find('.list-group-item').removeClass('active');
            $(e.currentTarget).toggleClass('active', !isActive);
            if (!isActive) {LoadFolderExercises();}
            else {
                $('.exs_counter').html("(...)");
                CountExsInFoldersByType();
                $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
            }
        }
    });
    $('.folders_nfb_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        let isRoot = $(e.currentTarget).hasClass('root-elem');
        if (isRoot) {
            let cId = $(e.currentTarget).find('.folder-nfb-elem').attr('data-id');
            let isVisible = !$('.folders_div').find(`.folder-nfb-elem[data-parent="${cId}"]`).parent().hasClass('d-none');
            $('.folders_div').find(`.folder-nfb-elem[data-parent="${cId}"]`).parent().toggleClass('d-none', isVisible);
            ToggleFoldersView(true);
        } else {
            $('.folders_nfb_list').find('.list-group-item').removeClass('active');
            $(e.currentTarget).toggleClass('active', !isActive);
            if (!isActive) {LoadFolderExercises();}
            else {
                $('.exs_counter').html("(...)");
                CountExsInFoldersByType();
                $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
            }
        }
    });
    $('.folders_club_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        let isRoot = $(e.currentTarget).hasClass('root-elem');
        if (isRoot) {
            let cId = $(e.currentTarget).find('.folder-club-elem').attr('data-id');
            let isVisible = !$('.folders_div').find(`.folder-club-elem[data-parent="${cId}"]`).parent().hasClass('d-none');
            $('.folders_div').find(`.folder-club-elem[data-parent="${cId}"]`).parent().toggleClass('d-none', isVisible);
            ToggleFoldersView(true);
        } else {
            $('.folders_club_list').find('.list-group-item').removeClass('active');
            $(e.currentTarget).toggleClass('active', !isActive);
            if (!isActive) {LoadFolderExercises();}
            else {
                $('.exs_counter').html("(...)");
                CountExsInFoldersByType();
                $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
            }
        }
    });
    $('.folders_trainer_list').on('click', '.list-group-item', (e) => {
        function copyArchivedExs(activeExs, selectedElem, curTarget, copyAnyway) {
            let data = {
                'move_exs': 0,
                'copy_exs': 1,
                'move_mode': "",
                'exs': $(activeExs).attr('data-id'), 
                'nfb_folder': 0,
                'team': $(selectedElem).attr('data-team'),
                'folder': $(selectedElem).attr('data-id'),
                'type': "__is_trainer",
                'copy_anyway': copyAnyway
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "exercises_api",
                success: function (res) {
                    if (res.success) {
                        $(curTarget).toggleClass('active', false);
                        swal("Готово", "Упражнение добавлено в выбранную папку.", "success");
                    } else {
                        if (res.data == "exist") {
                            swal({
                                title: "Внимание!",
                                text: "Данное упражнение уже есть в этой папке. Вы уверены?",
                                icon: "warning",
                                buttons: ["Отмена", "Да"],
                                dangerMode: false,
                            }).then((accepted) => {
                                if (!accepted) {
                                    $(e.currentTarget).toggleClass('active', false);
                                    return;
                                }
                                copyArchivedExs(activeExs, selectedElem, e.currentTarget, 1);
                            });
                        } else {
                            swal("Ошибка", "Упражнение не удалось добавить.", "error");
                            console.log(res);
                        }
                    }
                },
                error: function (res) {
                    $(curTarget).toggleClass('active', false);
                    swal("Ошибка", "Упражнение не удалось добавить.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }

        if ($(e.currentTarget).find('.trainer-folder-elem-team').length > 0) {
            let cTeamId = $(e.currentTarget).find('.trainer-folder-elem-team').attr('data-team');
            $('.folders_trainer_list').find(`.trainer-folder-elem[data-team="${cTeamId}"]`).parent().toggleClass('d-none');
            return;
        }
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        let selectedElem = $(e.currentTarget).find('.trainer-folder-elem');
        if ($(activeExs).length == 0) {
            swal("Внимание", "Выберите упражнение из списка.", "info");
            return;
        }
        $(e.currentTarget).toggleClass('active', true);
        swal({
            title: "Внимание!",
            text: "Вы точно хотите добавить текущее упражнение в выбранную папку?",
            icon: "warning",
            buttons: ["Отмена", "Да"],
            dangerMode: false,
        }).then((accepted) => {
            if (!accepted) {
                $(e.currentTarget).toggleClass('active', false);
                return;
            }
            copyArchivedExs(activeExs, selectedElem, e.currentTarget, 0);
        });
    });
    ToggleFoldersView(false);

    let cLang = $('#select-language').val();
    try {
        let watchdog_descriptionEditorViewFromFolders = new CKSource.EditorWatchdog();
		watchdog_descriptionEditorViewFromFolders.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditorViewFromFolders = editor;
                document.descriptionEditorViewFromFolders.enableReadOnlyMode('');
                $('#descriptionEditorViewFromFolders').next().find('.ck-editor__top').addClass('d-none');
                $('#descriptionEditorViewFromFolders').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
				return editor;
			})
		});
        watchdog_descriptionEditorViewFromFolders.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditorViewFromFolders.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditorViewFromFolders
		.create(document.querySelector('#descriptionEditorViewFromFolders'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch (e) {}
    try {
        let watchdog_descriptionEditorViewFromFoldersTrainer = new CKSource.EditorWatchdog();
		watchdog_descriptionEditorViewFromFoldersTrainer.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditorViewFromFoldersTrainer = editor;
                document.descriptionEditorViewFromFoldersTrainer.enableReadOnlyMode('');
                $('#descriptionEditorViewFromFoldersTrainer').next().find('.ck-editor__top').addClass('d-none');
                $('#descriptionEditorViewFromFoldersTrainer').next().find('.ck-content.ck-editor__editable').addClass('borders-off');
				return editor;
			})
		});
        watchdog_descriptionEditorViewFromFoldersTrainer.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditorViewFromFoldersTrainer.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditorViewFromFoldersTrainer
		.create(document.querySelector('#descriptionEditorViewFromFoldersTrainer'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
		})
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch (e) {}

    // Change exercise using keys and change content in graphic modal
    window.canChangeExs = true;
    window.canChangeGraphicsModalContent = true;
    $(document).keydown((e) => {
        let currentList = '.exs-list-group';
        let activeElem = $(currentList).find('.list-group-item.exs-elem.active');
        let loadExs = false;
        let isGraphicsModalOpen = $('#exerciseGraphicsModal').hasClass('show');
        if (e.which == 38 && window.canChangeExs) { // up
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                if ($(activeElem).prev().length > 0) {
                    $(activeElem).prev().addClass('active');
                } else {
                    $(currentList).find('.list-group-item.exs-elem:not(.exs-blocked)').last().addClass('active');
                }
            } else {
                $(currentList).find('.list-group-item.exs-elem:not(.exs-blocked)').last().addClass('active');
            }
            loadExs = true;
        }
        if (e.which == 40 && window.canChangeExs) { // down
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                if ($(activeElem).next().length > 0) {
                    $(activeElem).next().addClass('active');
                } else {
                    $(currentList).find('.list-group-item.exs-elem:not(.exs-blocked)').first().addClass('active');
                }
            } else {
                $(currentList).find('.list-group-item.exs-elem:not(.exs-blocked)').first().addClass('active');
            }
            loadExs = true;
        }
        if (e.which == 37 && isGraphicsModalOpen && canChangeGraphicsModalContent) { // left
            canChangeGraphicsModalContent = false;
            $('#exerciseGraphicsModal').find('.carousel-control-prev').trigger('click');
            setTimeout(() => {
                canChangeGraphicsModalContent = true;
            }, 500);
        }
        if (e.which == 39 && isGraphicsModalOpen && canChangeGraphicsModalContent) { // right
            canChangeGraphicsModalContent = false;
            $('#exerciseGraphicsModal').find('.carousel-control-next').trigger('click');
            setTimeout(() => {
                canChangeGraphicsModalContent = true;
            }, 500);
        }
        if (loadExs && $(currentList).find('.list-group-item.exs-elem.active').length > 0) {
            window.canChangeExs = false;
            LoadExerciseOneHandler();
            setTimeout(() => {
                $(currentList).find('.list-group-item.exs-elem.active').get(0).scrollIntoView({
                    behavior: 'instant',
                    block: 'center',
                });
            }, 250);
        }
    });
    // Open exercise using keys
    $(document).keypress((e) => {
        if (e.which == 13 && window.canChangeExs) { // enter
            $('.visual-block').find('.carousel-item:visible').first().trigger('click');
        }
    });


    // Choose exercise
    $('.exercises-list').on('click', '.exs-elem', (e) => {
        if ($(e.currentTarget).hasClass('exs-blocked')) {
            return;
        }
        if ($(e.target).is('button') || $(e.target).hasClass('icon-custom') || $(e.target).is('input') || $(e.target).is('i') || $(e.target).hasClass('label')) {
            return;
        }
        if ($(e.currentTarget).hasClass('active')) {
            $(e.currentTarget).removeClass('active');
            // RenderExerciseOne(null);
            let folderType = $('.folders_div.selected').attr('data-id');
            let exsId = $(e.currentTarget).attr('data-id');
            if ($('.selected-exercise-panel').find(`.c-exs[data-id="${exsId}"][folder-type="${folderType}"]`).length > 0) {
                $('.selected-exercise-panel').html('');
            }
            return;
        }
        $('.exercises-list').find('.exs-elem').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadExerciseOneHandler();
        if ($('#moveExs').attr('data-state') == '1' || $('#copyExs').attr('data-state') == '1') {
            AddExerciseToSelectedSlot();
        }
    });
    $('.exercises-list').on('click', '.delete-selected', (e) => {
        $('.selected-exercise-panel').html('');
        window.removeSelectedSlot = true;
        CheckLastExs();
    });


    // Toggle folders:
    $('#toggleFoldersViews').on('click', (e) => {
        if (!$('.up-tabs-elem[data-id="trainer_folders"]').hasClass('d-none')) {
            swal("Внимание", "Отключите упражнения тренера.", "info");
            return;
        }
        if (!$('.folders-block').find('.description-container').hasClass('d-none')) {
            $('#toggleDescriptionInFolders').removeClass('c-active');
            $('#toggleDescriptionInFolders').removeClass('selected3');
            $('#toggleDescriptionInFolders').attr('data-state', '0');

            $('.folders-block').find('.folders-container').removeClass('d-none');
            $('.folders-block').find('.description-container').addClass('d-none');
            $('.folders-block').find('.card-container').addClass('d-none');
            $('.exs-edit-block').find('.btn-o-modal[data-id="description"]').removeClass('active');
            $('.exs-edit-block').find('.btn-o-modal[data-id="card"]').removeClass('active');
            try {
                if (window.split_sizes_tempo.length == 2) {
                    window.split.setSizes(window.split_sizes_tempo);
                }
            } catch(e) {}
            $(e.currentTarget).toggleClass('selected3', $(e.currentTarget).attr('data-state') != "0");
            return;
        }
        if (!$('.folders-block').find('.card-container').hasClass('d-none')) {
            $('#toggleCardInFolders').removeClass('c-active');
            $('#toggleCardInFolders').removeClass('selected3');
            $('#toggleCardInFolders').attr('data-state', '0');

            $('.folders-block').find('.folders-container').removeClass('d-none');
            $('.folders-block').find('.description-container').addClass('d-none');
            $('.folders-block').find('.card-container').addClass('d-none');
            $('.exs-edit-block').find('.btn-o-modal[data-id="description"]').removeClass('active');
            $('.exs-edit-block').find('.btn-o-modal[data-id="card"]').removeClass('active');
            try {
                if (window.split_sizes_tempo.length == 2) {
                    window.split.setSizes(window.split_sizes_tempo);
                }
            } catch(e) {}
            $(e.currentTarget).toggleClass('selected3', $(e.currentTarget).attr('data-state') != "0");
            return;
        }
        
        let visibleRoot = false;
        let visibleOthers = false;
        if ($(e.currentTarget).attr('data-state') == "1") {
            visibleRoot = true;
            visibleOthers = false;
            $(e.currentTarget).attr('data-state', '2');
            $(e.currentTarget).toggleClass('selected3', true);
        } else if ($(e.currentTarget).attr('data-state') == "2") {
            visibleRoot = false;
            visibleOthers = true;
            $(e.currentTarget).attr('data-state', '0');
            $(e.currentTarget).toggleClass('selected3', false);
        } else {
            visibleRoot = true;
            visibleOthers = true;
            $(e.currentTarget).attr('data-state', '1');
            $(e.currentTarget).toggleClass('selected3', true);
        }
        $('.folders_div').find('li.list-group-item').each((ind, elem) => {
            let isRoot = $(elem).hasClass('root-elem');
            if (isRoot) {
                $(elem).toggleClass('d-none', !visibleRoot);
            } else {
                $(elem).toggleClass('d-none', !visibleOthers);
            }
        });
        ToggleFoldersView(true);
    });

    window.split_sizes_tempo = [];
    $('#toggleDescriptionInFolders').on('click', (e) => {
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        if ($(activeExs).length == 0 && $('.folders-block').find('.description-container').hasClass('d-none')) {
            $(e.currentTarget).attr('data-state', '0');
            $(e.currentTarget).removeClass("c-active");
            $(e.currentTarget).removeClass("selected3");
            swal("Внимание", "Выберите упражнение из списка.", "info");
            return;
        }
        let folderType = $('.folders_div.selected').attr('data-id');
        $('.folders-block').find('button.edit-exercise.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
        if ($('.folders-block').find('.description-container').hasClass('d-none')) {
            $('.folders-block').find('.folders-container').addClass('d-none');
            $('.folders-block').find('.description-container').removeClass('d-none');
            $('.folders-block').find('.card-container').addClass('d-none');
            $('.exs-edit-block').find('.btn-o-modal[data-id="description"]').addClass('active');
            $('.exs-edit-block').find('.btn-o-modal[data-id="card"]').removeClass('active');
            try {
                window.split_sizes_tempo = window.split.getSizes();
                window.split.setSizes([40, 40]);
            } catch(e) {}
            $('#toggleFoldersViews').toggleClass('selected3', false);
            $('#toggleCardInFolders').attr('data-state', '0');
            $('#toggleCardInFolders').removeClass("c-active");
            $('#toggleCardInFolders').removeClass("selected3");
        } else if (!$('.folders-block').find('.description-container').hasClass('d-none')) {
            $('.folders-block').find('.folders-container').removeClass('d-none');
            $('.folders-block').find('.description-container').addClass('d-none');
            $('.folders-block').find('.card-container').addClass('d-none');
            $('.exs-edit-block').find('.btn-o-modal[data-id="description"]').removeClass('active');
            $('.exs-edit-block').find('.btn-o-modal[data-id="card"]').removeClass('active');
            $('#toggleFoldersViews').toggleClass('selected3', false);
        } else {
            $(e.currentTarget).attr('data-state', '0');
            $(e.currentTarget).removeClass("c-active");
            $(e.currentTarget).removeClass("selected3");
        }
    });
    $('#toggleCardInFolders').on('click', (e) => {
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        if ($(activeExs).length == 0 && $('.folders-block').find('.card-container').hasClass('d-none')) {
            $(e.currentTarget).attr('data-state', '0');
            $(e.currentTarget).removeClass("c-active");
            $(e.currentTarget).removeClass("selected3");
            swal("Внимание", "Выберите упражнение из списка.", "info");
            return;
        }
        let folderType = $('.folders_div.selected').attr('data-id');
        $('.folders-block').find('button.edit-exercise.d-e-nf').toggleClass('d-none', folderType == "nfb_folders");
        if ($('.folders-block').find('.card-container').hasClass('d-none')) {
            $('.folders-block').find('.folders-container').addClass('d-none');
            $('.folders-block').find('.description-container').addClass('d-none');
            $('.folders-block').find('.card-container').removeClass('d-none');
            $('.exs-edit-block').find('.btn-o-modal[data-id="description"]').removeClass('active');
            $('.exs-edit-block').find('.btn-o-modal[data-id="card"]').addClass('active');
            try {
                window.split_sizes_tempo = window.split.getSizes();
                window.split.setSizes([40, 40]);
            } catch(e) {}
            $('#toggleFoldersViews').toggleClass('selected3', false);
            $('#toggleDescriptionInFolders').attr('data-state', '0');
            $('#toggleDescriptionInFolders').removeClass("c-active");
            $('#toggleDescriptionInFolders').removeClass("selected3");
        } else if (!$('.folders-block').find('.card-container').hasClass('d-none')) {
            $('.folders-block').find('.folders-container').removeClass('d-none');
            $('.folders-block').find('.description-container').addClass('d-none');
            $('.folders-block').find('.card-container').addClass('d-none');
            $('.exs-edit-block').find('.btn-o-modal[data-id="description"]').removeClass('active');
            $('.exs-edit-block').find('.btn-o-modal[data-id="card"]').removeClass('active');
            $('#toggleFoldersViews').toggleClass('selected3', false);
        } else {
            $(e.currentTarget).attr('data-state', '0');
            $(e.currentTarget).removeClass("c-active");
            $(e.currentTarget).removeClass("selected3");
        }
    });
    $('.folders-block').on('click', 'button.toggle-description', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.folders-block').find('.description-container').find('button.toggle-description').removeClass('active');
        $(e.currentTarget).addClass('active');
        $('.folders-block').find('.description-container').find('.description-panel').addClass('d-none');
        $('.folders-block').find('.description-container').find(`.description-panel[data-id="${cId}"]`).removeClass('d-none');
    });

    // Split columns
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols'));
    if (Array.isArray(window.dataForSplit) && window.dataForSplit.length == 3 || !Array.isArray(window.dataForSplit)) {
        window.dataForSplit = [36.5, 43.5];
        localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
    }
    RenderSplitCols();

    $('.tags-filter-block').on('click', '.toggle-tags-view', (e) => {
        $('.tags-filter-block').find('.toggle-tags-view').removeClass('active');
        $(e.currentTarget).addClass('active');
        ToggleTagsView();
    });


    $('#deleteExsInList').on('click', (e) => {
        let activeExs = $('.exercises-list').find('.exs-elem.active');
        if ($(activeExs).length <= 0) {
            swal("Внимание", "Выберите упражнение из списка.", "info");
        } else {
            let exsId = $(activeExs).attr('data-id');
            let folderType = $('.folders_div.selected').attr('data-id');
            let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
            let data = {'type': folderType, 'folder': folder, 'exs': exsId};
            data = JSON.stringify(data);
            sessionStorage.setItem('last_exs', data);
            DeleteExerciseOne(exsId, folderType);
        }
    });
    

});
