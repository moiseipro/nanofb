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

let exercises = {};
function LoadFolderExercises() {
    let activeRow = $('.folders_list').find('.list-group-item.active');
    if (activeRow.length <= 0) {return;}
    let cFolderId = $(activeRow).find('.folder-elem').attr('data-id');
    if (cFolderId in exercises) {
        RenderFolderExercises(cFolderId);
    } else {
        let data = {'get_exs': 1, 'folder': cFolderId};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            data: data,
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "exercises_api",
            success: function (res) {
                if (res.success) {
                    exercises[cFolderId] = res.data;
                } else {
                    exercises[cFolderId] = [];
                }
            },
            error: function (res) {
                exercises[cFolderId] = [];
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
                RenderFolderExercises(cFolderId);
            }
        });
    }
}
function RenderFolderExercises(id) {
    let exs = exercises[id];
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
    $(document).keypress((e) => {
        let activeElem = $('.folders_list').find('.list-group-item.active');
        if (e.which == 119) { // w
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).prev().addClass('active');
            } else {
                $('.folders_list').find('.list-group-item').last().addClass('active');
            }
        }
        if (e.which == 115) { // s
            if (activeElem.length > 0) {
                $(activeElem).removeClass('active');
                $(activeElem).next().addClass('active');
            } else {
                $('.folders_list').find('.list-group-item').first().addClass('active');
            }
        }
        LoadFolderExercises();
    });

    // Choose exercise
    $('.exercises-list').on('click', '.exs-elem', (e) => {
        $('.exercises-list').find('.exs-elem').removeClass('active');
        $(e.currentTarget).addClass('active');
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
        $('#exerciseCardModal').modal('show');
    });


    // Split columns
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols'));
    if (!window.dataForSplit) {
        window.dataForSplit = [15, 35, 40, 10];
        localStorage.setItem('split_cols', JSON.stringify(window.dataForSplit));
    }
    RenderSplitCols();

});
