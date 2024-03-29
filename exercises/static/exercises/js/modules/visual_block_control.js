function RenderCarouselAll() {
    $('.visual-block').find('#carouselAll').find('.carousel-inner').html('');
    setTimeout(() => {
        let elems = $('.visual-block').find('#carouselSchema').find('.carousel-inner > div:not(.d-none)').clone();
        $('.visual-block').find('#carouselAll').find('.carousel-inner').append(elems);
        elems = $('.visual-block').find('#carouselVideo').find('.carousel-inner > div:not(.d-none)').clone();
        $(elems).find('video').attr('id', '');
        $('.visual-block').find('#carouselAll').find('.carousel-inner').append(elems);
        elems = $('.visual-block').find('#carouselAnim').find('.carousel-inner > div:not(.d-none)').clone();
        $('.visual-block').find('#carouselAll').find('.carousel-inner').append(elems);
        $(elems).find('video').attr('id', '');
        $('.visual-block').find('#carouselAll').find('.carousel-inner > div').removeClass('active');
        $('.visual-block').find('#carouselAll').find('.carousel-inner > div').first().addClass('active');
    
        $('.visual-block').find('#carouselAll').find('.carousel-item').find('.img-lazyload').each((index, elem) => {
            $(elem).removeClass('d-none');
            $(elem).prev().addClass('d-none');
        });
    }, 500);
}



$(function() {
    RenderCarouselAll();
    $('.visual-block > .row > .col-12').addClass('d-none');
    $('.visual-block').find('[data-id="carousel_all"]').removeClass('d-none');    
});
