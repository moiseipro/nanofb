let matches_table
let protocol_table

let protocol_table_options = {
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
};

function RenderProtocolInMatches(data) {
    $('#protocol').find('tbody').html('');
    if (Array.isArray(data)) {
        let teamPlayersHtml = "";
        let opponentPlayersHtml = "";
        for (ind in data) {
            let elem = data[ind];
            console.log(elem)
            let tmpHtml = `
                <tr class="protocol-row" data-id="${elem.id}">
                    <td>
                        ${elem.p_num ? elem.p_num : '-'}
                    </td>
                    <td>
                        ${elem.minute_from ? elem.minute_from : '-'}
                    </td>
                    <td>
                        ${elem.minute_to ? elem.minute_to : '-'}
                    </td>
                    <td>
                        ${elem.goal ? elem.goal : '-'}
                    </td>
                    <td>
                        ${elem.penalty ? elem.penalty : '-'}
                    </td>
                    <td>
                        ${elem.p_pass ? elem.p_pass : '-'}
                    </td>
                    <td>
                        ${elem.yellow_card ? elem.yellow_card : '-'}
                    </td>
                    <td>
                        ${elem.red_card ? elem.red_card : '-'}
                    </td>
                    <td>
                        ${elem.estimation ? elem.estimation : '-'}
                    </td>
                </tr>
            `;
            if (!elem.is_opponent) {
                teamPlayersHtml += tmpHtml;
            } else {
                opponentPlayersHtml += tmpHtml;
            }
        }
        $('#protocol').find('tbody').html(`
            ${teamPlayersHtml}
            <tr style="background-color: black;"><td colspan="9"></td</tr>
            ${opponentPlayersHtml}
        `);
    }
}



$(function() {

    ToggleMatchEditFields();
    $('#addMatchBtn').on('click', (e) => {
        RenderMatchEditModal();
        $('#matchEditModal').modal('show');
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
    // protocol_table = $('#protocol').DataTable(protocol_table_options);

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
        let cId = $(e.currentTarget).attr('data-id');
        LoadProtocolMatch(cId, false);
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
