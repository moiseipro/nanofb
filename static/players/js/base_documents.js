let players_table;

function GetDocsTypesAjax() {
    let dataToSend = {'get_documents_types': 1};
    return $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "players_api",
    });
}

function GetPlayersDocsAjax() {
    let dataToSend = {'get_players_documents': 1};
    return $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "players_api",
    });
}

function GetPlayerDocumentAjax() {
    let dataToSend = {
        'get_player_document': 1, 
        'player': window.custom__doc['player'],
        'doc': window.custom__doc['id'],
        'doc_type': window.custom__doc['doc_type_id']
    };
    return $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "players_api",
    });
}

async function GeneratePlayersTable(scroll_y = '') {
    try {
        players_table.destroy();
    } catch(e) {}
    let table_options = {
        language: {
            url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
        },
        dom: "<'row d-none'<'col-sm-12 col-md '><'col-sm-12 col-md-4'B><'col-sm-12 col-md-4'>>" +
             "<'row'<'col-sm-12'tr>>" +
             "<'row'<'col-sm-12 col-md-5'l><'col-sm-12 col-md-7'p>>",
        scrollX: true,
        scrollY: `${scroll_y}`,
        scrollCollapse: true,
        serverSide: false,
        processing: false,
        paging: false,
        drawCallback: function( settings ) {
        },
        "columnDefs": [
            { "searchable": false, "orderable": false, "targets": 0 },
            {"className": "dt-vertical-center text-center", "targets": "_all"}
        ]
    };
    $('#players').find('th:not(.default)').remove();
    $('#players').find('tbody').html('');
    $('.page-loader-wrapper').fadeIn();
    let docsTypes = [];
    try {
        let res = await GetDocsTypesAjax();
        docsTypes = res['data'];
    } catch (e) {}
    docsTypes.forEach(elem => {
        $('#players').find('thead > tr').append(`
            <th class="doc-type" data-id="${elem.id}">${elem.name}</th>
        `);
    });
    if ($('#toggleTableColsVisible').find('option.doc-type').length == 0) {
        docsTypes.forEach(elem => {
            $('#toggleTableColsVisible').append(`
                <option class="doc-type" value="${elem.id}">Нет документа. ${elem.name}</option>
            `);
        });
    }
    let rows = [];
    try {
        let res = await GetPlayersDocsAjax();
        rows = res['data'];
    } catch (e) {}
    for (let i = 0; i < rows.length; i++) {
        let elem = rows[i];
        let docsHtml = "";
        docsTypes.forEach(docType => {
            let docId = null;
            try {
                docId = elem.docs[docType.id];
            } catch(e) {}
            docsHtml += `
                <td class="doc-cell" doc-type-id="${docType.id}" doc-id="${docId}" title="${docId == null ? 'НЕТ' : 'ДА'}">
                    ${docId == null ? `
                        <i class="fa fa-square cell-no" aria-hidden="true" style="color: red;"></i>
                    ` : `
                        <i class="fa fa-square cell-yes" aria-hidden="true" style="color: green;"></i>
                    `}
                </td>
            `;
        });
        $('#players').find('tbody').append(`
            <tr class="player-elem" data-id="${elem.id}">
                <td class="">${i+1}</td>
                <td class="">
                    ${elem.surname}
                </td>
                <td class="">
                    ${elem.name}
                </td>
                <td class="">
                    ${elem.patronymic}
                </td>
                ${docsHtml}
            </tr>
        `);
    }
    $('.page-loader-wrapper').fadeOut();
    players_table = $('#players').DataTable(table_options);
    players_table.draw();
}

async function RenderDocsTypesTable() {
    let docsTypes = [];
    try {
        let res = await GetDocsTypesAjax();
        docsTypes = res['data'];
    } catch (e) {}
    let columns = "";
    for (let i = 0; i < docsTypes.length; i++) {
        let elem = docsTypes[i];
        columns += `
            <tr class="type-elem" data-id="${elem.id}">
                <td class="">${i+1}</td>
                <td class="">
                    <input name="title" class="form-control form-control-sm" type="text" value="${elem.name}" placeholder="" autocomplete="off" disabled="">
                </td>
            </tr>
        `;
    }
    $('#documentsTypesModal').find('.docs-types-body').html(columns);
    GeneratePlayersTable("calc(100vh - 200px)");
}


function ToggleDocTypeOrder(dir) {
    let activeElem = $('#documentsTypesModal').find(`.type-elem.selected`);
    if (activeElem.length > 0) {
        let cID = $(activeElem).attr('data-id');

        let elems = $('#documentsTypesModal').find(`.type-elem`);
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

async function RenderDocEditModal() {
    $('#documentEditModal').find('.doc-type').text(window.custom__doc['doc_type']);
    $('#documentEditModal').find('.form-control-sm').prop('disabled', true);
    $('#documentEditModal').find('.b-link').addClass('d-none');
    $('#documentEditModal').find('.b-link').attr('href', '#');
    $('#documentEditModal').find('input').val('');
    $('#documentEditModal').find('button[name="save"]').addClass('d-none');
    $('#documentEditModal').find('button[name="delete"]').addClass('d-none');
    $('#documentEditModal').find('button[name="delete"]').removeClass('available');
    $('#documentEditModal').find('button[name="edit"]').removeClass('d-none');
    $('.page-loader-wrapper').fadeIn();
    let data = null;
    try {
        let res = await GetPlayerDocumentAjax();
        data = res['data'];
    } catch(e) {}
    if (data) {
        window.custom__doc['id'] = data['id'];
        $('#documentEditModal').find('button[name="delete"]').addClass('available');
        $('#documentEditModal').find('input[name="doc_text"]').val(data.doc_text);
        if (data.doc) {
            $('#documentEditModal').find('#goToDocFile').attr('href', `/media${data.doc}`);
            $('#documentEditModal').find('#goToDocFile').removeClass('d-none');
            $('#documentEditModal').find('#downloadDocFile').attr('href', `/media${data.doc}`);
            $('#documentEditModal').find('#downloadDocFile').removeClass('d-none');
        }
    }
    $('.page-loader-wrapper').fadeOut();
}

function DownloadDocFile(url) {
    let a = document.createElement("a");
    a.href = url;
    let fileName = url.split("/").pop();
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
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

    $('#toggleTableColsVisible').on('change', (e) => {
        let val = $(e.currentTarget).val();
        let rows = $('#players').find('tbody').find('tr');
        $(rows).addClass('d-none');
        if (val == "") {
            $(rows).removeClass('d-none');
        } else if (val == "none") {
            $(rows).each((ind, elem) => {
                if ($(elem).find('.cell-no').length > 0) {
                    $(elem).removeClass('d-none');
                }
            });
        } else {
            $(rows).each((ind, elem) => {
                if ($(elem).find(`.doc-cell[doc-type-id="${val}"]`).find('.cell-no').length > 0) {
                    $(elem).removeClass('d-none');
                }
            });
        }
    });

    $('#toggleDocsTypes').on('click', (e) => {
        RenderDocsTypesTable();
        $('#documentsTypesModal').modal('show');
    });
    $('#documentsTypesModal').on('click', '.type-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#documentsTypesModal').find('.type-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#documentsTypesModal').on('click', '.col-up', (e) => {
        ToggleDocTypeOrder("up");
    });
    $('#documentsTypesModal').on('click', '.col-down', (e) => {
        ToggleDocTypeOrder("down");
    });
    $('#documentsTypesModal').on('click', '.col-edit', (e) => {
        $('#documentsTypesModal').find('input.form-control').prop('disabled', !$('#documentsTypesModal').find('input.form-control').prop('disabled'));
    });
    $('#documentsTypesModal').on('click', '.col-add', (e) => {
        let data = {'add_docs_types': 1};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    RenderDocsTypesTable();
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
    $('#documentsTypesModal').on('click', '.col-delete', (e) => {
        let activeElem = $('#documentsTypesModal').find(`.type-elem.selected`);
        if (activeElem.length > 0) {
            let cId = $(activeElem).first().attr('data-id');
            let data = {'delete_docs_types': 1, 'id': cId};
            $('.page-loader-wrapper').fadeIn();
            $.ajax({
                headers:{"X-CSRFToken": csrftoken},
                data: data,
                type: 'POST', // GET или POST
                dataType: 'json',
                url: "players_api",
                success: function (res) {
                    if (res.success) {
                        RenderDocsTypesTable();
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
    $('#documentsTypesModal').on('click', '[name="save"]', (e) => {
        let dataToSend = [];
        $('#documentsTypesModal').find('.type-elem').each((ind, elem) => {
            let id = $(elem).attr('data-id');
            let order = ind+1;
            let title = $(elem).find('[name="title"]').val();
            dataToSend.push({
                id, order, title
            });
        });
        let data = {'edit_docs_types': 1, 'data': JSON.stringify(dataToSend)};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    RenderDocsTypesTable();
                }
            },
            error: function (res) {
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });


    $('#players').on('click', '.doc-cell', (e) => {
        let docTypeId = $(e.currentTarget).attr('doc-type-id');
        let docType = $('#players').find('thead').find(`th.doc-type[data-id="${docTypeId}"]`).text();
        let docId = $(e.currentTarget).attr('doc-id');
        let playerId = $(e.currentTarget).parent().attr('data-id');
        window.custom__doc = {'id': docId, 'doc_type_id': docTypeId, 'doc_type': docType, 'player': playerId};
        RenderDocEditModal();
        $('#documentEditModal').modal('show');
    });

    $('#documentEditModal').on('click', '[name="edit"]', (e) => {
        $('#documentEditModal').find('.form-control-sm').prop('disabled', false);
        $('#documentEditModal').find('button[name="save"]').removeClass('d-none');
        if ($('#documentEditModal').find('button[name="delete"]').hasClass('available')) {
            $('#documentEditModal').find('button[name="delete"]').removeClass('d-none');
        }
        $('#documentEditModal').find('button[name="edit"]').addClass('d-none');
    });
    $('#documentEditModal').on('click', '[name="save"]', (e) => {
        let data = {
            'edit_player_document': 1,
            'player': window.custom__doc['player'],
            'doc': window.custom__doc['id'],
            'doc_type': window.custom__doc['doc_type_id'],
            'to_delete': 0,
            'doc_text': $('#documentEditModal').find('input[name="doc_text"]').val()
        };
        let formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        formData.append('doc_file', $('#documentEditModal').find('input[name="doc"]')[0].files[0]);
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: formData,
            type: 'POST', // GET или POST
            url: "players_api",
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Документ успешно сохранён.", "success");
                    RenderDocEditModal();
                } else {
                    swal("Ошибка", `Не удалось сохранить документ!`, "error"); 
                }
            },
            error: function (res) {
                swal("Ошибка", `Не удалось сохранить документ!`, "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
                GeneratePlayersTable("calc(100vh - 200px)");
            }
        });
    });
    $('#documentEditModal').on('click', '[name="delete"]', (e) => {
        let data = {
            'edit_player_document': 1,
            'player': window.custom__doc['player'],
            'doc': window.custom__doc['id'],
            'doc_type': window.custom__doc['doc_type_id'],
            'to_delete': 1
        };
        let formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key]);
        }
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: formData,
            type: 'POST', // GET или POST
            url: "players_api",
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.success) {
                    swal("Готово", "Документ успешно удалён.", "success");
                    RenderDocEditModal();
                } else {
                    swal("Ошибка", `Не удалось удалить документ!`, "error");
                }
            },
            error: function (res) {
                swal("Ошибка", `Не удалось удалить документ!`, "error");
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
                GeneratePlayersTable("calc(100vh - 200px)");
            }
        });
    });

    $('#documentEditModal').on('click', '#downloadDocFile', (e) => {
        e.preventDefault();
        let cUrl = $(e.currentTarget).attr('href');
        DownloadDocFile(cUrl);
    });


    // Seach in players table
    let playersSearchVal = "";
    $('input.players-search').on('keyup', (e) => {
        let cVal = $(e.currentTarget).val();
        if (cVal != playersSearchVal) {
            playersSearchVal = cVal;
            try {
                players_table.search(playersSearchVal).draw();
            } catch(e) {
                console.log(e)
            }
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
        setTimeout(() => {
            try {
                players_table.columns.adjust().draw();
            } catch(e) {}
        }, 500);
    }, 500);
});
