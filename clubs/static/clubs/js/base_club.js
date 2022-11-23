
$(document).ready(function () {

})

$(window).on('load', function (){
    initialize_phone_input();
    generate_ajax_club_users_table("calc(100vh - 310px)");
    let send_data = {}
    ajax_club_action('GET', send_data, 'Club').then(function (data) {
        let club = data.results[0]
        let group_arr = []
        console.log(group_arr)
        let html_permission = ``
        if(club.groups.length > 0){
            $.each(club.groups, function(index, value){
                html_permission +=
                `<span class="badge badge-primary mx-1">${value.name}</span>`
            });
        }
        $('#club-groups').html(html_permission)
        $('#club-name').html(club.name)
        $('#club-subdomain').html(club.subdomain)
        $('#date-registration').html(club.date_registration)
        $('#registration-to').html(club.date_registration_to)
        $('#club-user-info').html('---')
    })

    $('#club-users').on('click', '.edit-club-user', function () {
        let tr_obj = $(this).closest('tr')
        let send_data = {}
        let id = $(this).attr('data-id')
        console.log(id)
        $('#edit-club-user-modal').attr('data-user', id)
        ajax_club_action('GET', send_data, 'Club').then(function (data) {
            let club = data.results[0]
            let row_data = club_users_table.row(tr_obj).data()
            let group_arr = []
            $.each( row_data.groups, function( key, value ) {
                group_arr.push(value['id'])
            });
            console.log(group_arr)
            let html_permission = ``
            if(club.groups.length > 0){
                html_permission += `<div class="row">`
                $.each(club.groups, function(index, value){
                    html_permission += `<div class="col-12 px-1">`
                    html_permission +=
                    `<div class="custom-control custom-checkbox border">
                        <input type="checkbox" class="custom-control-input check-permission" data-id="${value.id}" ${$.inArray( value.id, group_arr) != -1 ? 'checked' : ''} id="group-permission-${value.id}">
                        <label class="custom-control-label" for="group-permission-${value.id}">${value.name}</label>
                    </div>`
                    html_permission += `</div>`
                });
                html_permission += `</div>`
            }
            $('#user-permissions').html(html_permission)
        })
        ajax_team_action('GET', send_data, 'get team').then(function (data) {
            let teams = data.results
            let row_data = club_users_table.row(tr_obj).data()
            console.log(teams)
            if(teams.length > 0) {
                let html_teams = ``
                $.each(teams, function (key, value) {
                    html_teams +=
                    `<div class="custom-control custom-checkbox border">
                        <input type="checkbox" class="custom-control-input check-team" data-id="${value.id}" ${$.inArray( row_data.id, value.users) != -1 ? 'checked' : ''} id="team-permission-${value.id}">
                        <label class="custom-control-label" for="team-permission-${value.id}">${value.name}</label>
                    </div>`
                });
                $('#user-team-permissions').html(html_teams)
            }

        })

    })
    
    $(document).on('click', '.check-permission', function () {
        let user_id = $('#edit-club-user-modal').attr('data-user');
        let group_id = $(this).attr('data-id')
        let send_data = {group_id}
        ajax_club_users_action('POST', send_data, 'change permission', user_id, 'change_permission').then(function (data) {
            console.log(data)
            club_users_table.ajax.reload()
        })
    })
    $(document).on('click', '.check-team', function () {
        let user_id = $('#edit-club-user-modal').attr('data-user');
        let team_id = $(this).attr('data-id')
        let send_data = {user_id}
        ajax_team_action('POST', send_data, 'change permission', team_id, 'change_permission').then(function (data) {
            console.log(data)
            club_users_table.ajax.reload()
        })
    })

    $('#form-add-user').validate()
    $('#form-add-personal').validate()

    $('#create-club-user').on('click', function () {
        if(!$('#form-add-user').valid() || !$('#form-add-personal').valid()) return
        let personal = $('#form-add-personal').serializeArray()
        let send_data = personal
        console.log(send_data);
        // personal.forEach(function(value){
        //     send_data.push({'personal': JSON.stringify(serializeArray())})
        // })
        send_data = $.merge(send_data, $('#form-add-user').serializeArray())
        console.log(send_data);

        ajax_club_users_action('POST', send_data, 'add user').then(function (data) {
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
        preferredCountries: ["ru", "ua", "by", "es"]
    });
}