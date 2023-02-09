
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
    //$('#personal-form').valid()

    $('#edit-profile-button').on('click', function () {
        if(!$('#edit-personal-form').valid()) return
        let personal = $('#edit-personal-form').serializeArray()
        let send_data = personal
        console.log(send_data);
        send_data = $.merge(send_data, $('#user-form').serializeArray())
        console.log(send_data);

        // ajax_users('POST', send_data, 'registration').then(function (data) {
        //     console.log(data)
        // })
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