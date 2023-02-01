function RenderSplitCols() {
    $('.exercises-list').find('div.gutter').remove();
    let sizesArr = window.dataForSplit;
    window.split = Split(['#splitCol_0', '#splitCol_1', '#splitCol_2'], {
        sizes: sizesArr,
        gutterSize: 16,
        onDrag: () => {
            let lastColWidth = 0;
            try {
                let sizes = window.split.getSizes();
                lastColWidth = sizes[2];
            } catch(e) {}
            if (lastColWidth > 0) {
                $('#splitCol_2').css('width', `calc(${lastColWidth}% + 20px)`);
            }
        },
        onDragEnd: (arr) => {
            if (!$('#toggleFoldersNames').attr('data-state') == '1') {
                let oldValue = arr[0];
                arr[0] *= 2; let diff = oldValue - arr[0];
                arr[1] += diff;
            }
            window.dataForSplit = arr;
            localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
        }
    });
    let stateColSize = $('.up-tabs-elem[data-id="cols_size"]').attr('data-state') == '1';
    $('.exercises-list').find('div.gutter').toggleClass('d-none', !stateColSize);
    ResizeSplitCols();
}

function ResizeSplitCols() {
    let state = $('#toggleFoldersNames').attr('data-state') == '1';
    let lastColWidth = 0;
    try {
        let sizes = window.split.getSizes();
        if (!state) {
            let oldValue = sizes[0];
            sizes[0] /= 2; let diff = oldValue - sizes[0];
            sizes[1] += diff;
        } else {
            let oldValue = sizes[0];
            sizes[0] *= 2; let diff = oldValue - sizes[0];
            sizes[1] += diff;
        }
        window.split.setSizes(sizes);
        lastColWidth = sizes[2];
    } catch(e) {}
    if (lastColWidth > 0) {
        $('#splitCol_2').css('width', `calc(${lastColWidth}% + 20px)`);
    }
    // let colWidth = !state ? `calc(${$('#splitCol_0').css('width')} / 2)` : `calc(${$('#splitCol_2').css('width')} * 2)`;
    // $('#splitCol_0').css('width', colWidth);
}

let exercises = {"nfb": {}};
window.exercisesFilter = {};
function LoadFolderExercises() {
    let activeRow = $('.folders_list').find('.list-group-item.active');
    let isClub = false;
    if (activeRow.length <= 0) {
        activeRow = $('.folders_club_list').find('.list-group-item.active');
        isClub = true;
    }
    let activeNfbRow = $('.folders_nfb_list').find('.list-group-item.active');
    if (activeRow.length <= 0 && activeNfbRow.length <= 0) {return;}
    let isNfbExs = activeNfbRow.length > 0;
    let fType = $('.folders-block').find('.folders_div:not(.d-none)').attr('data-id');
    let folderElemStr = isClub ? '.folder-club-elem' : '.folder-elem';
    let cFolderId = !isNfbExs ? $(activeRow).find(folderElemStr).attr('data-id') : $(activeNfbRow).find('.folder-nfb-elem').attr('data-id');
    let tExs = !isNfbExs ? exercises : exercises['nfb'];
    if (cFolderId in tExs) {
        RenderFolderExercises(cFolderId, tExs);
    } else {
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
                if (window.lastExercise && window.lastExercise.exs) {
                    CountExsInFolder();
                    window.lastExercise = null;
                } else {
                    CountExsInFolder(true, true);
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
        exsHtml += `
        <li class="exs-elem list-group-item py-1 px-0" data-id="${exElem.id}" data-folder="${exElem.folder}">
            <div class="row w-100">
                <div class="col-12 d-flex px-0">
                    <span class="ml-3 w-100">
                        <span class="num">${i+1}.</span>
                        <span class="title">
                            ${exElem.title == "" ? "-- None --" : exElem.title}
                        </span>
                    </span>
                    ${exElem.has_video_1 == true ? `
                        <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x ${exElem.video_1_watched == true ? 'selected' : ''}" data-type="marker" data-id="video_1_watched" style="--w-x:20px; --h-x:24px;" title="Видео 1">
                            <input type="checkbox" class="video-check" value="" ${exElem.video_1_watched == true ? 'checked' : ''}>
                            <span class="label">V</span>
                        </button>
                    ` : ''}
                    ${exElem.has_video_2 == true ? `
                        <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x ${exElem.video_2_watched == true ? 'selected' : ''}" data-type="marker" data-id="video_2_watched" style="--w-x:20px; --h-x:24px;" title="Видео 2">
                            <input type="checkbox" class="video-check" value="" ${exElem.video_2_watched == true ? 'checked' : ''}>
                            <span class="label">V</span>
                        </button>
                    ` : ''}
                    ${exElem.has_animation_1 == true ? `
                        <button type="button" class="btn btn-marker btn-empty elem-flex-center size-w-x size-h-x ${exElem.animation_1_watched == true ? 'selected' : ''}" data-type="marker" data-id="animation_1_watched" style="--w-x:20px; --h-x:24px;" title="Анимация 1">
                            <input type="checkbox" class="video-check" value="" ${exElem.animation_1_watched == true ? 'checked' : ''}>
                            <span class="label">A</span>
                        </button>
                    ` : ''}
                    ${exElem.has_animation_2 == true ? `
                        <button type="button" class="btn btn-marker btn-empty elem-flex-center size-w-x size-h-x ${exElem.animation_2_watched == true ? 'selected' : ''}" data-type="marker" data-id="animation_2_watched" style="--w-x:20px; --h-x:24px;" title="Анимация 2">
                            <input type="checkbox" class="video-check" value="" ${exElem.animation_2_watched == true ? 'checked' : ''}>
                            <span class="label">A</span>
                        </button>
                    ` : ''}
                    <button type="button" class="btn btn-sm btn-marker btn-empty elem-flex-center size-w-x size-h-x ${exElem.favorite == true ? 'selected' : ''}" data-type="marker" data-id="favorite" style="--w-x:24px; min-width: 38px; --h-x:24px;" title="Избранное">
                        <span class="icon-custom ${exElem.favorite == true ? 'icon--favorite-selected' : 'icon--favorite'}" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="players" style="--w-x:24px; min-width: 54px; --h-x:24px;" disabled="">
                        <div class="row w-100">
                            <div class="col-5 px-0 text-center">
                                ${exElem.field_players_a ? exElem.field_players_a : ''}
                            </div>
                            <div class="col-2 px-0 text-center">-</div>
                            <div class="col-5 px-0 text-center">
                                ${exElem.field_players_b ? exElem.field_players_b : ''}
                            </div>
                        </div>
                    </button>
                    ${exElem.field_goal && exElem.field_goal != "" ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="goal" style="--w-x:24px; min-width: 38px; --h-x:24px;" disabled="">
                            ${exElem.field_goal}
                        </button>
                    ` : `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="goal" style="--w-x:24px; min-width: 38px; --h-x:24px;" disabled="">
                            -
                        </button>
                    `}
                    ${exElem.ref_ball_id == 1 ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="ball" style="--w-x:24px; min-width: 38px; --h-x:24px;" disabled="">
                            <span class="icon-custom icon--ball" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                        </button>
                    ` : `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="ball" style="--w-x:24px; min-width: 38px; --h-x:24px;" disabled="">
                            -
                        </button>
                    `}
                    ${((exElem.field_keyword_a && exElem.field_keyword_a != "") || (exElem.field_keyword_b && exElem.field_keyword_b != "")) ? `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="keywords" style="--w-x:24px; min-width: 250px; --h-x:24px;" disabled="">
                            <div class="row w-100">
                                <div class="col-6 px-0 text-center">
                                    ${exElem.field_keyword_a && exElem.field_keyword_a != "" ? exElem.field_keyword_a : ''}
                                </div>
                                <div class="col-6 px-0 text-center">
                                    ${exElem.field_keyword_b && exElem.field_keyword_b != "" ? exElem.field_keyword_b : ''}
                                </div>
                            </div>
                        </button>
                    ` : `
                        <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="keywords" style="--w-x:24px; min-width: 250px; --h-x:24px;" disabled="">
                            <div class="row w-100">
                                <div class="col-6 px-0 text-center">
                                    ...
                                </div>
                                <div class="col-6 px-0 text-center">
                                    ...
                                </div>
                            </div>
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
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="id" style="--w-x:24px; min-width: 24px; --h-x:24px;" disabled="" title="ID упражнения">
                        ${exElem.id}
                    </button>
                    <button type="button" class="btn btn-secondary1 btn-sm btn-custom btn-empty elem-flex-center size-w-x size-h-x mr-1 font-weight-bold" data-type="icons" data-id="lang" style="--w-x:24px; min-width: 24px; --h-x:24px;" title="">
                        <i class="fa fa-globe" aria-hidden="true"></i>
                    </button>
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

    if (window.lastExercise && window.lastExercise.exs) {
        $('.exs-list-group').find(`.exs-elem[data-id="${window.lastExercise.exs}"]`).click();
    }
}

// Handler for func LoadExerciseOne in exercise card:
function LoadExerciseOneHandler() {
    let activeExs = $('.exercises-list').find('.exs-elem.active');
    if ($(activeExs).length <= 0) {return;}
    let cId = $(activeExs).attr('data-id');
    let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
    let folderType = $('.folders_div:not(.d-none)').attr('data-id');
    LoadExerciseOne(cId, fromNFB, folderType);
    CountExsInFolder(true, true);
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
    let isActiveGoal = $('.up-tabs-elem[data-id="goal"]').attr('data-state') == "1";
    let isActiveBall = $('.up-tabs-elem[data-id="ball"]').attr('data-state') == "1";
    let isActiveKeywords = $('.up-tabs-elem[data-id="keywords"]').attr('data-state') == "1";

    let isActiveExsAdminOpts = $('#toggleExsAdminOptions').attr('data-state') == "1";
    let isActiveExsID = $('#toggleExsID').attr('data-state') == "1";
    let isActiveLang = $('#toggleExsLangName').attr('data-state') == "1";
    $('.exercises-block').find(`[data-type="icons"]`).toggleClass('d-none', true);

    $('.exercises-block').find(`[data-type="icons"][data-id="players"]`).toggleClass('d-none', !isActivePlayers);
    $('.exercises-block').find(`[data-type="icons"][data-id="goal"]`).toggleClass('d-none', !isActiveGoal);
    $('.exercises-block').find(`[data-type="icons"][data-id="ball"]`).toggleClass('d-none', !isActiveBall);
    $('.exercises-block').find(`[data-type="icons"][data-id="keywords"]`).toggleClass('d-none', !isActiveKeywords);

    $('.exercises-block').find(`[data-type="icons"][data-info="admin_options"]`).toggleClass('d-none', !isActiveExsAdminOpts);
    $('.exercises-block').find(`[data-type="icons"][data-id="id"]`).toggleClass('d-none', !isActiveExsID);
    $('.exercises-block').find(`[data-type="icons"][data-id="lang"]`).toggleClass('d-none', !isActiveLang);
}
function ToggleMarkersInExs() {
    let isActiveVideo = $('.up-tabs-elem[data-id="toggle_watched"]').attr('data-state') == "1" || $('.up-tabs-elem[data-id="toggle_watched_not"]').attr('data-state') == "1";
    let isActiveFavorite = $('.up-tabs-elem[data-id="toggle_favorite"]').attr('data-state') == "1";
    $('.exercises-block').find(`[data-type="marker"][data-id!="favorite"]`).toggleClass('d-none', !isActiveVideo);
    $('.exercises-block').find(`[data-type="marker"][data-id="favorite"]`).toggleClass('d-none', !isActiveFavorite);
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

function MoveVideoFromExsToExs(toExsId) {
    let data = {
        'move_video_from_exs_to_exs': 1, 
        'from_exs': window.moveVideoFromExsToExs['exs_from'], 
        'to_exs': toExsId, 
        'content': window.moveVideoFromExsToExs['content']
    };
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Видео / анимация успешно перенесены.", "success");
            } else {
                swal("Ошибка", "Не удалось переместить видео / анимацию.", "error");
                console.log(res);
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось переместить видео / анимацию.", "error");
            console.log(res);
        },
        complete: function (res) {
        }
    });
}

function CopySchemeFromExsToExs(toExsId, toFolderType) {
    let data = {
        'copy_scheme_from_exs_to_exs': 1, 
        'from_exs': window.copySchemeFromExsToExs['exs_from'], 
        'to_exs': toExsId, 
        'from_f_type': window.copySchemeFromExsToExs['f_type'],
        'to_f_type': toFolderType,
        'content': window.copySchemeFromExsToExs['content']
    };
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Готово", "Схема успешно скопирована.", "success");
            } else {
                swal("Ошибка", "Не удалось скопировать схему.", "error");
                console.log(res);
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось скопировать схему.", "error");
            console.log(res);
        },
        complete: function (res) {
        }
    });
}



$(function() {

    // Toggle columns size
    $('#columnsSizeToggle').on('click', (e) => {
        $('.exercises-list').find('div.gutter').toggleClass('d-none');
    });


    // Choose exs folder
    $('.folders_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.folders_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        if (!isActive) {LoadFolderExercises();}
        else {
            $('.exs_counter').html("(...)");
            CountExsInFoldersByType();
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
        }
    });
    $('.folders_nfb_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.folders_nfb_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        if (!isActive) {LoadFolderExercises();}
        else {
            $('.exs_counter').html("(...)");
            CountExsInFoldersByType();
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
        }
    });
    $('.folders_club_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.folders_club_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        if (!isActive) {LoadFolderExercises();}
        else {
            $('.exs_counter').html("(...)");
            CountExsInFoldersByType();
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
        }
    });


    // Change exercise using keys
    window.canChangeExs = true;
    $(document).keydown((e) => {
        let currentList = '.exs-list-group';
        let activeElem = $(currentList).find('.list-group-item.exs-elem.active');
        let loadExs = false;
        if (e.which == 38 && window.canChangeExs) { // up
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                if ($(activeElem).prev().length > 0) {
                    $(activeElem).prev().addClass('active');
                } else {
                    $(currentList).find('.list-group-item.exs-elem').last().addClass('active');
                }
            } else {
                $(currentList).find('.list-group-item.exs-elem').last().addClass('active');
            }
            loadExs = true;
        }
        if (e.which == 40 && window.canChangeExs) { // down
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                if ($(activeElem).next().length > 0) {
                    $(activeElem).next().addClass('active');
                } else {
                    $(currentList).find('.list-group-item.exs-elem').first().addClass('active');
                }
            } else {
                $(currentList).find('.list-group-item.exs-elem').first().addClass('active');
            }
            loadExs = true;
        }
        if (loadExs && $(currentList).find('.list-group-item.exs-elem.active').length > 0) {
            window.canChangeExs = false;
            LoadExerciseOneHandler();
        }
    });
    // Open exercise using keys
    $(document).keypress((e) => {
        if (e.which == 13 && window.canChangeExs) { // enter
            $('#showOneExs').trigger('click');
        }
    });


    // Choose exercise
    $('.exercises-list').on('click', '.exs-elem', (e) => {
        if ($(e.target).is('button') || $(e.target).hasClass('icon-custom') || $(e.target).is('input') || $(e.target).is('i') || $(e.target).hasClass('label')) {
            return;
        }
        if ($(e.currentTarget).hasClass('active')) {
            $(e.currentTarget).removeClass('active');
            // RenderExerciseOne(null);
            return;
        }
        $('.exercises-list').find('.exs-elem').removeClass('active');
        $(e.currentTarget).addClass('active');
        if (window.moveVideoFromExsToExs) {
            let folderType = $('.folders_div:not(.d-none)').attr('data-id');
            let exsId = $(e.currentTarget).attr('data-id');
            if (window.moveVideoFromExsToExs['f_type'] && window.moveVideoFromExsToExs['f_type'] == "nfb_folders" && folderType == "nfb_folders") {
                swal({
                    title: "Вы точно хотите переместить контент в это упражнение?",
                    text: ``,
                    icon: "warning",
                    buttons: ["Отмена", "Подтвердить"],
                    dangerMode: true,
                })
                .then((willMoving) => {
                    if (willMoving) {
                        MoveVideoFromExsToExs(exsId);
                        window.moveVideoFromExsToExs = null;
                        $('.exercises-block').find('.copy-modal-status').removeClass('d-flex');
                        $('.exercises-block').find('.copy-modal-status').addClass('d-none');
                    }
                });
            } else {
                swal("Внимание", "Оба упражнения должны быть из папок N.F.", "info");
                window.moveVideoFromExsToExs = null;
                $('.exercises-block').find('.copy-modal-status').removeClass('d-flex');
                $('.exercises-block').find('.copy-modal-status').addClass('d-none');
            }
            setTimeout(() => {
                $(e.currentTarget).removeClass('active');
            }, 1000);
        } else if (window.copySchemeFromExsToExs) {
            let folderType = $('.folders_div:not(.d-none)').attr('data-id');
            let exsId = $(e.currentTarget).attr('data-id');
            swal({
                title: "Вы точно хотите скопировать контент в это упражнение?",
                text: ``,
                icon: "warning",
                buttons: ["Отмена", "Подтвердить"],
                dangerMode: true,
            })
            .then((willCopying) => {
                if (willCopying) {
                    CopySchemeFromExsToExs(exsId, folderType);
                    window.copySchemeFromExsToExs = null;
                    $('.exercises-block').find('.copy-modal-status').removeClass('d-flex');
                    $('.exercises-block').find('.copy-modal-status').addClass('d-none');
                }
            });
            setTimeout(() => {
                $(e.currentTarget).removeClass('active');
            }, 1000);
        } else {
            LoadExerciseOneHandler();
        }
    });


    // Split columns
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols'));
    if (!window.dataForSplit) {
        window.dataForSplit = [25, 50, 25];
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
            let folderType = $('.folders_div:not(.d-none)').attr('data-id');
            let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
            let data = {'type': folderType, 'folder': folder, 'exs': exsId};
            data = JSON.stringify(data);
            sessionStorage.setItem('last_exs', data);
            DeleteExerciseOne(exsId, folderType);
        }
    });
    

});
