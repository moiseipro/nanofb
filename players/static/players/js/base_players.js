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

function RenderPlayerOne(data = {}) {
    console.log(data)

    $('.cnt-center-block').find('.form-control').prop('readonly', true);
    $('.cnt-center-block').find('.form-control').removeClass('req-empty');

    $('.cnt-center-block').find('[name="surname"]').val(data.surname);
    $('.cnt-center-block').find('[name="name"]').val(data.name);
    $('.cnt-center-block').find('[name="patronymic"]').val(data.patronymic);
    $('.cnt-center-block').find('[name="citizenship"]').val(data.citizenship);
    $('.cnt-center-block').find('[name="team"]').val(data.team);

    $('.cnt-center-block').find('.img-photo').attr('src', data.photo ? data.photo : '#');
}



$(function() {


    $('table#players').on('click', '.player-row', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('table#players').find('.player-row').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        LoadPlayerOne(cId);
    });


    // Change Team
    let cTeam = $('#select-team').find('option[selected=""]').text();
    $('#currentTeam').text(cTeam);
    let prevTeamVal = $('#select-team').find('option[selected=""]').prev().attr('value');
    let isPrevTeam = prevTeamVal && prevTeamVal != "" ? true : false;
    let nextTeamVal = $('#select-team').find('option[selected=""]').next().attr('value');
    let isNextTeam = nextTeamVal && nextTeamVal != "" ? true : false;
    $('#prevTeam').prop('disabled', !isPrevTeam);
    $('#nextTeam').prop('disabled', !isNextTeam);
    $('#prevTeam').on('click', (e) => {
        let prevTeamVal = $('#select-team').find('option[selected=""]').prev().attr('value');
        let isPrevTeam = prevTeamVal && prevTeamVal != "" ? true : false;
        if (isPrevTeam) {
            $('#select-team').val(prevTeamVal);
            $('#select-team').change();
        }
    });
    $('#nextTeam').on('click', (e) => {
        let nextTeamVal = $('#select-team').find('option[selected=""]').next().attr('value');
        let isNextTeam = nextTeamVal && nextTeamVal != "" ? true : false;
        if (isNextTeam) {
            $('#select-team').val(nextTeamVal);
            $('#select-team').change();
        }
    });


    $('.cnt-center-block').on('click', '.img-photo', (e) => {
        if (window.editingMode == true) {
            let tempClone = $(e.currentTarget).clone();
            $('#showImgPhoto').find('.photo-block > div').html(tempClone);
            $('#showImgPhoto').modal('show');
        }
    });
    $('#showImgPhoto').on('change', '#fileImgPhoto', (e) => {
        if ($(e.currentTarget)[0].files[0].size > 5097152) {
            swal("Внимание", "Файл превыщает допустимый размер (> 5Mb).", "info");
            $(e.currentTarget).val('');
            return;
        }
        if ($(e.currentTarget)[0].files && $(e.currentTarget)[0].files[0]) {
            let reader = new FileReader();
            reader.onload = (e2) => {
              $('#showImgPhoto').find('.img-photo').attr('src', e2.target.result);
            };
            reader.readAsDataURL($(e.currentTarget)[0].files[0]);
        }
    });


    window.editingMode = false;
    // Add player
    $('#addPlayer').on('click', (e) => {
        $('.b-add-off').addClass('d-none');
        $('.b-add-on').removeClass('d-none');
        $('table#players').find('.player-row').removeClass('selected');
        RenderPlayerOne();
        $('.cnt-center-block').find('.edit-field').prop('readonly', false);
        window.editingMode = true;
        $('#showImgPhoto').find('#fileImgPhoto').val('');
    });

    // Edit player
    $('#editPlayer').on('click', (e) => {
        if ($('table#players').find('.player-row.selected').length == 0) {return;}
        $('.b-edit-off').addClass('d-none');
        $('.b-edit-on').removeClass('d-none');
        $('.cnt-center-block').find('.edit-field').prop('readonly', false);
        window.editingMode = true;
        $('#showImgPhoto').find('#fileImgPhoto').val('');
    });

    // Cancel editing or adding
    $('#cancelPlayer').on('click', (e) => {
        $('.b-add-on').addClass('d-none');
        $('.b-edit-on').addClass('d-none');
        $('.b-edit-off').removeClass('d-none');
        let selectedRowId = $('table#players').find('.player-row.selected').attr('data-id');
        if (selectedRowId) {LoadPlayerOne(selectedRowId);}
        else {RenderPlayerOne();}
        window.editingMode = false;
    });

    // Save Player
    $('#savePlayer').on('click', (e) => {
        let selectedRowId = $('table#players').find('.player-row.selected').attr('data-id');
        let dataToSend = new FormData();
        dataToSend.append('edit_player', 1);
        dataToSend.append('id', selectedRowId);
        let requiredErr = false;
        $('.cnt-center-block').find('.edit-field').each((ind, elem) => {
            if ($(elem).attr('required') && (!$(elem).val() || $(elem).val() == "")) {
                requiredErr = true;
                $(elem).addClass('req-empty');
            }
            if (!$(elem).hasClass('d-none') || true) {
                let name = $(elem).attr('name');
                dataToSend.append(`data[${name}]`, $(elem).val()); 
            }
        });
        if ($('#showImgPhoto').find('#fileImgPhoto')[0].files[0]) {
            dataToSend.append('filePhoto', $('#showImgPhoto').find('#fileImgPhoto')[0].files[0]);
        }
        if (requiredErr) {
            swal("Внимание", "Не все обязательные поля заполнены.", "info");
            return;
        }
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            data: dataToSend,
            processData: false,
            contentType: false,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Игрок успешно создан / изменён.", "success")
                    .then((value) => {
                        $('.page-loader-wrapper').fadeIn();
                        window.location.reload();
                    });
                } else {
                    swal("Ошибка", `При создании / изменении игрока произошла ошибка (${res.err}).`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", "Игрока не удалось создать / изменить.", "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('.cnt-center-block').on('click', '.edit-field', (e) => {
        $(e.currentTarget).removeClass('req-empty');
    });
    $('.cnt-center-block').on('change', '.edit-field', (e) => {
        let cVal = $(e.currentTarget).val();
        $(e.currentTarget).toggleClass('req-empty', !(cVal && cVal != ""));
    });

    // Delete Player
    $('#deletePlayer').on('click', (e) => {
        swal({
            title: "Вы точно хотите удалить игрока?",
            text: "После удаления данного игрока невозможно будет восстановить!",
            icon: "warning",
            buttons: ["Отмена", "Подтвердить"],
            dangerMode: true,
        })
        .then((willDelete) => {
            if (willDelete) {
                let selectedRowId = $('table#players').find('.player-row.selected').attr('data-id');
                let data = {'delete_player': 1, 'id': selectedRowId};
                $('.page-loader-wrapper').fadeIn();
                $.ajax({
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "players_api",
                    success: function (res) {
                        if (res.success) {
                            swal("Готово", "Игрок успешно удалён.", "success")
                            .then((value) => {
                                $('.page-loader-wrapper').fadeIn();
                                window.location.reload();
                            });
                        }
                    },
                    error: function (res) {
                        swal("Ошибка", "Игрока удалить не удалось.", "error");
                        console.log(res);
                    },
                    complete: function (res) {
                        $('.page-loader-wrapper').fadeOut();
                    }
                });
            }
        });
    });


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

});

