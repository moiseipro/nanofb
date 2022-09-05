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

    $('.cnt-center-block').find('.form-control').prop('disabled', true);
    $('.cnt-center-block').find('.form-control').removeClass('req-empty');

    $('.cnt-center-block').find('[name="surname"]').val(data.surname);
    $('.cnt-center-block').find('[name="name"]').val(data.name);
    $('.cnt-center-block').find('[name="patronymic"]').val(data.patronymic);
    $('.cnt-center-block').find('.img-photo').attr('src', data.photo ? data.photo : '#');

    $('.cnt-center-block').find('.edit-field').each((ind, elem) => {
        let key = $(elem).attr('name');
        $(elem).val(data[key] ? data[key] : "");
    });

}


function LoadCardSections() {
    let data = {'get_card_sections': 1};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/players/players_api",
        success: function (res) {
            if (res.success) {
                console.log(res.data)
                window.cardSettings = res.data;
            } else {
                window.cardSettings = {};
            }
        },
        error: function (res) {
            window.cardSettings = {};
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            if (!window.cardSettings.mode || window.cardSettings.mode != "nfb") {
                $('#cardSectionsEdit').find('.btns-control').html();
            }
            RenderCardSections(window.cardSettings);
        }
    });
}

function RenderCardSections(data) {
    let headers = [], rows = {};
    for (let i = 0; i < data.sections.length; i++) {
        let section = data.sections[i];
        if (section.parent == null) {
            headers.push(section);
        } else {
            if (rows[section.parent] && Array.isArray(rows[section.parent])) {
                rows[section.parent].push(section);
            } else {
                rows[section.parent] = [section];
            }
        }
    }
    let sections1 = "", sections2 = "";
    for (let i = 0; i < headers.length; i++) {
        let header = headers[i];
        if (header.visible) {
            sections1 += `
                <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-primary btn-sm btn-block" data-id="${header.id}">
                        ${header.title}
                    </button>
                </div>
            `;
        }
        sections2 += `
            <tr class="section-elem" data-id="${header.id}" data-parent="${header.parent}" data-root="1">
                <td class=""></td>
                <td class="">
                    <input name="title" class="form-control form-control-sm" type="text" value="${header.title}" placeholder="" autocomplete="off" disabled="">
                </td>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input" name="visible" ${header.visible == true ? 'checked' : ''}>
                </td>
            </tr>
        `;
        if (rows[header.id] && Array.isArray(rows[header.id])) {
            for (let j = 0; j < rows[header.id].length; j++) {
                let row = rows[header.id][j];
                if (header.visible && row.visible) {
                    sections1 += `
                        <div class="d-flex justify-content-center">
                            <button type="button" class="btn btn-outline-primary btn-sm btn-block" data-id="${row.id}" data-text-id="${row.text_id}">
                                ${row.title}
                            </button>
                        </div>
                    `;
                }
                sections2 += `
                    <tr class="section-elem" data-id="${row.id}" data-parent="${row.parent}" data-root="0">
                        <td class=""></td>
                        <td class="">
                            <input name="title" class="form-control form-control-sm w-75 ml-5" type="text" value="${row.title}" placeholder="" autocomplete="off" disabled="">
                        </td>
                        <td class="text-center">
                            <input type="checkbox" class="form-check-input" name="visible" ${row.visible == true ? 'checked' : ''}>
                        </td>
                    </tr>
                `;
            }
        }
    }
    $('.card-sections').html(sections1);
    $('#cardSectionsEdit').find('.sections-body').html(sections2);
}

function ToggleFolderOrder(dir) {
    let activeElem = $('#cardSectionsEdit').find(`.section-elem.selected`);
    if (activeElem.length > 0) {
        let cID = $(activeElem).attr('data-id');
        let cParentID = $(activeElem).attr('data-parent');
        let isRoot = $(activeElem).attr('data-root');
        if (isRoot == '1') {
            let elems = $('#cardSectionsEdit').find(`.section-elem[data-root="1"]`);
            let tFirst = null; let tLast = null; let newInd = 0;
            let children = $('#cardSectionsEdit').find(`.section-elem[data-root="0"]`);
            $('#cardSectionsEdit').find(`.section-elem[data-root="0"]`).remove();
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
                console.log(elem)
                let parentId = $(elem).attr('data-parent');
                $('#cardSectionsEdit').find(`.section-elem[data-id="${parentId}"]`).after(elem);
            }
        } else {
            let elems = $('#cardSectionsEdit').find(`.section-elem[data-parent="${cParentID}"]`);
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
    RenderPlayerOne();
    // Add player
    $('#addPlayer').on('click', (e) => {
        $('.b-add-off').addClass('d-none');
        $('.b-add-on').removeClass('d-none');
        $('table#players').find('.player-row').removeClass('selected');
        RenderPlayerOne();
        $('.cnt-center-block').find('.edit-field').prop('disabled', false);
        window.editingMode = true;
        $('#showImgPhoto').find('#fileImgPhoto').val('');
    });

    // Edit player
    $('#editPlayer').on('click', (e) => {
        if ($('table#players').find('.player-row.selected').length == 0) {return;}
        $('.b-edit-off').addClass('d-none');
        $('.b-edit-on').removeClass('d-none');
        $('.cnt-center-block').find('.edit-field').prop('disabled', false);
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
        if ($(e.currentTarget).attr('required')) {
            $(e.currentTarget).toggleClass('req-empty', !(cVal && cVal != ""));
        }
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


    // Section Settings
    LoadCardSections();
    $('#cardSettings').on('click', (e) => {
        $('#cardSectionsEdit').modal('show');
    });

    // Edit sections
    $('#cardSectionsEdit').on('click', '.section-elem', (e) => {
        let wasActive = $(e.currentTarget).hasClass('selected');
        $('#cardSectionsEdit').find('.section-elem').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasActive);
    });
    $('#cardSectionsEdit').on('click', '.section-up', (e) => {
        ToggleFolderOrder("up");
    });
    $('#cardSectionsEdit').on('click', '.section-down', (e) => {
        ToggleFolderOrder("down");
    });
    $('#cardSectionsEdit').on('click', '.section-edit', (e) => {
        $('#cardSectionsEdit').find('input.form-control ').prop('disabled', false);
    });
    $('#cardSectionsEdit').on('click', '[name="save"]', (e) => {
        let dataToSend = [];
        $('#cardSectionsEdit').find('.section-elem').each((ind, elem) => {
            let id = $(elem).attr('data-id');
            let order = ind+1;
            let title = $(elem).find('[name="title"]').val();
            let visible = $(elem).find('[name="visible"]').is(':checked');
            dataToSend.push({
                id, order, title, visible
            });
        });
        let data = {'edit_card_sections': 1, 'data': JSON.stringify(dataToSend)};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "players_api",
            success: function (res) {
                if (res.success) {
                    LoadCardSections();
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



    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);

});

