$(window).on('load', function () {

    $("#activation-form").submit(function (e) {
        e.preventDefault();
        let action = $(this).attr('action')
        let method = $(this).attr('method')
        let form_data = $(this).serialize();
        $.ajax({
            type: method,
            url: action,
            data: form_data,
            success: function (data) {
                console.log(data)
                swal(gettext('Activation'), gettext('Account activated')+'!', "success");
                $('#information-button').removeClass('d-none')
                $('#informationModalCenter').modal('show')
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR)
                swal(gettext('Activation'), jqXHR.responseJSON.uid[0], "error");
            }
        });
    });

})