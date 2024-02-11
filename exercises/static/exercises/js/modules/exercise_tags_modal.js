// Drag and drop functions for exercises' tags
// function allowDrop(ev) {
//     ev.preventDefault();
// }
// function drag(ev) {
//     ev.dataTransfer.setData("text", ev.target.id);
// } 
// function drop(ev) {
//     ev.preventDefault();
//     let data = ev.dataTransfer.getData("text");
//     if (ev.target.tagName.toLowerCase() === 'div' && ev.target.classList.contains('category-block')) {
//         ev.target.appendChild(document.getElementById(data));
//         ChangeExsTagCategory(ev.target, document.getElementById(data));
//     }
// }

function LoadExercisesTagsAll() {
    let dataSend = {'get_exs_all_tags': 1};
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
            RenderExercisesTagsAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderExercisesTagsAll(data) {
    function _rendering(data, type="nfb") {
        let categoriesHtml = "";
        let categoriesInCardHtml = "";
        let colorsPack = [
            {'color': "#000000", 'name': "Чёрный"},
            {'color': "#24ae39", 'name': "Зелёный"},
            {'color': "#e0e01f", 'name': "Жёлтый"},
            {'color': "#e31c1c", 'name': "Красный"},
            {'color': "#2417bb", 'name': "Синий"},
            {'color': "#921ab9", 'name': "Фиолетовый"},
            {'color': "#ff8040", 'name': "Оранжевый"},
            {'color': "#88dbf4", 'name': "Голубой"},
            {'color': "#b2b2b2", 'name': "Серый"},
            {'color': "#fff0", 'name': "Прозрачный"},
        ];
        if (data && data['categories'] && Array.isArray(data['categories'][type])) {
            for (let i = 0; i < data['categories'][type].length; i++) {
                let elem = data['categories'][type][i];
                let colorsOptionsHtml = "";
                colorsPack.forEach(colorElem => {
                    colorsOptionsHtml += `
                        <option value="${colorElem.color}" ${elem.color == colorElem.color ? 'selected' : ''} style="
                            color: ${colorElem.color} !important;
                        ">${colorElem.name}</option>
                    `;
                });
                /*
                    <input name="color" class="form-control form-control-sm category-field" type="color" disabled=""
                        value="${elem.color ? elem.color : ''}" style="width: 15% !important;" 
                        title="Изменить цвет категории">
                */
                categoriesHtml += `
                    <div class="row category-container mx-0" data-id="${elem.id}">
                        <div class="col-12 d-flex mb-1">
                            <input name="title" class="form-control form-control-sm category-field" type="text" 
                                value="${elem.name ? elem.name : ''}" placeholder="Название категории" autocomplete="off" disabled="" 
                                style="width: 85% !important;">
                            <select name="color" class="form-control form-control-sm category-field" type="color" disabled="" 
                                autocomplete="off" title="Изменить цвет категории" style="width: 15% !important;">
                                ${colorsOptionsHtml}
                            </select>
                        </div>
                        <div class="col-12">
                            <div class="category-block">
                            </div>
                        </div>
                    </div>
                `;

                categoriesInCardHtml += `
                    <div class="col">
                        <div class="card category-card" data-id="${elem.id}">
                            <div class="card-body">
                                <h5 class="card-title text-center" style="color: ${elem.color} !important;">
                                    ${elem.name ? elem.name : ''}
                                </h5>
                                <p class="card-text">
                                    <ul class="list-group">
                                    </ul>
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find('.category-container:not(.category-no)').remove();
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).prepend(categoriesHtml);
        $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find('.category-container').find('.category-block > span.drag').remove();
        
        $('#card_tags').find(`.tags-container[data-id="${type}"] > div.row`).html(categoriesInCardHtml);
        if (data && Array.isArray(data[type])) {
            for (let i = 0; i < data[type].length; i++) {
                let elem = data[type][i];
                let tagHtml = `
                    <span class="drag mx-1" draggable="true" ondragstart="drag(event)" id="ex_tag_${type}_${i}" data-id="${elem.id}" data-category-id="${elem.category}">
                        <a class="btn btn-sm btn-light">
                            <span class="${type == "nfb" ? `tag-dot` : `tag-square`}" style="--color: ${elem.color && elem.color != "" ? elem.color : ''};"></span>
                            <span class="mr-1">${elem.name}</span>
                            <span class="badge badge-danger tag-delete" title="Удалить элемент">
                                <i class="fa fa-trash-o" aria-hidden="true"></i>
                            </span>
                        </a>
                    </span>
                `;
                let tagInCardHtml = `
                    <li class="list-group-item tag-elem py-1 mb-1" data-id="${elem.id}" data-name="${elem.name}">
                        ${elem.name}
                    </li>
                `;
                let fContainer = $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find(`.category-container[data-id="${elem.category}"]`);
                if (fContainer.length == 0) {
                    fContainer = $('#exerciseTagsModal').find(`.content-container[data-id="${type}"]`).find(`.category-container.category-no`);
                }
                $(fContainer).find('.category-block').append(tagHtml);
                new Sortable($(fContainer).find('.category-block')[0], {});

                let fContainerInCard = $('#card_tags').find(`.tags-container[data-id="${type}"]`).find(`.category-card[data-id="${elem.category}"]`);
                if (fContainerInCard.length > 0) {
                    $(fContainerInCard).find('ul.list-group').append(tagInCardHtml);
                }
            }
        }
    }
    _rendering(data, "nfb");
    _rendering(data, "self");
    $('#exerciseTagsModal').find(`.category-container[data-id="${window.selectedCategoryId}"]`).addClass('selected');
}


function EditExsTagCategory(id, name, color, type, toDelete=0) {
    window.selectedCategoryId = id;
    let dataSend = {'edit_exs_tag_category': 1, id, name, color, type, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить категорию ключевых слов!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменит / удалить категорию ключевых слов!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ToggleExsTagCategoryOrder(dir) {
    let wasChanged = false;
    let cID = $('#exerciseTagsModal').find('.row.category-container.selected:visible:not(.category-no)').attr('data-id');
    let elems = $('#exerciseTagsModal').find('.row.category-container:visible:not(.category-no)');
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
}

function SaveExsTagCategoryOrder() {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsModal').find('.row.category-container:visible:not(.category-no)').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_category': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок категорий ключевых слов успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка категорий ключевых слов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок категорий ключевых слов.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function SaveExsTagsOrder() {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseTagsModal').find('span.drag:visible').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_tag_one': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': cType};
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

function EditExsTagOne(id, name, type, category, toDelete=0) {
    let dataSend = {'edit_exs_tag_one': 1, id, name, type, category, 'delete': toDelete};
    window.selectedCategoryId = category;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                $('#exerciseTagsModal').find('input[name="edit_tag"]').val('');
                $('#exerciseTagsModal').find('span.tag-edit').text("Добавить");
                $('#exerciseTagsModal').find('span.tag-edit-cancel').addClass('d-none');
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменить / удалить ключевое слово!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function ChangeExsTagCategory(categoryElem, tagElem) {
    let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
    let category = $(categoryElem).parent().parent().attr('data-id');
    let id = $(tagElem).attr('data-id');
    let oldCategoryId = $(tagElem).attr('data-category-id');
    if ((oldCategoryId == category) || (oldCategoryId == "" && category == "-1")) {return;}
    window.selectedCategoryId = null;
    let dataSend = {'change_exs_tag_category': 1, id, category, 'type': cType};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesTagsAll();
            } else {
                swal("Ошибка", "Не удалось переместить ключевое слово!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось переместить ключевое слово!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}



$(function() {
    $('#exerciseTagsModal').on('show.bs.modal', (e) => {
        LoadExercisesTagsAll();
    });
    $('#exerciseTagsModal').on('click', 'a.nav-link', (e) => {
        let cId = $(e.currentTarget).attr('data-id');
        $('#exerciseTagsModal').find('a.nav-link').removeClass('active');
        $('#exerciseTagsModal').find('.content-container').addClass('d-none');
        $(e.currentTarget).addClass('active');
        $('#exerciseTagsModal').find(`.content-container[data-id="${cId}"]`).removeClass('d-none');
        $('#exerciseTagsModal').find('.row.category-container').removeClass('selected');
        $('#exerciseTagsModal').find('.tag-add-control').addClass('d-none');
    });
    $('#exerciseTagsModal').on('click', '.row.category-container', (e) => {
        if ($(e.target).is('span') || $(e.target).is('a') || $(e.target).is('i')) {
            return;
        }
        let isSelected = $(e.currentTarget).hasClass('selected');
        $('#exerciseTagsModal').find('.row.category-container').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !isSelected);
        $('#exerciseTagsModal').find('.tag-add-control').toggleClass('d-none', isSelected);
    });
    $('#exerciseTagsModal').on('click', '.col-add', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        EditExsTagCategory(null, "", null, cType);
    });
    $('#exerciseTagsModal').on('click', '.col-edit', (e) => {
        $('#exerciseTagsModal').find('.category-field').prop('disabled', false);
    });
    $('#exerciseTagsModal').on('change', '.category-field', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        let cName = $(e.currentTarget).parent().find('.category-field[name="title"]').val();
        let cColor = $(e.currentTarget).parent().find('.category-field[name="color"]').val();
        EditExsTagCategory(cId, cName, cColor, cType);
    });
    $('#exerciseTagsModal').on('click', '.col-delete', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $('#exerciseTagsModal').find('.row.category-container.selected:visible').attr('data-id');
        EditExsTagCategory(cId, "", null, cType, 1);
    });
    $('#exerciseTagsModal').on('click', '.col-up', (e) => {
        ToggleExsTagCategoryOrder("up");
    });
    $('#exerciseTagsModal').on('click', '.col-down', (e) => {
        ToggleExsTagCategoryOrder("down");
    });
    $('#exerciseTagsModal').on('click', 'button.save', (e) => {
        window.selectedCategoryId = null;
        SaveExsTagCategoryOrder();
        SaveExsTagsOrder();
    });
    $('#exerciseTagsModal').on('click', '.tag-edit', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cCategory = $('#exerciseTagsModal').find('.row.category-container.selected:visible').attr('data-id');
        let cName = $('#exerciseTagsModal').find('input[name="edit_tag"]').val();
        let tagId = $('#exerciseTagsModal').find('span.drag.selected').first().attr('data-id');
        if (cCategory && cName != "") {
            EditExsTagOne(tagId, cName, cType, cCategory);
        }
        $('#exerciseTagsModal').find('input[name="add_new_tag"]').val('');
    });
    $('#exerciseTagsModal').on('click', '.tag-edit-cancel', (e) => {
        $('#exerciseTagsModal').find('input[name="edit_tag"]').val('');
        $('#exerciseTagsModal').find('span.tag-edit').text("Добавить");
        $('#exerciseTagsModal').find('span.tag-edit-cancel').addClass('d-none');
        $('#exerciseTagsModal').find('span.drag').attr('data-selected', '0');
    });
    $('#exerciseTagsModal').on('click', '.tag-delete', (e) => {
        let cType = $('#exerciseTagsModal').find(`.content-container:visible`).attr('data-id');
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        EditExsTagOne(cId, "", cType, null, 1);
    });
    $('#exerciseTagsModal').on('click', 'span.drag', (e) => {
        let wasSelected = $(e.currentTarget).attr('data-selected') == '1';
        let cVal = $(e.currentTarget).find('a > span:nth-child(2)').text();
        $('#exerciseTagsModal').find('span.drag').attr('data-selected', '0');
        $(e.currentTarget).attr('data-selected', !wasSelected ? '1' : '0');
        if (!wasSelected) {
            $('#exerciseTagsModal').find('input[name="edit_tag"]').val(cVal);
            $('#exerciseTagsModal').find('span.tag-edit').text("Изменить");
            $('#exerciseTagsModal').find('span.tag-edit-cancel').removeClass('d-none');
        } else {
            $('#exerciseTagsModal').find('input[name="edit_tag"]').val('');
            $('#exerciseTagsModal').find('span.tag-edit').text("Добавить");
            $('#exerciseTagsModal').find('span.tag-edit-cancel').addClass('d-none');
        }
    });
});