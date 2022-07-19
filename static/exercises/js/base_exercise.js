


$(function() {

    $('#exerciseCard').find('.modal-body').removeClass('size-h-x');
    $('#exerciseCard').find('.modal-body').attr('style', '');
    $('#exerciseCard').find('#columnsSizeInCard2').remove();

    $('#columnsSizeToggle').on('click', (e) => {
        $('#exerciseCard').find('div.gutter').toggleClass('d-none');
    });

    $('#exerciseCard').on('click', 'button[data-dismiss="modal"]', (e) => {
        window.location.href = `/exercises`;
    });


    $('#exerciseCard').on('click', '.graphics-block', (e) => {
        let content = $(e.currentTarget).clone();
        $(content).find('.size-max-h-x').removeClass('size-max-h-x');
        $('#showGraphicsModal').find('.full-graphics-content').html(content);
        $('#showGraphicsModal').modal('show');
    });

});