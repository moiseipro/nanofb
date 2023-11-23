function load_club_data(id = -1) {
    if(id == -1) return false;
    let send_data = {}
    $('#clubs-table-tab .management-main-block input[type="file"]').val('')
    ajax_club_action('GET', send_data, 'club data', id).then(function (data) {
        console.log(data)
        let club = data
        for (const idKey in club) {
            if (idKey == 'image'){
                $('#clubs-table-tab .management-main-block .club-image').attr("src", club[idKey])
            } else {
                $('#clubs-table-tab .management-main-block select[name="'+idKey+'"]').val(club[idKey])
                $('#clubs-table-tab .management-main-block input[name="'+idKey+'"]').val(club[idKey])
            }

            // if (idKey == 'is_demo_mode' || idKey == 'is_superuser'){
            //     $('#clubs-table-tab .management-main-block input[name="'+idKey+'"]').prop('checked', club[idKey])
            // } else {
            //
            // }
        }
    })
}