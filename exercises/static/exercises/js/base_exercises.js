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
    $('.exercises-list').on('click', '.exs-folder', (e) => {
        $('.exercises-list').find('.exs-folder').removeClass('active');
        $('.exercises-list').find('.exs-folder').find('i.fa').removeClass('fa-folder-open-o');
        $('.exercises-list').find('.exs-folder').find('i.fa').addClass('fa-folder-o');
        $(e.currentTarget).addClass('active');
        $(e.currentTarget).find('i.fa').removeClass('fa-folder-o');
        $(e.currentTarget).find('i.fa').addClass('fa-folder-open-o');
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
