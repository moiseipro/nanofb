function ToggleUpFilter(id, state) {
    let currentList = null;
    let activeElem = null;
    let graphicsWidth = '';
    switch(id) {
        case "toggle_side_filter":
            $('div.side-filter-block').toggleClass('d-none', !state);
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
        case "toggle_folders":
            if ($('.folders_list').hasClass('d-none')) {
                $('.folders_list').toggleClass('d-none', false);
                $('.folders_nfb_list').toggleClass('d-none', true);
                $('.up-tabs-elem[data-id="toggle_folders"]').text(`Папки "Тренер"`);
            } else {
                $('.folders_list').toggleClass('d-none', true);
                $('.folders_nfb_list').toggleClass('d-none', false);
                $('.up-tabs-elem[data-id="toggle_folders"]').text(`Папки N.F.`);
            }
            $('.exercises-list').find('.list-group-item').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
            $('.up-tabs-elem[data-id="toggle_folders"]').toggleClass('btn-secondary', true);
            $('.up-tabs-elem[data-id="toggle_folders"]').toggleClass('btn-primary', false);
            break;
        case "nfb_folders":
            $('.folders_nfb_list').toggleClass('d-none', true);
            $('.folders_club_list').toggleClass('d-none', false);
            $('.folders_list').toggleClass('d-none', true);
            $('.exercises-list').find('.list-group-item').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', true);

            $('#exerciseCopyModal').find('select[name="copy_mode"]').val('1');
            $('#exerciseCopyModal').find('select[name="copy_mode"]').prop('disabled', true);
            break;
        case "club_folders":
            $('.folders_nfb_list').toggleClass('d-none', true);
            $('.folders_club_list').toggleClass('d-none', true);
            $('.folders_list').toggleClass('d-none', false);

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', false);

            break;
        case "team_folders":
            $('.folders_nfb_list').toggleClass('d-none', false);
            $('.folders_club_list').toggleClass('d-none', true);
            $('.folders_list').toggleClass('d-none', true);
            $('.exercises-list').find('.list-group-item').removeClass('active');
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');

            $('.up-tabs-elem[data-id="nfb_folders"]').toggleClass('d-none', false);
            $('.up-tabs-elem[data-id="club_folders"]').toggleClass('d-none', true);
            $('.up-tabs-elem[data-id="team_folders"]').toggleClass('d-none', true);

            $('#exerciseCopyModal').find('select[name="copy_mode"]').prop('disabled', false);
            break;
        case "copy":
            if ($('.exercises-list').find('.exs-elem.active').length <= 0) {
                $('.up-tabs-elem[data-id="copy"]').removeClass('btn-primary');
                $('.up-tabs-elem[data-id="copy"]').addClass('btn-secondary');
                $('.up-tabs-elem[data-id="copy"]').attr('data-state', '0');
                swal("Внимание", "Выберите упражнение из списка.", "info");
            } else {
                if (state) {$('#exerciseCopyModal').modal('show');} 
                else {$('#exerciseCopyModal').modal('hide');}
            }
            break;
        case "prev_exs":
            currentList = '.exs-list-group';
            activeElem = $(currentList).find('.exs-elem.active');
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).prev().addClass('active');
            } else {
                $(currentList).find('.exs-elem').last().addClass('active');
            }
            $('.up-tabs-elem[data-id="prev_exs"]').toggleClass('btn-secondary', true);
            $('.up-tabs-elem[data-id="prev_exs"]').toggleClass('btn-primary', false);
            LoadExerciseOneHandler();
            break;
        case "next_exs":
            currentList = '.exs-list-group';
            activeElem = $(currentList).find('.exs-elem.active');
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).next().addClass('active');
            } else {
                $(currentList).find('.exs-elem').first().addClass('active');
            }
            $('.up-tabs-elem[data-id="next_exs"]').toggleClass('btn-secondary', true);
            $('.up-tabs-elem[data-id="next_exs"]').toggleClass('btn-primary', false);
            LoadExerciseOneHandler();
            break;
        case "toggle_markers":
            ToggleMarkersInExs();
            break;
        default:
            break;
    }
}

function CheckLastExs() {
    let dataStr = sessionStorage.getItem('last_exs');
    try {
        window.lastExercise = JSON.parse(dataStr);
    } catch(e) {}
    sessionStorage.setItem('last_exs', '');
    if (window.lastExercise && window.lastExercise.type) {
        $('.up-tabs-elem.folders-toggle').addClass('d-none');
        $(`.up-tabs-elem[data-id="${window.lastExercise.type}"]`).removeClass('d-none');
        $('.folders-block > div').addClass('d-none');
        $(`.folders-block > div[data-id="${window.lastExercise.type}"]`).removeClass('d-none');
        setTimeout(() => {
            if (window.lastExercise.folder) {
                if (window.lastExercise.type == "team_folders") {
                    $('.folders_list').find(`.folder-elem[data-id="${window.lastExercise.folder}"]`).click();
                } else if (window.lastExercise.type == "nfb_folders") {
                    $('.folders_nfb_list').find(`.folder-nfb-elem[data-id="${window.lastExercise.folder}"]`).click();
                } else if (window.lastExercise.type == "club_folders") {
    
                }
            }
        }, 200);
    }
}


$(function() {

    $('.folders_list').toggleClass('d-none', true);
    $('.folders_nfb_list').toggleClass('d-none', false);


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
        let isFilter = $(e.currentTarget).parent().attr('data-id') == "filter";
        let isShowIcons = $(e.currentTarget).parent().attr('data-id') == "show_icons";
        if (isShowIcons && $('.up-tabs-elem[data-id="toggle_markers"]').attr('data-state') == '1') {
            return;
        }
        if (isFilter) {
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').attr('data-state', '0');
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').toggleClass('active', false);
            $('.side-filter-block').find('.list-group[data-id="filter"]').find('.side-filter-elem').find('.counter').remove();
            if (!state) {
                $(e.currentTarget).find('.row > div:nth-child(2)').append(`<span class="counter">( .. )</span>`);
            }
        }
        $(e.currentTarget).toggleClass('active', !state);
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        if (isShowIcons) {ToggleIconsInExs();}
    });


    // Toggle side filter content
    $('.side-filter-block').on('click', '.toggle-filter-content', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.side-filter-block').find(`.list-group[data-id="${cId}"]`).toggleClass('d-none');
    });


    // Toggle columns size
    $('#columnsSizeInCard').on('click', (e) => {
        $('#exerciseCardModal').find('div.gutter').toggleClass('d-none');
    });


    // Toggle Names of folders:
    $('#toggleFoldersNames').on('click', (e) => {
        let state = $(e.currentTarget).attr('data-state') == '1';
        $('.folders-block').find('.folder-elem').each((ind, elem) => {
            let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
            $(elem).find('.folder-title').text(tmpText);
        });
        $('.folders-block').find('.folder-nfb-elem').each((ind, elem) => {
            let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
            $(elem).find('.folder-title').text(tmpText);
        });
        $(e.currentTarget).attr('data-state', state ? '0' : '1');
        $(e.currentTarget).html(state ? `
            <i class="fa fa-arrow-right" aria-hidden="true"></i>
        ` : `
            <i class="fa fa-arrow-down" aria-hidden="true"></i>
        `);
        ResizeSplitCols();
    });


    // Toggle draw, video, animation
    $('.visual-block').on('click', '.graphics-block-toggle', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('.visual-block').find('.graphics-block-toggle').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        $('.visual-block').find('.graphics-block').addClass('d-none');
        $('.visual-block').find(`.graphics-block[data-id=${cId}]`).removeClass('d-none');
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
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
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
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
    });


    $('#createExercise').on('click', (e) => {
        window.location.href = `/exercises/exercise?id=new`;
        // RenderExerciseOne(null);
        // $('#exerciseCardModal').modal('show');
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


    // Go to exercise view
    $('#showOneExs').on('click', (e) => {
        let activeExs = $('.exs-list-group').find('.list-group-item.active');
        if ($(activeExs).length > 0) {
            let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
            window.location.href = `/exercises/exercise?id=${$(activeExs).attr('data-id')}&nfb=${fromNfbFolder ? 1 : 0}`;

            let folderType = !$('.exercises-list').find('.folders_list').hasClass('d-none') ? "team_folders" 
                : !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? "nfb_folders" 
                : !$('.exercises-list').find('.folders_club_list').hasClass('d-none') ? "club_folders" : "";
            let folder = $('.folders-block').find('.list-group-item.active > div').attr('data-id');
            let data = {'type': folderType, 'folder': folder, 'exs': $(activeExs).attr('data-id')};
            data = JSON.stringify(data);
            sessionStorage.setItem('last_exs', data);
        } else {
            swal("Внимание", "Выберите упражнение для просмотра.", "info");
        }
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
        .create(document.querySelector('#descriptionEditorView'), {
            language: cLang
        })
        .then(editor => {
            document.descriptionEditorView = editor;
            document.descriptionEditorView.enableReadOnlyMode('');
            $(document).find('.ck-editor__top').addClass('d-none');
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
    $('#exerciseCopyModal').on('change', 'select[name="copy_mode"]', (e) => {
        let val = $(e.currentTarget).val();
        $('#exerciseCopyModal').find('.info-text').toggleClass('d-none', val == '1');
    });
    $('#exerciseCopyModal').on('click', '.btn-apply', (e) => {
        if ($('#exerciseCopyModal').find('.list-group-item.active').length > 0) {
            let modeVal = $('#exerciseCopyModal').find('select[name="copy_mode"]').val();
            let exsId = $('.exs-list-group').find('.exs-elem.active').attr('data-id');
            let fromNfbFolder = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none');
            let selectedFolder = $('#exerciseCopyModal').find('.list-group-item.active').find('.folder-copy-elem').attr('data-id');
            let data = {
                'move_exs': modeVal == '2' ? 1 : 0,
                'copy_exs': modeVal == '1' ? 1 : 0, 
                'exs': exsId, 
                'nfb_folder': fromNfbFolder ? 1 : 0, 
                'folder': selectedFolder
            };
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "exercises_api",
                success: function (res) {
                    if (res.success) {
                        swal("Готово", "Обновите папку, чтобы увидеть данное упражение.", "success");
                    } else {
                        swal("Ошибка", "Упражнение не удалось скопировать / переместить.", "error");
                        console.log(res);
                    }
                },
                error: function (res) {
                    swal("Ошибка", "Упражнение не удалось скопировать / переместить.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                    $('#exerciseCopyModal').modal('hide');
                }
            });
        }
    });


    // Open last exercise from card
    window.lastExercise = false;
    CheckLastExs();


    // Toggle marker for exercise
    $('.exercises-block').on('click', 'button[data-type="marker"]', (e) => {
        let exsId = $(e.currentTarget).parent().parent().parent().attr('data-id');
        let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
        let cId = $(e.currentTarget).attr('data-id');
        let state = $(e.currentTarget).hasClass('selected');
        let dataToSend = {'edit_exs_user_params': 1, 'exs': exsId, 'nfb': fromNFB, 'data': {'key': cId, 'value': state ? 0 : 1}};
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
                    if (cId == "watched") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="watched_not"]').toggleClass('selected', false);
                    }
                    if (cId == "watched_not") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="watched"]').toggleClass('selected', false);
                    }
                    if (cId == "like") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="dislike"]').toggleClass('selected', false);
                    }
                    if (cId == "dislike") {
                        $(e.currentTarget).parent().find('button[data-type="marker"][data-id="like"]').toggleClass('selected', false);
                    }
                    $(e.currentTarget).toggleClass('selected', res.data.value == 1);
                    if ($(e.currentTarget).find('input').length > 0) {
                        $(e.currentTarget).find('input').prop('checked', res.data.value == 1);
                    }
                    if ($(e.currentTarget).find('span.icon-custom').length > 0) {
                        $(e.currentTarget).find('span.icon-custom').toggleClass('icon--favorite', res.data.value != 1);
                        $(e.currentTarget).find('span.icon-custom').toggleClass('icon--favorite-selected', res.data.value == 1);
                    }
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


    // Open graphics in modal
    $('.visual-block').on('click', '.carousel-item', (e) => {
        e.preventDefault();

        $('#exerciseGraphicsModal').find('.modal-body').find('.carousel-item').each((ind, elem) => {
            $(elem).removeClass('active');
            if ($(elem).hasClass('description-item')) {return;}
            $(elem).remove();
        });
        let parentId = $(e.currentTarget).parent().parent().attr('id');
        let items = $('#carouselSchema').find('.carousel-item').clone();
        if (parentId != "carouselSchema") {$(items).removeClass('active');}
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        
        items = $('#carouselVideo').find('.carousel-item').clone();
        if (parentId != "carouselVideo") {$(items).removeClass('active');}
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            if ($(item).find('.video-js').length > 0) {
                $(item).find('.video-js').removeClass('not-active');
                $(item).find('.video-js').attr('id', `video-playerClone-${i}`);
            }
        }
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);
        window.videoPlayerClones = [];
        for (let i = 0; i < items.length; i++) {
            window.videoPlayerClones[i] = videojs($('#exerciseGraphicsModal').find(`#video-playerClone-${i}`)[0], {
                preload: 'auto',
                autoplay: false,
                controls: true,
                aspectRatio: '16:9',
                youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
            });
            window.videoPlayerClones[i].ready((e) => {
                if (i == 0) {
                    window.videoPlayerClones[i].src({techOrder: ["youtube"], type: 'video/youtube', src: "https://www.youtube.com/watch?v=sNZPEnc4m0w"});
                } else if (i == 1) {
                    window.videoPlayerClones[i].src({techOrder: ["youtube"], type: 'video/youtube', src: "https://www.youtube.com/watch?v=K0x8Z8JxQtA"});
                }
            });
        }

        items = $('#carouselAnim').find('.carousel-item').clone();
        if (parentId != "carouselAnim") {$(items).removeClass('active');}
        $('#exerciseGraphicsModal').find('#carouselGraphics > .carousel-inner').append(items);

        $('#exerciseGraphicsModal').modal('show');
    });


    // Save & Load current folders mode
    window.addEventListener("beforeunload", (e) => {
        let toggledFolders = $('#toggleFoldersNames').attr('data-state') == '1';
        let cFolderType = $('.up-tabs-elem.folders-toggle:not(.d-none)').first().attr('data-id');
        let foldersSettings = JSON.stringify({'expandToggled': toggledFolders, 'type': cFolderType});
        localStorage.setItem('folders_sets', foldersSettings);
    }, false);
    let cFoldersSettings = localStorage.getItem('folders_sets');
    try {
        cFoldersSettings = JSON.parse(cFoldersSettings);
    } catch(e) {}
    if (cFoldersSettings.expandToggled !== null && cFoldersSettings.expandToggled !== undefined) {
        if (cFoldersSettings.expandToggled) {
            setTimeout((e) => {
                $('#toggleFoldersNames').first().click();
            }, 600);
        }
    }
    if (cFoldersSettings.type !== null && cFoldersSettings.type !== undefined) {
        $('.up-tabs-elem.folders-toggle').addClass('d-none');
        $(`.up-tabs-elem[data-id="${cFoldersSettings.type}"]`).removeClass('d-none');
        $('.folders-block > div').addClass('d-none');
        $(`.folders-block > div[data-id="${cFoldersSettings.type}"]`).removeClass('d-none');
    }


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);


});
