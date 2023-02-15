$(window).on('load', function () {
    $('#send-reset-password-form').validate({
        errorElement: 'p',
    })

    //Восстановление пароля
    $('#send-reset-password-button').on('click', function () {
        if(!$('#send-reset-password-form').valid()) return
        let reset_password = $('#send-reset-password-form').serializeArray()
        let send_data = reset_password
        console.log(send_data);

        ajax_authorization('POST', send_data, 'reset_password', '', 'reset_password').then(function (data) {
            console.log(data)
            $('#reset-password-info').removeClass('d-none')
            swal(gettext('Reset password'), gettext("A link to password recovery was sent to the email"), "warning");
        })
    })
})