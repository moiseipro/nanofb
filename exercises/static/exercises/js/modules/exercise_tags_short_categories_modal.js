function LoadExercisesTagsShortCategoriesAll() {
    let dataSend = {'get_exs_all_tags_short_categories': 1};
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
            RenderExercisesTagsShortCategoriesAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderExercisesTagsShortCategoriesAll(data) {
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
            $('#exerciseTagsShortCategoriesModal').find(`.content-container[data-id="${type}"]`).find('.category-container').html(tagsHtml);
        }
    }
    _rendering(data, "nfb");
    _rendering(data, "self");
}

function EditExsTagShortCategoriesOne(id, name, type, short_name, toDelete=0) {
    let dataSend = {'edit_exs_tag_short_categories_one': 1, id, name, type, short_name, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsShortCategoriesAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово! (Возможно ТАКОЙ ТЭГ УЖЕ ЗАНЯТ!) (Пустых тэгов не должно быть!)", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово! (Возможно ТАКОЙ ТЭГ УЖЕ ЗАНЯТ!) (Пустых тэгов не должно быть!)", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExsTagShortCategoriesOrder(dir) {
    let wasChanged = false;
    let cID = $('#exerciseTagsShortCategoriesModal').find('.row.category-container:visible').find('.tag-row.selected').attr('data-id');
    let elems = $('#exerciseTagsShortCategoriesModal').find('.row.category-container:visible').find('.tag-row');
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
        SaveExsTagShortCategoriesOrder();
    }
}

function SaveExsTagShortCategoriesOrder() {
    let cType = $('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsShortCategoriesModal').find('.row.category-container:visible').find('.tag-row').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_short_categories_one': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
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
                LoadExercisesTagsShortCategoriesAll();
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
    $('#exerciseTagsShortCategoriesModal').on('show.bs.modal', (e) => {
        LoadExercisesTagsShortCategoriesAll();
    });
    $('#exerciseTagsShortCategoriesModal').on('click', '.row.tag-row', (e) => {
        $('#exerciseTagsShortCategoriesModal').find('.row.tag-row').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', true);
    });
    $('#exerciseTagsShortCategoriesModal').on('click', '.col-add', (e) => {
        let cType = $('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).attr('data-id');
        EditExsTagShortCategoriesOne(-1, "", cType, "", -1);
    });
    $('#exerciseTagsShortCategoriesModal').on('click', '.col-edit', (e) => {
        if ($('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).find('.tag-row.selected').length == 0) {
            swal("Внимание", "Для редактирования выберите любую строчку с тэгом.", "warning");
            return;
        }
    });
    $('#exerciseTagsShortCategoriesModal').on('click', '.col-delete', (e) => {
        if ($('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).find('.tag-row.selected').length == 0) {
            swal("Внимание", "Для удаления выберите любую строчку с тэгом.", "warning");
            return;
        }
        let cType = $('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).attr('data-id');
        let cRow = $('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).find('.tag-row.selected');
        let cId = $(cRow).attr('data-id');
        EditExsTagShortCategoriesOne(cId, "", cType, "", 1);
    });
    $('#exerciseTagsShortCategoriesModal').on('click', '.col-up', (e) => {
        ToggleExsTagShortCategoriesOrder("up");
    });
    $('#exerciseTagsShortCategoriesModal').on('click', '.col-down', (e) => {
        ToggleExsTagShortCategoriesOrder("down");
    });
    $('#exerciseTagsShortCategoriesModal').on('click', '.col-save', (e) => {
        if ($('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).find('.tag-row.selected').length == 0) {
            swal("Внимание", "Для сохранения выберите любую строчку с тэгом.", "warning");
            return;
        }
        let cType = $('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).attr('data-id');
        let cRow = $('#exerciseTagsShortCategoriesModal').find(`.content-container:visible`).find('.tag-row.selected');
        let cId = $(cRow).attr('data-id');
        let cName = $(cRow).find('input[name="name"]').val();
        let cShortName = $(cRow).find('input[name="short_name"]').val();
        EditExsTagShortCategoriesOne(cId, cName, cType, cShortName, -1);
    });
});
