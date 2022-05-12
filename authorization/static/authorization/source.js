
$(function() {
    $('.form-signin input[name="password1"]').on('focus', (e) => {
        $('.form-signin ul').show();
    });
    $('.form-signin input[name="password1"]').on('blur', (e) => {
        $('.form-signin ul').hide();
    });
});
