let players_table;
let players_table_archive;

function GeneratePlayersTable(scroll_y = '') {
    let isArchive = $('#players').hasClass('archive-table');
    let tableOptions = {
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row d-none'<'col-sm-12 col-md '><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
        serverSide: true,
        processing: true,
        paging: false,
        select: true,
        scrollY: scroll_y,
        colReorder: true,
        drawCallback: function( settings ) {
            //console.log(settings)
            // $('#video-table-counter').text(settings._iRecordsDisplay)
        },
        columnDefs: [
            { "searchable": false, "orderable": false, "targets": 0 },
            {"className": "dt-vertical-center", "targets": "_all"}
        ],
        ajax: {
            url:'players_api',
            data: {'get_players_json_table': 1, 'is_archive': isArchive ? '1': '0'},
        },
        columns: [
            {'data': 'id', 'name': 'id', render: function (data, type, row, meta) {
                return meta.row + meta.settings._iDisplayStart + 1;
            }},
            {'data': 'surname', 'name': 'surname'},
            {'data': 'name', 'name': 'name'},
            {'data': 'patronymic', 'name': 'patronymic'},
            {'data': 'birthsday', 'name': 'card__birthsday', className: "dt-vertical-center border-black-left"},
            {'data': 'citizenship', 'name': 'card__citizenship'},
            {'data': 'team', 'name': 'team__name'},
            {'data': 'position', 'name': 'card__position'},
            {'data': 'additional_options', 'name': 'card__additional_options', className: "text-center"},
            {'data': 'foot', 'name': 'card__foot'},
            {'data': 'growth', 'name': 'card__growth'},
            {'data': 'weight', 'name': 'card__weight'},
            {'data': 'game_num', 'name': 'card__game_num'},
            {'data': 'come', 'name': 'card__come'},
            {'data': 'club_from', 'name': 'card__club_from'},
            {'data': 'contract_with', 'name': 'card__contract_with'},
            {'data': 'contract_by', 'name': 'card__contract_by'},
            {'data': 'video', 'name': 'card__video', orderable: false},
            {'data': 'notes', 'name': 'card__notes', orderable: false},
            {'data': 'level', 'name': 'card__level'},
        ],
    };
    players_table = $('#players').DataTable(tableOptions);
}

function LoadPlayersTableCols() {
    let data = {'get_players_table_cols': 1};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/players/players_api",
        success: function (res) {
            if (res.success) {
                window.playersTableSettings = res.data;
            } else {
                window.playersTableSettings = {};
            }
        },
        error: function (res) {
            window.playersTableSettings = {};
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            if (!window.playersTableSettings.mode || window.playersTableSettings.mode != "nfb") {
                $('#playersTableColsEdit').find('.btns-control').html();
            }
            RenderPlayersTableCols(window.playersTableSettings);
        }
    });
}

function RenderPlayersTableCols(data) {
    let headers = [], rows = {};
    for (let i = 0; i < data.columns.length; i++) {
        let column = data.columns[i];
        if (column.parent == null) {
            headers.push(column);
        } else {
            if (rows[column.parent] && Array.isArray(rows[column.parent])) {
                rows[column.parent].push(column);
            } else {
                rows[column.parent] = [column];
            }
        }
    }
    let columns1 = "";
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i];
        columns1 += `
            <tr class="column-elem parent" data-id="${header.id}" data-parent="${header.parent}" data-root="1">
                <td class=""></td>
                <td class="">
                    <input name="title" class="form-control form-control-sm" type="text" value="${header.title}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="">
                    <input name="text_id" class="form-control form-control-sm" type="text" value="${header.text_id ? header.text_id : ""}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input" name="visible" ${header.visible == true ? 'checked' : ''}>
                </td>
            </tr>
        `;
        if (rows[header.id] && Array.isArray(rows[header.id])) {
            for (let j = 0; j < rows[header.id].length; j++) {
                let row = rows[header.id][j];
                columns1 += `
                    <tr class="column-elem" data-id="${row.id}" data-parent="${row.parent}" data-root="0">
                        <td class=""></td>
                        <td class="">
                            <input name="title" class="form-control form-control-sm w-75 ml-5" type="text" value="${row.title}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="">
                            <input name="text_id" class="form-control form-control-sm" type="text" value="${row.text_id ? row.text_id : ""}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="text-center">
                            <input type="checkbox" class="form-check-input" name="visible" ${row.visible == true ? 'checked' : ''}>
                        </td>
                    </tr>
                `;
            }
        }
    }
    $('#playersTableColsEdit').find('.columns-body').html(columns1);

    if ($.fn.DataTable.isDataTable('#players')) {
        players_table.columns().visible(true);
        for (let i = 0; i < headers.length; i++) {
            let header = headers[i];
            if (header.visible) {
                if (rows[header.id] && Array.isArray(rows[header.id])) {
                    for (let j = 0; j < rows[header.id].length; j++) {
                        let row = rows[header.id][j];
                        let cIndex = players_table.column(`${row.text_id}:name`).index();
                        if (cIndex) {
                            players_table.colReorder.move(cIndex, j);
                        }
                    }
                }
                players_table.columns().visible(false);
                if (rows[header.id] && Array.isArray(rows[header.id])) {
                    for (let j = 0; j < rows[header.id].length; j++) {
                        let row = rows[header.id][j];
                        players_table.column(`${row.text_id}:name`).visible(row.visible);
                    }
                }
                break;
            }
        }
        players_table.columns.adjust().draw();
    }
}

function ToggleColumnOrder(dir) {
    let activeElem = $('#playersTableColsEdit').find(`.column-elem.selected`);
    if (activeElem.length > 0) {
        let cID = $(activeElem).attr('data-id');
        let cParentID = $(activeElem).attr('data-parent');
        let isRoot = $(activeElem).attr('data-root');
        if (isRoot == '1') {
            let elems = $('#playersTableColsEdit').find(`.column-elem[data-root="1"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            let children = $('#playersTableColsEdit').find(`.column-elem[data-root="0"]`);
            $('#playersTableColsEdit').find(`.column-elem[data-root="0"]`).remove();
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
            for (let i = children.length - 1; i >= 0; i--) {
                let elem = children[i];
                let parentId = $(elem).attr('data-parent');
                $('#playersTableColsEdit').find(`.column-elem[data-id="${parentId}"]`).after(elem);
            }
        } else {
            let elems = $('#playersTableColsEdit').find(`.column-elem[data-parent="${cParentID}"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            for (let i = 0; i < elems.length; i++) {
                if ($(elems[i]).attr('data-id') == cID) {
                    if (dir == "up") {
                        tLast = $(elems[i]);
                        if (i - 1 < 0) {
                            newInd = elems.length - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertAfter($(tFirst));
                        } else {
                            newInd = i - 1;
                            tFirst = $(elems[newInd]);
                            $(tLast).detach().insertBefore($(tFirst));
                        }
                    } else if (dir == "down") {
                        tFirst = $(elems[i]);
                        if (i + 1 > elems.length - 1) {
                            newInd = 0;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertBefore($(tLast));
                        } else {
                            newInd = i + 1;
                            tLast = $(elems[newInd]);
                            $(tFirst).detach().insertAfter($(tLast));
                        }
                    }
                    break;
                }             
            }
        }
    }
}

function LoadPlayerData(id = null) {
    let cPlayerData = null;
    let data = {'get_player': 1, 'id': id};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/players/players_api",
        success: function (res) {
            if (res.success) {
                cPlayerData = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            RenderPlayerData(cPlayerData);
        }
    });
}

function RenderPlayerData(data = null) {
    let fieldLabels = [];
    if (data) {
        $('.right-content-container').find('.img-photo').attr('src', data.photo ? data.photo : '#');
        try {
            fieldLabels = JSON.parse(data.field_labels);
        } catch (e) {}
    
    } else {
        $('.right-content-container').find('.img-photo').attr('src', '/static/players/img/player-avatar.png');
        $('.right-content-container').find('.img-field').attr('src', '/static/players/img/player_plane.svg');
    }
    window.fieldLabels = fieldLabels;
    SetLabelsToField("playersField", null, "20px");
}



$(function() {
    GeneratePlayersTable("calc(100vh - 200px)");
    
    $('.b-section').on('click', (e) => {
        let href = $(e.currentTarget).attr('data-href');
        if (href == "#") {return;}
        if (href == "player") {
            let selectedRow = players_table.rows({selected: true}).data().toArray()[0];
            let selectedId = selectedRow ? selectedRow.id : null;
            if (selectedId) {
                sessionStorage.setItem("selectedPlayer", `${selectedId}`)
            }
            sessionStorage.setItem("fromArchive", $('#players').hasClass('archive-table') ? '1' : '0');
        }
        window.location.href = `/players/${href}`;
    });


    // Table columns Settings
    let firstAjaxLoadTable = true;
    $('#players').on('xhr.dt', (e, settings, json, xhr) => {
        if (firstAjaxLoadTable) {
            LoadPlayersTableCols();
            firstAjaxLoadTable = false;
        }
    });
    $('#toggleColumnsTable').on('click', (e) => {
        $('#playersTableColsEdit').modal('show');
    });

    $('#playersTableColsEdit').on('click', '.column-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#playersTableColsEdit').find('.column-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#playersTableColsEdit').on('click', '.col-up', (e) => {
        ToggleColumnOrder("up");
    });
    $('#playersTableColsEdit').on('click', '.col-down', (e) => {
        ToggleColumnOrder("down");
    });
    $('#playersTableColsEdit').on('click', '.col-edit', (e) => {
        $('#playersTableColsEdit').find('input.form-control').prop('disabled', !$('#playersTableColsEdit').find('input.form-control').prop('disabled'));
    });
    $('#playersTableColsEdit').on('click', '.col-add', (e) => {
        let activeElem = $('#playersTableColsEdit').find(`.column-elem.selected`);
        let parent = null;
        if (activeElem.length > 0 && $(activeElem).first().attr('data-root') == '1') {
            parent = $(activeElem).first().attr('data-id');
        }
        let data = {'add_players_table_cols': 1, 'parent': parent};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadPlayersTableCols();
                }
            },
            error: function (res) {
                console.log(res)
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#playersTableColsEdit').on('click', '.col-delete', (e) => {
        let activeElem = $('#playersTableColsEdit').find(`.column-elem.selected`);
        if (activeElem.length > 0) {
            let cId = $(activeElem).first().attr('data-id');
            let data = {'delete_players_table_cols': 1, 'id': cId};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "players_api",
                success: function (res) {
                    if (res.success) {
                        LoadPlayersTableCols();
                    }
                },
                error: function (res) {
                    console.log(res)
                },
                complete: function (res) {
                    $('.page-loader-wrapper').fadeOut();
                }
            });
        }
    });
    $('#playersTableColsEdit').on('click', '[name="save"]', (e) => {
        let dataToSend = [];
        $('#playersTableColsEdit').find('.column-elem').each((ind, elem) => {
            let id = $(elem).attr('data-id');
            let order = ind+1;
            let title = $(elem).find('[name="title"]').val();
            let text_id = $(elem).find('[name="text_id"]').val();
            let visible = $(elem).find('[name="visible"]').is(':checked');
            dataToSend.push({
                id, order, title, text_id, visible
            });
        });
        let data = {'edit_players_table_cols': 1, 'data': JSON.stringify(dataToSend)};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadPlayersTableCols();
                }
            },
            error: function (res) {
                console.log(res)
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });

    $('.columns-body').on('click', 'input[name="visible"]', (e) => {
        let row = $(e.currentTarget).parent().parent();
        let val = $(e.currentTarget).prop('checked');
        if ($(row).attr('data-root') == '1') {
            $('.columns-body').find('tr[data-root="1"]').find('input[name="visible"]').prop('checked', false);
            $(e.currentTarget).prop('checked', val);
        }
    });

    // Load player's data
    players_table
    .on( 'select', (e, dt, type, indexes) => {
        let rowData = players_table.rows(indexes).data().toArray();
        if (type=='row') {
            LoadPlayerData(rowData[0].id);
        }
    })
    .on( 'deselect', (e, dt, type, indexes) => {
        LoadPlayerData();
    });

    // Seach in players table
    let playersSearchVal = "";
    $('input.players-search').on('keyup', (e) => {
        let cVal = $(e.currentTarget).val();
        if (cVal != playersSearchVal) {
            playersSearchVal = cVal;
            try {
                players_table.search(playersSearchVal).draw();
            } catch(e) {}
        }
    });

    // Toggle left menu
    $('#toggle_btn').on('click', (e) => {
        setTimeout(() => {
            try {
                players_table.columns.adjust().draw();
            } catch(e) {}
        }, 500);
    });
    setTimeout(() => {
        $('#toggle_btn').click();
        try {
            setTimeout(() => {
                players_table.columns.adjust().draw();
            }, 500);
        } catch (e) {}
    }, 500);

});

