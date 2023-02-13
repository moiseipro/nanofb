$(window).on('load', function () {
    $('#send-password-form').validate({
        errorElement: 'p',
        rules: {
            password: {
                required: true,
                minlength: 6
            },
            password2: {
                required: true,
                minlength: 6,
                equalTo: '#new-password'
            }
        }
    })

    //Отправка нового пароля
    $('#send-password-button').on('click', function () {
        if(!$('#send-password-form').valid()) return
        let new_password = $('#send-password-form').serializeArray()
        let send_data = new_password
        console.log(send_data);

        ajax_authorization('POST', send_data, 'reset_password_confirm', '', 'reset_password_confirm').then(function (data) {
            console.log(data)
            swal(gettext('Reset password'), gettext("The new password has been successfully set!"), "success");
            $('#login-href').click()
        })
    })
})