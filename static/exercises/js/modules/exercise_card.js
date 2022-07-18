function RenderSplitExsCardCols() {
    $('#exerciseCard').find('div.gutter').remove();
    sizesArr = window.dataForSplitExsCardCols;
    window.splitExsCardCols = Split(['#splitCol_exscard_0', '#splitCol_exscard_1'], {
        sizes: sizesArr,
        dragInterval: 1,
        gutterSize: 20,
        onDrag: () => {
            let sizes = window.splitExsCardCols.getSizes();
            try {
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
    $('#exerciseCard').find('.exs_edit_field').prop('disabled', !flag);
    $('#exerciseCard').find('.add-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').toggleClass('d-none', !flag);
    $('#exerciseCard').find('.remove-row').parent().toggleClass('d-none', !flag);
    try {
        if (flag) {
            document.descriptionEditor2.disableReadOnlyMode('');
            $(document).find('.ck-editor__top').removeClass('d-none');
        } else {
            document.descriptionEditor2.enableReadOnlyMode('');
            $(document).find('.ck-editor__top').addClass('d-none');
        }
    } catch (e) {}
    window.onlyViewMode = !flag;
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
            }
        })
        .catch(err => {
            console.error(err);
        });


    window.dataForSplitExsCardCols = JSON.parse(localStorage.getItem('split_exs_card_cols'));
    if (!window.dataForSplitExsCardCols) {
        window.dataForSplitExsCardCols = [40, 60];
        localStorage.setItem('split_exs_card_cols', JSON.stringify(window.dataForSplitExsCardCols));
    }
    RenderSplitExsCardCols();


    ToggleEditFields(false);


    $('#exerciseCard').on('click', '#openDescription', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_description').addClass('show active');
    });
    $('#exerciseCard').on('click', '#openDrawing', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_drawing').addClass('show active');
    });
    $('#exerciseCard').on('click', '#openVideo', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_video').addClass('show active');
    });
    $('#exerciseCard').on('click', '#openAnimation', (e) => {
        $('#exerciseCard').find('.tab-btn').removeClass('btn-primary');
        $('#exerciseCard').find('.tab-btn').addClass('btn-secondary');
        $(e.currentTarget).removeClass('btn-secondary');
        $(e.currentTarget).addClass('btn-primary');
        $('#exerciseCard').find('#cardBlock > .tab-pane').removeClass('show active');
        $('#exerciseCard').find('#cardBlock > #card_animation').addClass('show active');
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
        if (cId == "additions") {
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"]`).clone();
        } else {
            let cType = $('#exerciseCard').find('.selected[data-type="add"]').attr('data-id');
            cloneRow = $('#exerciseCard').find('.gen-content').find(`tr[data-id="${cId}"][data-type="${cType}"]`).clone();
        }
        $(cloneRow).addClass('wider_row');
        $(cloneRow).find('.form-control').addClass('exs_edit_field');
        $(cloneRow).find('.exs_edit_field').val('');
        $(cloneRow).find('.remove-row').addClass('btn-on');
        $(cloneRow).find('.remove-row').prop('disabled', false);
        $(cloneRow).insertAfter($('#exerciseCard').find(`.wider_row[data-id="${cId}"]`).last());
    });
    $('#exerciseCard').on('click', '.remove-row', (e) => {
        if (!$(e.currentTarget).hasClass('btn-on')) {return;}
        $(e.currentTarget).parent().parent().parent().parent().remove();
    });



    $('#editExs').on('click', (e) => {
        let isActive = $(e.currentTarget).attr('data-active');
        $(e.currentTarget).attr('data-active', isActive == '1' ? 0 : 1);
        $(e.currentTarget).toggleClass('btn-warning', isActive == '1');
        $(e.currentTarget).toggleClass('btn-danger', isActive != '1');
        $(e.currentTarget).text(isActive == '1' ? "Редактировать" : "Отменить");
        $('#saveExs').toggleClass('btn-secondary', isActive == '1');
        $('#saveExs').prop('disabled', isActive == '1');
        $('#saveExs').toggleClass('btn-success', isActive != '1');
        ToggleEditFields(isActive != '1');
    });

});