let matches_table = null;
let protocol_table = null;
let protocol_notes_table = null;

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
    "orderFixed": [0, 'asc'],
    "columnDefs": [
        {"searchable": false, "orderable": false, "targets": [3, 12]},
        {"width": "30%", "targets": 2},
        {"visible": false, "targets": 0},
        {"className": "dt-vertical-center", "targets": "_all"}
    ]
};
let protocol_notes_table_options = {
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
    "orderFixed": [0, 'asc'],
    "columnDefs": [
        {"searchable": false, "orderable": false, "targets": [3]},
        {"width": "30%", "targets": 2},
        {"visible": false, "targets": 0},
        {"width": "60%", "targets": 3},
        {"className": "dt-vertical-center", "targets": "_all"}
    ]
};

function RenderProtocolInMatches(data) {
    protocol_table.destroy();
    $('#protocol').find('tbody').html('');
    if (Array.isArray(data)) {
        let teamPlayersHtml = "";
        let opponentPlayersHtml = "";
        for (ind in data) {
            let elem = data[ind];
            let rowClasses = "";
            if (elem.border_red == 1) {rowClasses += "border-red-bottom ";}
            if (elem.border_black == 1) {rowClasses += "border-black-bottom ";}
            let tmpHtml = `
                <tr class="protocol-row ${!elem.is_opponent ? 'row-blue' : 'row-red'} ${rowClasses}" data-id="${elem.id}">
                    <td data-order="${!elem.is_opponent ? "a" : "b"}"></td>
                    <td class="text-center">
                        ${elem.p_num ? elem.p_num : '-'}
                    </td>
                    <td>
                        <div class="row mx-0 justify-content-between">
                            <div class="col-9 px-0 text-left">
                                ${elem.player_name ? elem.player_name : '-'}
                            </div>
                            <div class="col-3 px-0 text-right">
                                ${elem.is_goalkeeper ? `<span title="Вратарь"> (G.) </span>` : ''}
                                ${elem.is_captain ? `<span title="Капитан" style="color: red;"> (К.) </span>` : ''}
                                ${elem.player_position ? `<span title="Позиция"> (${elem.player_position}) </span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td class="text-center">
                        <span title="${elem.status_full}" style="color:red;">${elem.status_short}</span>
                    </td>
                    <td class="text-center">
                        ${elem.minute_from ? elem.minute_from : '-'}
                    </td>
                    <td class="text-center">
                        ${elem.minute_to ? elem.minute_to : '-'}
                    </td>
                    <td class="text-center">
                        ${elem.goal ? elem.goal : '-'}
                    </td>
                    <td class="text-center">
                        ${elem.penalty ? elem.penalty : '-'}
                    </td>
                    <td class="text-center">
                        ${elem.p_pass ? elem.p_pass : '-'}
                    </td>
                    <td class="text-center">
                        ${elem.yellow_card ? elem.yellow_card : '-'}
                    </td>
                    <td class="text-center">
                        ${elem.red_card ? elem.red_card : '-'}
                    </td>
                    <td class="text-center">
                        ${elem.estimation ? elem.estimation : '-'}
                    </td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-secondary video-player-protocol ${elem.videos_count > 0 ? '' : 'btn-empty'}">
                            Видео
                        </button>
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
            ${opponentPlayersHtml}
        `);
    }
    protocol_table = $('#protocol').DataTable(protocol_table_options);
    protocol_table.draw();
}

function RenderProtocolNotesInMatches(data) {
    protocol_notes_table.destroy();
    $('#protocol_notes').find('tbody').html('');
    if (Array.isArray(data)) {
        let teamPlayersHtml = "";
        let opponentPlayersHtml = "";
        for (ind in data) {
            let elem = data[ind];
            let rowClasses = "";
            if (elem.border_red == 1) {rowClasses += "border-red-bottom ";}
            if (elem.border_black == 1) {rowClasses += "border-black-bottom ";}
            let tmpHtml = `
                <tr class="protocol-note-row ${!elem.is_opponent ? 'row-blue' : 'row-red'} ${rowClasses}" data-id="${elem.id}">
                    <td data-order="${!elem.is_opponent ? "a" : "b"}"></td>
                    <td class="text-center">
                        ${elem.p_num ? elem.p_num : '-'}
                    </td>
                    <td>
                        <div class="row mx-0 justify-content-between">
                            <div class="col-9 px-0 text-left">
                                ${elem.player_name ? elem.player_name : '-'}
                            </div>
                            <div class="col-3 px-0 text-right">
                                ${elem.is_goalkeeper ? `<span title="Вратарь"> (G.) </span>` : ''}
                                ${elem.is_captain ? `<span title="Капитан" style="color: red;"> (К.) </span>` : ''}
                                ${elem.player_position ? `<span title="Позиция"> (${elem.player_position}) </span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td class="text-center">
                        ${elem.note ? elem.note : ''}
                    </td>
                </tr>
            `;
            if (!elem.is_opponent) {
                teamPlayersHtml += tmpHtml;
            } else {
                opponentPlayersHtml += tmpHtml;
            }
        }
        $('#protocol_notes').find('tbody').html(`
            ${teamPlayersHtml}
            ${opponentPlayersHtml}
        `);
    }
    protocol_notes_table = $('#protocol_notes').DataTable(protocol_notes_table_options);
    protocol_notes_table.draw();
}

function LoadMatchOneInMatches(id = null) {
    if (id == null || id == undefined) {
        swal("Ошибка", "Матч не найден.", "error");
        return;
    }
    let data = {'get_match': 1, 'id': id};
    let resData = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "matches_api",
        success: function (res) {
            if (res.success) {
                resData = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderMatchOneInMatches(resData);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderMatchOneInMatches(data) {
    let fieldLabelsTeam = []; let fieldLabelsOpponent = [];
    try {
        fieldLabelsTeam = JSON.parse(data.field_labels_team);
    } catch (e) {}
    try {
        fieldLabelsOpponent = JSON.parse(data.field_labels_opponent);
    } catch (e) {}
    SetLabelsToField("playersFieldTeam", fieldLabelsTeam, "35px");
    SetLabelsToField("playersFieldOpponent", fieldLabelsOpponent, "35px");
}

function ToggleColumnsSize(full=true) {
    if (full) {
        $('#splitCol_0').css('width', '100%');
    } else {
        try {
            window.split.setSizes(window.dataForSplit);
        } catch(e) {}
    }
    $('#splitCol_1').toggleClass('d-none', full);
    $('.gutter').toggleClass('d-none', full);
}



$(function() {

    let selectedTeam = $('#select-team').val();
    let selectedSeason = $('#select-season').val();
    if (!selectedTeam || selectedTeam == "" || !selectedSeason || selectedSeason == "") {
        swal("Внимание", "Выберите сезон и команду для отображения данных!", "warning");
    }

    
    window.dataForSplit = JSON.parse(localStorage.getItem('split_cols_matches'));
    if (Array.isArray(window.dataForSplit) && window.dataForSplit.length == 3 || !Array.isArray(window.dataForSplit)) {
        window.dataForSplit = [40, 60];
        localStorage.setItem('split_cols_matches', JSON.stringify(window.dataForSplit));
    }
    let sizesArr = window.dataForSplit;
    window.split = Split(['#splitCol_0', '#splitCol_1'], {
        sizes: sizesArr,
        gutterSize: 12,
        onDrag: () => {
        },
        onDragEnd: (arr) => {
            window.dataForSplit = arr;
            localStorage.setItem('split_cols_matches', JSON.stringify(window.dataForSplit));
        }
    });
    ToggleColumnsSize();

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
            {"searchable": false, "orderable": false, "targets": [0, 2, 6, 12]},
            {"className": "dt-vertical-center", "targets": "_all"}
        ],
        order: [[1, 'desc']],
    });
    protocol_table = $('#protocol').DataTable(protocol_table_options);
    protocol_table.draw();
    protocol_notes_table = $('#protocol_notes').DataTable(protocol_notes_table_options);
    protocol_notes_table.draw();

    $('.card-header').on('click', '.clear-collapses', (e) => {
        ToggleColumnsSize(true);
        $('.card-header').find('.toggle-collapse').removeClass('active');
        $(e.currentTarget).addClass('active');
        $('.card-body').find('.collapse-block').collapse('hide');
        matches_table.columns([8,9,10,11]).visible(true);
    });
    $('.card-header').on('click', '.toggle-collapse', (e) => {
        ToggleColumnsSize(false);
        let isActive = $(e.currentTarget).hasClass('active');
        $('.card-header').find('.toggle-collapse').removeClass('active');
        $('.card-header').find('.clear-collapses').toggleClass('active', isActive);
        $(e.currentTarget).toggleClass('active', !isActive);
        $('.card-body').find('.collapse-block').collapse('hide');
        matches_table.columns([8,9,10,11]).visible(isActive);
    });


    $('#matches').on('click', '.match-row', (e) => {
        if ($(e.target).is("a") || $(e.target).is('i') || $(e.target).is('.btn')) {return;}
        let isSelected = $(e.currentTarget).hasClass("selected");
        $('#matches').find('.match-row').removeClass("selected");
        $(e.currentTarget).toggleClass("selected", !isSelected);
        let cId = $(e.currentTarget).attr('data-id');
        if (!isSelected) {
            LoadProtocolMatch(cId, false);
            LoadMatchOneInMatches(cId);
        } else {
            LoadProtocolMatch(-1, false);
            LoadMatchOneInMatches(-1);
        }
    });
    $('#matches').on('click', '.video-player-match', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        OpenMatchVideoModal("event", cId);
    });

    $('#protocol').on('click', '.video-player-protocol', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        OpenMatchVideoModal("protocol", cId);
    });

    $('.card-body').on('click', 'button[action="goToMatchCard"]', (e) => {
        let selectedRow = $('#matches').find('.match-row.selected');
        if ($(selectedRow).length > 0) {
            $('.page-loader-wrapper').fadeIn();
            let cId = $(selectedRow).attr('data-id');
            window.location.href = `match?id=${cId}`;
        } else {
            swal("Внимание", "Выберите сначала матч.", "warning");
        }
    });
    $('.card-body').on('click', 'button[action="editMatch"]', (e) => {
        let selectedRow = $('#matches').find('.match-row.selected');
        if ($(selectedRow).length > 0) {
            let cId = $(selectedRow).attr('data-id');
            RenderMatchEditModal(cId);
            $('#matchEditModal').modal('show');
        } else {
            swal("Внимание", "Выберите сначала матч.", "warning");
        }
    });
    $('.card-body').on('click', 'button[action="removeMatch"]', (e) => {
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
        } else {
            swal("Внимание", "Выберите сначала матч.", "warning");
        }
    });

    $('button.toggle-collapse').on('click', (e) => {
        let cTarget = $(e.currentTarget).attr('data-target');
        if (cTarget == "#collapse-protocol") {
            try {
                setTimeout(() => {
                    protocol_table.columns.adjust().draw();
                }, 500);
            } catch(e) {}
        } else if (cTarget == "#collapse-notes") {
            try {
                setTimeout(() => {
                    protocol_notes_table.columns.adjust().draw();
                }, 500);
            } catch(e) {}
        }
    });


    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

});
