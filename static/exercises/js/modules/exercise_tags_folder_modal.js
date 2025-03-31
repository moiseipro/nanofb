function LoadExercisesTagsFolderAll() {
    let dataSend = {'get_exs_all_tags_folder': 1};
    let dataResponse = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                dataResponse = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            RenderExercisesTagsFolderAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderExercisesTagsFolderAll(data) {
    function _rendering(data, type="nfb") {
        let tagsHtml = "";
        if (data && Array.isArray(data[type])) {
            for (let i = 0; i < data[type].length; i++) {
                let elem = data[type][i];
                tagsHtml += `
                    <div class="col-12 tag-row row border border-secondary" data-id="${elem.id}">
                        <div class="col-1">
                            <input name="order_num" class="form-control form-control-sm" type="text" value="#${i+1}" placeholder="" autocomplete="off" readonly="">
                        </div>
                        <div class="col-3">
                            <input name="short_name" class="form-control form-control-sm" type="text" value="${elem.short_name}" placeholder="Короткий код" autocomplete="off">
                        </div>
                        <div class="col-8">
                            <input name="name" class="form-control form-control-sm" type="text" value="${elem.name}" placeholder="Название тэга" autocomplete="off">
                        </div>
                    </div>
                `;
            }
            $('#exerciseTagsFolderModal').find(`.content-container[data-id="${type}"]`).find('.category-container').html(tagsHtml);
        }
    }
    _rendering(data, "nfb");
    _rendering(data, "self");
}

function EditExsTagFolderOne(id, name, type, short_name, toDelete=0) {
    let dataSend = {'edit_exs_tag_folder_one': 1, id, name, type, short_name, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsFolderAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово! (Возможно такой тэг уже занят.)", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово! (Возможно такой тэг уже занят.)", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExsTagFolderOrder(dir) {
    let wasChanged = false;
    let cID = $('#exerciseTagsFolderModal').find('.row.category-container:visible').find('.tag-row.selected').attr('data-id');
    let elems = $('#exerciseTagsFolderModal').find('.row.category-container:visible').find('.tag-row');
    let tFirst = null; let tLast = null; let newInd = 0;
    for (let i = 0; i < elems.length; i++) {
        if ($(elems[i]).attr('data-id') == cID) {
            wasChanged = true;
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
    if (wasChanged) {
        SaveExsTagFolderOrder();
    }
}

function SaveExsTagFolderOrder() {
    let cType = $('#exerciseTagsFolderModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsFolderModal').find('.row.category-container:visible').find('.tag-row').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_folder_one': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок ключевых слов успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка ключевых слов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок ключевых слов.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}



$(function() {
    $('#exerciseTagsFolderModal').on('show.bs.modal', (e) => {
        LoadExercisesTagsFolderAll();
    });
    $('#exerciseTagsFolderModal').on('click', '.row.tag-row', (e) => {
        $('#exerciseTagsFolderModal').find('.row.tag-row').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', true);
    });
    $('#exerciseTagsFolderModal').on('click', '.col-add', (e) => {
        let cType = $('#exerciseTagsFolderModal').find(`.content-container:visible`).attr('data-id');
        EditExsTagFolderOne(-1, "", cType, "", -1);
    });
    $('#exerciseTagsFolderModal').on('click', '.col-edit', (e) => {
        if ($('#exerciseTagsFolderModal').find(`.content-container:visible`).find('.tag-row.selected').length == 0) {
            swal("Внимание", "Для редактирования выберите любую строчку с тэгом.", "warning");
            return;
        }
    });
    $('#exerciseTagsFolderModal').on('click', '.col-delete', (e) => {
        if ($('#exerciseTagsFolderModal').find(`.content-container:visible`).find('.tag-row.selected').length == 0) {
            swal("Внимание", "Для удаления выберите любую строчку с тэгом.", "warning");
            return;
        }
        let cType = $('#exerciseTagsFolderModal').find(`.content-container:visible`).attr('data-id');
        let cRow = $('#exerciseTagsFolderModal').find(`.content-container:visible`).find('.tag-row.selected');
        let cId = $(cRow).attr('data-id');
        EditExsTagFolderOne(cId, "", cType, "", 1);
    });
    $('#exerciseTagsFolderModal').on('click', '.col-up', (e) => {
        ToggleExsTagFolderOrder("up");
    });
    $('#exerciseTagsFolderModal').on('click', '.col-down', (e) => {
        ToggleExsTagFolderOrder("down");
    });
    $('#exerciseTagsFolderModal').on('click', '.col-save', (e) => {
        if ($('#exerciseTagsFolderModal').find(`.content-container:visible`).find('.tag-row.selected').length == 0) {
            swal("Внимание", "Для сохранения выберите любую строчку с тэгом.", "warning");
            return;
        }
        let cType = $('#exerciseTagsFolderModal').find(`.content-container:visible`).attr('data-id');
        let cRow = $('#exerciseTagsFolderModal').find(`.content-container:visible`).find('.tag-row.selected');
        let cId = $(cRow).attr('data-id');
        let cName = $(cRow).find('input[name="name"]').val();
        let cShortName = $(cRow).find('input[name="short_name"]').val();
        EditExsTagFolderOne(cId, cName, cType, cShortName, -1);
    });
});
