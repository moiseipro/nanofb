function RenderSplitCols() {
    $('.exercises-list').find('div.gutter').remove();
    let sizesArr = window.dataForSplit;
    window.split = Split(['#splitCol_0', '#splitCol_1', '#splitCol_2'], {
        sizes: sizesArr,
        gutterSize: 16,
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

    $('#exerciseCardModal').find('div.gutter').remove();
    sizesArr = window.dataForSplit2;
    window.split2 = Split(['#splitCol_10', '#splitCol_11'], {
        sizes: sizesArr,
        dragInterval: 1,
        gutterSize: 16,
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
}

function ResizeSplitCols() {
    let state = $('#toggleFoldersNames').attr('data-state') == '1';
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
    } catch(e) {}
    // let colWidth = !state ? `calc(${$('#splitCol_0').css('width')} / 2)` : `calc(${$('#splitCol_2').css('width')} * 2)`;
    // $('#splitCol_0').css('width', colWidth);
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
            <div class="row w-100">
                <div class="col-12 d-flex">
                    <span class="ml-3 w-100">
                        ${i+1}. Упражнение "${exElem.title}", автор: ${exElem.user}
                    </span>

                    <button type="button" class="btn btn-secondary btn-sm btn-marker elem-flex-center size-w-x size-h-x ${exElem.favorite == true ? 'selected' : ''}" data-type="marker" data-id="favorite" style="--w-x:24px; --h-x:24px;" title="Избранное">
                        <span class="icon-custom icon--favorite" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-marker elem-flex-center size-w-x size-h-x ${exElem.watched == true ? 'selected' : ''}" data-type="marker" data-id="watched" style="--w-x:24px; --h-x:24px;" title="Просмотрено">
                        <span class="icon-custom icon--eye" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-marker elem-flex-center size-w-x size-h-x ${(!exElem.watched == true) ? 'selected' : ''}" data-type="marker" data-id="watched_not" style="--w-x:24px; --h-x:24px;" title="Просмотрено">
                        <span class="icon-custom icon--eye-not" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-marker elem-flex-center size-w-x size-h-x ${exElem.like == true ? 'selected' : ''}" data-type="marker" data-id="like" style="--w-x:24px; --h-x:24px;" title="Просмотрено">
                        <span class="icon-custom icon--like" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-marker elem-flex-center size-w-x size-h-x ${exElem.dislike == true ? 'selected' : ''}" data-type="marker" data-id="dislike" style="--w-x:24px; --h-x:24px;" title="Просмотрено">
                        <span class="icon-custom icon--dislike" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>

                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="num" style="--w-x:24px; --h-x:24px;" disabled="">
                        №
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="players" style="--w-x:24px; min-width: 24px; --h-x:24px;" disabled="">
                        #
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="goal" style="--w-x:24px; min-width: 24px; --h-x:24px;" disabled="">
                        G.
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="ball" style="--w-x:24px; --h-x:24px;" disabled="">
                        <span class="icon-custom icon--ball" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="watches" style="--w-x:24px; --h-x:24px;" disabled="">
                        <span class="icon-custom icon--check" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="favor" style="--w-x:24px; --h-x:24px;" disabled="">
                        <span class="icon-custom icon--favorite" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="like" style="--w-x:24px; --h-x:24px;" disabled="">
                        <span class="icon-custom icon--like" style="--i-w: 1.1em; --i-h: 1.1em;"></span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="video" style="--w-x:24px; min-width: 24px; --h-x:24px;" disabled="">
                        V.
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="anim" style="--w-x:24px; min-width: 24px; --h-x:24px;" disabled="">
                        A.
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm btn-icons elem-flex-center size-w-x size-h-x" data-type="icons" data-id="stress" style="--w-x:24px; --h-x:24px;" disabled="">
                        IQ.
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
        window.lastExercise = false;
    }
}

// Handler for func LoadExerciseOne in exercise card:
function LoadExerciseOneHandler() {
    let activeExs = $('.exercises-list').find('.exs-elem.active');
    if ($(activeExs).length <= 0) {return;}
    let cId = $(activeExs).attr('data-id');
    let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
    LoadExerciseOne(cId, fromNFB);
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
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
        }
        window.lastListUsed = "folders";
    });
    $('.folders_nfb_list').on('click', '.list-group-item', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.folders_nfb_list').find('.list-group-item').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
        if (!isActive) {LoadFolderExercises();}
        else {
            $('.exs-list-group').html('<li class="list-group-item py-2">Выберите для начала папку.</li>');
        }
        window.lastListUsed = "folders";
    });


    // Change folder or exercise using keys
    window.lastListUsed = "folders";
    $(document).keypress((e) => {
        if ($('#exerciseCardModal').hasClass('show')) {return;}
        if (window.lastListUsed == "folders") {
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
        } else if (window.lastListUsed == "exercises") {
            let currentList = '.exs-list-group';
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
            LoadExerciseOneHandler();
        }
    });


    // Choose exercise
    $('.exercises-list').on('click', '.exs-elem', (e) => {
        if ($(e.target).is('button') || $(e.target).hasClass('icon-custom')) {
            return;
        }
        if ($(e.currentTarget).hasClass('active')) {
            $(e.currentTarget).removeClass('active');
            // RenderExerciseOne(null);
            return;
        }
        $('.exercises-list').find('.exs-elem').removeClass('active');
        $(e.currentTarget).addClass('active');
        LoadExerciseOneHandler();
    });


    // Split columns
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols'));
    if (!window.dataForSplit) {
        window.dataForSplit = [25, 35, 40];
        localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
    }
    window.dataForSplit2 = JSON.parse(localStorage.getItem('split_cols2'));
    if (!window.dataForSplit2) {
        window.dataForSplit2 = [50, 50];
        localStorage.setItem('split_cols2', JSON.stringify(window.dataForSplit2));
    }
    RenderSplitCols();


    // Video JS
    window.videoPlayer = videojs('video-player', {
        preload: 'auto',
        autoplay: false,
        controls: true,
        aspectRatio: '16:9',
        youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 },
    });
    window.videoPlayer2 = videojs('video-player2', {
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
    window.videoPlayer2.ready((e) => {
        window.videoPlayer2.src({techOrder: ["youtube"], type: 'video/youtube', src: "https://www.youtube.com/watch?v=K0x8Z8JxQtA"});
    });


});
