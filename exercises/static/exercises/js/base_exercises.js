function ToggleUpFilter(id, state) {
    switch(id) {
        case "toggle_side_filter":
            $('div.visual-block').toggleClass('col-auto', !state);
            $('div.visual-block').toggleClass('col-4', state);
            $('div.side-filter-block').toggleClass('d-none', !state);
            RenderSplitCols();
            if (!state && $('.up-tabs-elem[data-id="cols_size"]').attr('data-state') == '1') {
                $('.up-tabs-elem[data-id="cols_size"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="cols_size"]').removeClass('btn-primary');
                $('.up-tabs-elem[data-id="cols_size"]').addClass('btn-secondary');
                $('.exercises-list').find('div.gutter').addClass('d-none');
            }
            break;
        case "toggle_up_filter":
            $('div.btns-tabs-second').fadeToggle(300, (e) => {});
            break;
        case "cols_size":
            if ($('.up-tabs-elem[data-id="toggle_side_filter"]').attr('data-state') == '1') {
                $('.exercises-list').find('div.gutter').toggleClass('d-none', !state);
            } else {
                swal("Внимание", "Включите сначала \"Фильтрацию\".", "info");
                $('.up-tabs-elem[data-id="cols_size"]').attr('data-state', '0');
                $('.up-tabs-elem[data-id="cols_size"]').removeClass('btn-primary');
                $('.up-tabs-elem[data-id="cols_size"]').addClass('btn-secondary');
            }
            break;
        case "nfb_folders":
            $('.folders_list').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="my_folders"]').toggleClass('btn-secondary', true);
            $('.up-tabs-elem[data-id="my_folders"]').toggleClass('btn-primary', false);
            $('.folders_nfb_list').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('btn-secondary', false);
            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('btn-primary', true);
            $('.exercises-list').find('.list-group-item').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
            break;
        case "my_folders":
            $('.folders_list').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="my_folders"]').toggleClass('btn-secondary', false);
            $('.up-tabs-elem[data-id="my_folders"]').toggleClass('btn-primary', true);
            $('.folders_nfb_list').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('btn-secondary', true);
            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('btn-primary', false);
            $('.exercises-list').find('.list-group-item').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
            break;
        case "copy":
            if ($('.exercises-list').find('.exs-elem.active').length <= 0) {
                $('.up-tabs-elem[data-id="copy"]').removeClass('btn-primary');
                $('.up-tabs-elem[data-id="copy"]').addClass('btn-secondary');
                $('.up-tabs-elem[data-id="copy"]').attr('data-state', '0');
                swal("Внимание", "Выберите упражнение для копирования.", "info");
            } else {
                if (state) {
                    $('#exerciseCopyModal').modal('show');
                } else {
                    $('#exerciseCopyModal').modal('hide');
                }
            }
            break;
        case "open_card_view":
            if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
                $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', true);
                $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
                $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', true);
                $('#exerciseCardModal').find('.add-row').toggleClass('d-none', true);
                $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', true);
                document.descriptionEditor.enableReadOnlyMode('');
                $('#exerciseCardModal').modal('show');
            } else {
                swal("Внимание", "Выберите сначала упражнение из списка.", "info");
            }
            $('.up-tabs-elem[data-id="open_card_view"]').toggleClass('btn-secondary', true);
            $('.up-tabs-elem[data-id="open_card_view"]').toggleClass('btn-primary', false);
            break;
        case "open_card_edit":
            if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
                $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', false);
                $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
                $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', false);
                $('#exerciseCardModal').find('.add-row').toggleClass('d-none', false);
                $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', false);
                $('#exerciseCardModal').find('.add-row').prop('disabled', false);
                $('#exerciseCardModal').find('.remove-row').prop('disabled', true);
                $('#exerciseCardModal').find('.remove-row.btn-on').prop('disabled', false);
                document.descriptionEditor.disableReadOnlyMode('');
                $('#exerciseCardModal').modal('show');
            } else {
                swal("Внимание", "Выберите сначала упражнение из списка.", "info");
            }
            $('.up-tabs-elem[data-id="open_card_edit"]').toggleClass('btn-secondary', true);
            $('.up-tabs-elem[data-id="open_card_edit"]').toggleClass('btn-primary', false);
            break;
        case "open_card_temp":
            $('#exerciseCardModal2').modal('show');
            break;
        default:
            break;
    }
}

function RenderSplitCols() {
    $('.exercises-list').find('div.gutter').remove();
    let stateSideFilter = $('.up-tabs-elem[data-id="toggle_side_filter"]').attr('data-state') == '1';
    let sizesArr = [];
    if (stateSideFilter) {
        sizesArr = window.dataForSplit;
    } else {
        sizesArr = [window.dataForSplit[0], window.dataForSplit[1], (window.dataForSplit[2] + window.dataForSplit[3])];
    }
    Split(['#splitCol_0', '#splitCol_1', '#splitCol_2', '#splitCol_3'], {
        sizes: sizesArr,
        gutterSize: 20,
        onDragEnd: (arr) => {
            window.dataForSplit = arr;
            localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
        }
    });
    let stateColSize = $('.up-tabs-elem[data-id="cols_size"]').attr('data-state') == '1';
    $('.exercises-list').find('div.gutter').toggleClass('d-none', !stateColSize);

    $('#exerciseCardModal').find('div.gutter').remove();
    sizesArr = window.dataForSplit2;
    window.split2 = Split(['#splitCol_10', '#splitCol_11'], {
        sizes: sizesArr,
        dragInterval: 1,
        gutterSize: 20,
        onDrag: () => {
            let sizes = window.split2.getSizes();
            try {
                if (sizes[0] < 39) {
                    window.split2.setSizes([40, 60]);
                }
                if (sizes[1] < 39) {
                    window.split2.setSizes([60, 40]);
                }
            } catch(e) {}
        },
        onDragEnd: (arr) => {
            window.dataForSplit2 = arr;
            localStorage.setItem('split_cols2', JSON.stringify(window.dataForSplit2));
        }
    });
    $('#exerciseCardModal').find('div.gutter').toggleClass('d-none', true);

    $('#exerciseCardModal2').find('div.gutter').remove();
    sizesArr = window.dataForSplit3;
    window.split2 = Split(['#splitCol_20', '#splitCol_21', '#splitCol_22'], {
        sizes: sizesArr,
        dragInterval: 1,
        gutterSize: 20,
        onDrag: () => {
            let sizes = window.split2.getSizes();
            try {
                // if (sizes[0] < 39) {
                //     window.split2.setSizes([40, 60]);
                // }
                // if (sizes[1] < 39) {
                //     window.split2.setSizes([60, 40]);
                // }
            } catch(e) {}
        },
        onDragEnd: (arr) => {
            window.dataForSplit3 = arr;
            localStorage.setItem('split_cols3', JSON.stringify(window.dataForSplit3));
        }
    });
    $('#exerciseCardModal2').find('div.gutter').toggleClass('d-none', true);
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
        <li class="exs-elem list-group-item py-1 px-0" data-id="${exElem.id}" data-folder="${exElem.folder}">
            <div class="row mx-3">
                <div class="col-10 px-1">
                    <span>${i+1}. Упражнение "ID:${exElem.id}", автор: ${exElem.user}</span>
                </div>
                <div class="col-2 d-flex justify-content-center px-1">
                    <button type="button" class="btn btn-secondary btn-sm btn-block btn-custom elem-flex-center size-max-w-x mr-1" title="Просмотрено" style="--w-max-x: 40px;" disabled="">
                        <span class="icon-custom icon--eye" style="--i-w: 1.8em; --i-h: 1.8em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block btn-custom elem-flex-center size-max-w-x" title="Избранное" style="--w-max-x: 40px; margin-top: 0;" disabled="">
                        <span class="icon-custom icon--favorite" style="--i-w: 1.8em; --i-h: 1.8em;"></span>
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
}


$(function() {
    // Toggle upper buttons panel
    $('button.up-tabs-elem').on('click', (e) => {
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

    // Toggle columns size
    $('#columnsSizeToggle').on('click', (e) => {
        if ($('.up-tabs-elem[data-id="toggle_side_filter"]').attr('data-state') == '1') {
            $('.exercises-list').find('div.gutter').toggleClass('d-none');
        } else {
            swal("Внимание", "Включите сначала \"Фильтрацию\".", "info");
        }
    });
    $('#columnsSizeInCard').on('click', (e) => {
        $('#exerciseCardModal').find('div.gutter').toggleClass('d-none');
    });
    
    // Choose exs folder
    $('.folders_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.folders_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        if (!isActive) {LoadFolderExercises();}
        else {
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
        }
    });
    $('.folders_nfb_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.folders_nfb_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        if (!isActive) {LoadFolderExercises();}
        else {
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
        }
    });
    $(document).keypress((e) => {
        if ($('#exerciseCardModal').hasClass('show')) {return;}
        let currentList = $('.up-tabs-elem[data-id="nfb_folders"]').attr('data-state') == '1' ? ".folders_nfb_list" : ".folders_list";
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
        if ($(e.currentTarget).hasClass('active')) {
            $(e.currentTarget).removeClass('active');
            // RenderExerciseOne(null);
            return;
        }
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
    $('#exerciseCardModal').on('click', '.exs-change', (e) => {
        let dir = $(e.currentTarget).attr('data-dir');
        let elems = $('.exercises-list').find('.exs-elem');
        if (elems.length > 1) {
            let activeInd = -1;
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];
                if ($(elem).hasClass('active')) {
                    activeInd = i;
                    break;
                }
            }
            if (activeInd != -1) {
                activeInd = dir == "next" ? (activeInd + 1) : dir == "prev" ? (activeInd - 1) : activeInd;
                activeInd = (activeInd < 0) ? (elems.length - 1) : (activeInd > elems.length - 1) ? 0 : activeInd;
                $(elems).removeClass('active');
                $(elems[activeInd]).addClass('active');
                let exsId = $(elems[activeInd]).attr('data-id');
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
            }
        }
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
    $('#openCardView').on('click', (e) => {
        if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
            $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', true);
            $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', true);
            $('#exerciseCardModal').find('.add-row').toggleClass('d-none', true);
            $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', true);
            document.descriptionEditor.enableReadOnlyMode('');
            $('#exerciseCardModal').modal('show');
        } else {
            swal("Внимание", "Выберите сначала упражнение из списка.", "info");
        }
    });
    $('#openCardEdit').on('click', (e) => {
        if ($('.exs-list-group').find('.list-group-item.active').length > 0) {
            $('#exerciseCardModal').find('.exs_edit_field').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-only-edit').prop('disabled', false);
            $('#exerciseCardModal').find('.btn-not-view').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.add-row').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.remove-row').toggleClass('d-none', false);
            $('#exerciseCardModal').find('.add-row').prop('disabled', false);
            $('#exerciseCardModal').find('.remove-row').prop('disabled', true);
            $('#exerciseCardModal').find('.remove-row.btn-on').prop('disabled', false);
            document.descriptionEditor.disableReadOnlyMode('');
            $('#exerciseCardModal').modal('show');
        } else {
            swal("Внимание", "Выберите сначала упражнение из списка.", "info");
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


    $('#exerciseCardModal2').on('click', '#openDescription', (e) => {
        $('#exerciseCardModal2').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCardModal2').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCardModal2').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal2').find('#cardBlock > #card_description').addClass('show active');
    });
    $('#exerciseCardModal2').on('click', '#openDrawing', (e) => {
        $('#exerciseCardModal2').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCardModal2').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCardModal2').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal2').find('#cardBlock > #card_drawing').addClass('show active');
    });
    $('#exerciseCardModal2').on('click', '#openVideo', (e) => {
        $('#exerciseCardModal2').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCardModal2').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCardModal2').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal2').find('#cardBlock > #card_video').addClass('show active');
    });
    $('#exerciseCardModal2').on('click', '#openAnimation', (e) => {
        $('#exerciseCardModal2').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCardModal2').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCardModal2').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCardModal2').find('#cardBlock > #card_animation').addClass('show active');
    });


    $('#exerciseCardModal2').on('click', 'button[data-type="add"]', (e) => {
        $('#exerciseCardModal2').find('button[data-type="add"]').removeClass('selected');
        $(e.currentTarget).addClass('selected');
    });


    $('#exerciseCardModal2').on('click', '.graphics-block-toggle', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseCardModal2').find('.graphics-block-toggle').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        $('#exerciseCardModal2').find('.graphics-block').addClass('d-none');
        $('#exerciseCardModal2').find(`.graphics-block[data-id=${cId}]`).removeClass('d-none');
    });


    $('#columnsSizeInCard2').on('click', (e) => {
        $('#exerciseCardModal2').find('div.gutter').toggleClass('d-none');
    });



    $('#exerciseCardModal2').on('click', '.add-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cloneRow = null;
        if (cId == "additions") {
            cloneRow = $('#exerciseCardModal2').find('.gen-content').find(`tr[data-id="${cId}"]`).clone();
        } else {
            let cType = $('#exerciseCardModal2').find('.selected[data-type="add"]').attr('data-id');
            cloneRow = $('#exerciseCardModal2').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
        }
        $(cloneRow).addClass('wider_row');
        $(cloneRow).find('.form-control').addClass('.exs_edit_field');
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cloneRow).insertAfter($('#exerciseCardModal2').find(`.wider_row[data-id="${cId}"]`).last());
    });
    $('#exerciseCardModal2').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().parent().parent().remove();
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
        .create(document.querySelector('#descriptionEditor2'), {
            language: cLang
        })
        .then(editor => {
            document.descriptionEditor2 = editor;
        })
        .catch(err => {
            console.error(err);
        });
    $('#exerciseCardModal').on('click', '#saveExs', (e) => {
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
                        window.location.reload();
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
    });
    $('#exerciseCardModal').on('change', '[name="folder_parent"]', (e) => {
        let tId = $(e.currentTarget).val();
        $('#exerciseCardModal').find('[name="folder_main"]').val('');
        $('#exerciseCardModal').find('[name="folder_main"]').find('option').addClass('d-none');
        $('#exerciseCardModal').find('[name="folder_main"]').find(`option[data-parent=${tId}]`).removeClass('d-none');
    });
    $('#exerciseCardModal').on('click', '.row-select-td', (e) => {
        if (!$(e.target).is('td')) {return;}
        let isOn = !$(e.currentTarget).parent().hasClass('active');
        $("#exerciseCardModal").find('tr.row-select').removeClass('active');
        $(e.currentTarget).parent().toggleClass('active', isOn);
    });
    $('#exerciseCardModal').on('click', '.add-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        let cTd = $('#exerciseCardModal').find(`td[data-id="td_${cId}"]`);
        let cloneRow = $(cTd).find('div.row').first().clone();
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cTd).append(cloneRow);
    });
    $('#exerciseCardModal').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().remove();
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


    // Delete exercise
    $('#exerciseCardModal').on('click', '#deleteExercise', (e) => {
        swal({
            title: "Вы точно хотите удалить упражнение?",
            text: "После удаления данное упражнение невозможно будет восстановить!",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                let cId = $('.exercises-list').find('.exs-elem').attr('data-id');
                let data = {'delete_exs': 1, 'exs': cId};
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
                                window.location.reload();
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
    });
    


    // Split columns
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols'));
    if (!window.dataForSplit) {
        window.dataForSplit = [15, 50, 5, 30];
        localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
    }
    window.dataForSplit2 = JSON.parse(localStorage.getItem('split_cols2'));
    if (!window.dataForSplit2) {
        window.dataForSplit2 = [50, 50];
        localStorage.setItem('split_cols2', JSON.stringify(window.dataForSplit2));
    }
    window.dataForSplit3 = JSON.parse(localStorage.getItem('split_cols3'));
    if (!window.dataForSplit3) {
        window.dataForSplit3 = [34, 33, 33];
        localStorage.setItem('split_cols3', JSON.stringify(window.dataForSplit3));
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
        $('.up-tabs-elem[data-id="copy"]').removeClass('btn-primary');
        $('.up-tabs-elem[data-id="copy"]').addClass('btn-secondary');
        $('.up-tabs-elem[data-id="copy"]').attr('data-state', '0');
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
                        swal("Готово", "Упражнение успешно скопировано. Обновите страницу, чтобы увидеть данное упражение.", "success");
                    } else {
                        swal("Ошибка", "Упражнение скопировать не удалось.", "error");
                        console.log(res);
                    }
                },
                error: function (res) {
                    swal("Ошибка", "Упражнение скопировать не удалось.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                    $('#exerciseCopyModal').modal('hide');
                }
            });
        }
    });


    // Video JS
    window.videoPlayer = videojs('video-player', {
        preload: 'auto',
        autoplay: false,
        controls: true,
        aspectRatio: '16:9',
        youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
    });
    window.videoPlayer.ready((e) => {
        window.videoPlayer.src({techOrder: ["youtube"], type: 'video/youtube', src: "https://www.youtube.com/watch?v=sNZPEnc4m0w"});
        
        // window.videoPlayer.src({type: 'video/mp4', src: "https://213.108.4.28/video/player/1654865941907"});
    });



});
