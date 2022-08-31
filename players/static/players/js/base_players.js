let cPlayerData = {};
function LoadPlayerOne(id = null) {
    let data = {'get_player': 1, 'id': id};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            data: data,
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "/players/players_api",
            success: function (res) {
                if (res.success) {
                    cPlayerData = res.data;
                } else {
                    cPlayerData = {};
                }
            },
            error: function (res) {
                cPlayerData = {};
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
                RenderPlayerOne(cPlayerData);
            }
        });
}

function RenderPlayerOne(data) {
    console.log(data)

    $('.cnt-center-block').find('[name="surname"]').val(data.surname);
    $('.cnt-center-block').find('[name="name"]').val(data.name);
    $('.cnt-center-block').find('[name="patronymic"]').val(data.patronymic);
    $('.cnt-center-block').find('[name="citizenship"]').val(data.citizenship);
    $('.cnt-center-block').find('[name="team"]').val(data.team);

    $('.cnt-center-block').find('.img-photo').attr('src', data.photo);
}



$(function() {


    $('table#players').on('click', '.player-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('table#players').find('.player-row').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        LoadPlayerOne(cId);
    });


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

});

