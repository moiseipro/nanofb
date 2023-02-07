
$(function() {
    $('.form-signin input[name="password1"]').on('focus', (e) => {
        $('.form-signin ul').show();
    });
    $('.form-signin input[name="password1"]').on('blur', (e) => {
        $('.form-signin ul').hide();
    });


});

$(window).on('load', function () {
    initialize_phone_input()
    $('#personal-form').validate({
        errorElement: 'p',
        rules: {
            phone: {
                required: false
            }
        }
    })
    $('#user-form').validate({
        errorElement: 'p',
        rules: {
            password: {
                required: true,
                minlength: 6
            },
            password2: {
                required: true,
                minlength: 6,
                equalTo: '#id_password'
            }
        }
    })
    //$('#personal-form').valid()
    //$('#user-form').valid()

    $('#registration-button').on('click', function () {
        if(!$('#personal-form').valid() || !$('#user-form').valid()) return
        let personal = $('#personal-form').serializeArray()
        let send_data = personal
        console.log(send_data);
        send_data = $.merge(send_data, $('#user-form').serializeArray())
        console.log(send_data);

        ajax_authorization('POST', send_data, 'registration').then(function (data) {
            console.log(data)
        })
    })
})

function initialize_phone_input() {
    var input = document.querySelector("#phone");
    var iti = window.intlTelInput(input, {
        initialCountry: "auto",
        geoIpLookup: function(callback) {
            $.get('https://ipinfo.io', function() {}, "jsonp").always(function(resp) {
            let countryCode = (resp && resp.country) ? resp.country : "";
            callback(countryCode);
            });
        },
        preferredCountries: ["ru", "by", "es"]
    });
}