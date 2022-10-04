let matches_table

function RenderMatchEditModal(id = null) {
    $('#matchEditModal').find('.form-control').val('');
    let cTeamName = $('#select-team').find('option[selected=""]').text();
    $('#matchEditModal').find('.form-control[name="team_name"]').val(cTeamName);
    $('#matchEditModal').find('.form-control[name="m_type"]').val('0');
    $('#matchEditModal').find('.form-control[name="opponent_name"]').prop('disabled', false);
    $('#matchEditModal').find('.form-control[name="opponent_team"]').prop('disabled', false);
    $('#matchEditModal').find('.form-control[type="number"]').val('0');
    $('#matchEditModal').find('.add-title').toggleClass('d-none', false);
    $('#matchEditModal').find('.edit-title').toggleClass('d-none', true);

    $('#matchEditModal').find('.modal-body').attr('data-id', "");
    let data = {'get_match': 1, 'id': id};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "matches_api",
        success: function (res) {
            if (res.success) {
                $('#matchEditModal').find('.modal-body').attr('data-id', id);
                for (key in res.data) {
                    $('#matchEditModal').find(`.form-control[name="${key}"]`).val(res.data[key]);
                }
                $('#matchEditModal').find('.form-control[name="opponent_name"]').prop('disabled', true);
                $('#matchEditModal').find('.form-control[name="opponent_team"]').prop('disabled', true);
                $('#matchEditModal').find('.add-title').toggleClass('d-none', true);
                $('#matchEditModal').find('.edit-title').toggleClass('d-none', false);
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });

}



$(function() {

    $('#addMatchBtn').on('click', (e) => {
        RenderMatchEditModal();
        $('#matchEditModal').modal('show');
    });
    $('#matchEditModal').on('change', '.form-control[name="opponent_team"]', (e) => {
        let val = $(e.currentTarget).val();
        let teamName = $(e.currentTarget).find(`option[value="${val}"]`).text();
        $('#matchEditModal').find('.form-control[name="opponent_name"]').val(teamName);
    });
    $('#matchEditModal').on('keyup', '.form-control[name="opponent_name"]', (e) => {
        $('#matchEditModal').find('.form-control[name="opponent_team"]').val('');
    });
    $('#matchEditModal').on('click change', '.form-control', (e) => {
        $(e.currentTarget).removeClass('not-valid');
    });
    $('#matchEditModal').on('click', '.btn[name="save"]', (e) => {
        let dataToSend = {};
        let wasValidated = true;
        $('#matchEditModal').find('.form-control').removeClass('not-valid');
        $('#matchEditModal').find('.form-control').each((ind, elem) => {
            if ($(elem).attr('required') && $(elem).val() == "") {
                $(elem).addClass('not-valid');
                wasValidated = false;
            }
            if ($(elem).attr('type') == "number") {
                let tNumVal = parseInt($(elem).val());
                if (isNaN(tNumVal) || tNumVal < 0) {
                    $(elem).val('0');
                    $(elem).addClass('not-valid');
                    wasValidated = false;
                }
            }
            dataToSend[$(elem).attr('name')] = $(elem).val();
        });

        if (wasValidated) {
            let cId = $('#matchEditModal').find('.modal-body').attr('data-id');
            let data = {'edit_match': 1, 'data': JSON.stringify(dataToSend), 'id': cId};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "matches_api",
                success: function (res) {
                    if (res.success) {
                        swal("Готово", "Матч успешно создан / изменен.", "success")
                        .then((value) => {
                            $('.page-loader-wrapper').fadeIn();
                            window.location.reload();
                        });
                    } else {
                        swal("Ошибка", `При создании / изменении матча произошла ошибка (${res.err}).`, "error");
                    }
                },
                error: function (res) {
                    swal("Ошибка", "Матч не удалось создать / изменить.", "error");
                    console.log(res);
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
    });


    // table matches
    matches_table = $('#matches').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row'<'col-sm-12 col-md '><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'f>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
        serverSide: false,
        processing: false,
        paging: false,
        searching: false,
        select: false,
        drawCallback: function( settings ) {
        },
        columnDefs: [
            { "searchable": false, "orderable": false, "targets": [2, 6] }
        ],
    });

    $('.card-header').on('click', '.clear-collapses', (e) => {
        $('.card-header').find('.toggle-collapse').removeClass('active');
        $(e.currentTarget).addClass('active');
        $('.card-body').find('.collapse-block').collapse('hide');
    });
    $('.card-header').on('click', '.toggle-collapse', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('.card-header').find('.toggle-collapse').removeClass('active');
        $('.card-header').find('.clear-collapses').toggleClass('active', isActive);
        $(e.currentTarget).toggleClass('active', !isActive);
        $('.card-body').find('.collapse-block').collapse('hide');
    });


    $('#matches').on('click', '.match-row', (e) => {
        if ($(e.target).is("a") || $(e.target).is('i')) {return;}
        let isSelected = $(e.currentTarget).hasClass("selected");
        $('#matches').find('.match-row').removeClass("selected");
        $(e.currentTarget).toggleClass("selected", !isSelected);
    });

    $('.card-body').on('click', 'a[action="goToMatchCard"]', (e) => {
        let selectedRow = $('#matches').find('.match-row.selected');
        if ($(selectedRow).length > 0) {
            let cId = $(selectedRow).attr('data-id');
            window.location.href = `match?id=${cId}`;
        }
    });
    $('.card-body').on('click', 'a[action="editMatch"]', (e) => {
        let selectedRow = $('#matches').find('.match-row.selected');
        if ($(selectedRow).length > 0) {
            let cId = $(selectedRow).attr('data-id');
            RenderMatchEditModal(cId);
            $('#matchEditModal').modal('show');
        }
    });
    $('.card-body').on('click', 'a[action="removeMatch"]', (e) => {
        let selectedRow = $('#matches').find('.match-row.selected');
        if ($(selectedRow).length > 0) {
            swal({
                title: "Вы точно хотите удалить матч?",
                text: "После удаления, данный матч невозможно будет восстановить!",
                icon: "warning",
                buttons: ["Отмена", "Подтвердить"],
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    let cId = $(selectedRow).attr('data-id');
                    let data = {'delete_match': 1, 'id': cId};
                    $('.page-loader-wrapper').fadeIn();
                    $.ajax({
                        headers:{"X-CSRFToken": csrftoken},
                        data: data,
                        type: 'POST', // GET или POST
                        dataType: 'json',
                        url: "matches_api",
                        success: function (res) {
                            if (res.success) {
                                swal("Готово", "Матч успешно удален.", "success")
                                .then((value) => {
                                    $('.page-loader-wrapper').fadeIn();
                                    window.location.reload();
                                });
                            }
                        },
                        error: function (res) {
                            swal("Ошибка", "Матч удалить не удалось.", "error");
                            console.log(res);
                        },
                        complete: function (res) {
                            $('.page-loader-wrapper').fadeOut();
                        }
                    });
                }
            });
        }
    });



    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

});
