
$(window).on('load', function (){
    generate_ajax_club_users_table("calc(100vh - 310px)");

    $('#club-users').on('click', '.edit-club-user', function () {
        let send_data = {}
        let id = $(this).attr('data-id')
        console.log(id)
        ajax_club_action('GET', send_data, 'Club').then(function (data) {
            let club = data.results[0]
            console.log(club)
            let html_permission = ``
            if(club.groups.length > 0){
                html_permission += `<div class="row">`
                $.each(club.groups, function(index, value){
                    html_permission += `<div class="col-4 px-1">`
                    html_permission +=
                    `<div class="custom-control custom-checkbox border">
                        <input type="checkbox" class="custom-control-input" id="group-permission-${value.id}">
                        <label class="custom-control-label" for="group-permission-${value.id}">${value.name}</label>
                    </div>`
                    html_permission += `</div>`
                });
                html_permission += `</div>`
            }
            $('#user-permissions').html(html_permission)
        })
    })
})

async function ajax_club_action(method, data, action = '', id = '', func = '') {

    let url = "/clubs/api/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        success: function(data){
            //console.log(data)
            if(data.status == 'exercise_limit'){
                swal(gettext('Training '+action), gettext('The limit of exercises for the selected group has been reached'), "error");
            } else {
                swal(gettext('Training '+action), gettext('Training action "'+action+'" successfully!'), "success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            swal(gettext('Training '+action), gettext('Error when action "'+action+'" the training!'), "error");
        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}