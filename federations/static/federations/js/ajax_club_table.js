async function ajax_federation_club_action(method, data, action = '', id = '', func = '') {

    let url = "/federations/api/clubs/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return await $.ajax({
        headers:{"X-CSRFToken": csrftoken },
        url: url,
        type: method,
        dataType: "JSON",
        data: data,
        cache : false,
        processData: false,
        contentType: false,
        success: function(data){
            //console.log(data)
            if ('action' in data) {
                swal(data.action, "success");
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            if ('responseJSON' in jqXHR){
                if('action' in jqXHR.responseJSON){
                    swal(jqXHR.responseJSON.action, '', "error");
                }
            }

        },
        complete: function () {
            $('.page-loader-wrapper').fadeOut();
        }
    })
}

function generate_club_columns() {
    let send_data = {}
    ajax_federation_club_action('GET', send_data, 'club').then(function (data) {
        console.log(data)
        let html = ''
        for (const value of data) {
            html += `
            <div class="col-3 club-column" data-id="${value.id}">
                <div class="card">
                    <img class="card-img-top small-img" src="${value.image}" alt="Club logo cap">
                    <div class="card-body">
                        <h5 class="card-title text-center">${value.name}</h5>
                        <p class="text-center mb-0">${gettext('Licence to: ')+value.date_registration_to}</p>
                    </div>
                </div>
            </div>
            `
        }
        $('.federation-club-columns').html(html)
    })
}