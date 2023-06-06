
$(window).on('load', function () {
    $('#country-select').select2()

    initialize_phone_input()
    $('#edit-personal-form').validate({
        errorElement: 'p',
        rules: {
            phone: {
                required: false
            }
        }
    })
    $('#change-password-form').validate({
        errorElement: 'p',
        rules: {
            password: {
                required: true,
                minlength: 6
            },
            password2: {
                required: true,
                minlength: 6,
                equalTo: '#new_password'
            }
        }
    })

    if (get_url_value('change_password')){
        $('#password-change-open').click()
    }

    //$('#personal-form').valid()

    $('#edit_personal_details').on('shown.bs.modal', function (){
        toggle_edit_mode(true)
    })

    $('#edit_personal_details').on('hidden.bs.modal', function (){
        toggle_edit_mode(false)
    })

    $('#edit-password-button').on('click', function () {
        if(!$('#change-password-form').valid()) return
        let password = $('#change-password-form').serializeArray()
        let send_data = password
        console.log(send_data);

        ajax_profile('PUT', send_data, 'password', '', 'password').then(function (data) {
            console.log(data)
            $('#change-password-form').find("input").val("");
            location.reload()
        })
    })

    $('#edit-profile-button').on('click', function () {
        if(!$('#edit-personal-form').valid()) return
        let personal = $('#edit-personal-form').serializeArray()
        let send_data = personal
        console.log(send_data);
        ajax_profile('PUT', send_data, 'edit', '', 'edit').then(function (data) {
            console.log(data)
            location.reload()
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