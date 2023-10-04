// Drag and drop functions
function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
} 
function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    if (ev.target.tagName.toLowerCase() === 'div' && ev.target.classList.contains('category-block')) {
        ev.target.appendChild(document.getElementById(data));
        // ChangeExsTagCategory(ev.target, document.getElementById(data));
    }
}

function LoadMedicineDiseasesAll(cType) {
    let dataSend = {'get_med_all_diseases': 1, 'type': cType};
    let dataResponse = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/medicine/medicine_api",
        success: function (res) {
            if (res.success) {
                dataResponse = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            RenderMedicineDiseasesAll(dataResponse, cType);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderMedicineDiseasesAll(data, type) {
    function _rendering(data, type="") {
        let categoriesHtml = `
            <div class="row category-container">
                <div class="col-12 d-flex mb-1">
                    <input name="title" class="form-control form-control-sm category-field" type="text" 
                        value="Элементы" placeholder="" autocomplete="off" disabled="" 
                        style="width: 100% !important;">
                </div>
                <div class="col-12">
                    <div class="category-block" ondrop="drop(event)" ondragover="allowDrop(event)" style="min-height: 150px;">
                    </div>
                </div>
            </div>
        `;
        $(`.modal[type="${type}"]`).find(`.content-container`).find('.category-container:not(.category-no)').remove();
        $(`.modal[type="${type}"]`).find(`.content-container`).prepend(categoriesHtml);
        $(`.modal[type="${type}"]`).find(`.content-container`).find('.category-container').find('.category-block > span.drag').remove();
        if (data && Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                let elem = data[i];
                let medHtml = `
                    <span class="drag mx-1" draggable="true" ondragstart="drag(event)" id="e_med_${type}_${i}" data-id="${elem.id}">
                        <a class="btn btn-sm btn-light">
                            <span class="tag-dot" style="--color: blue;"></span>
                            <span class="mr-1">${elem.name}</span>
                            <span class="badge badge-danger med-delete" title="Удалить элемент">
                                <i class="fa fa-trash-o" aria-hidden="true"></i>
                            </span>
                        </a>
                    </span>
                `;
                let fContainer = $(`.modal[type="${type}"]`).find(`.content-container`).find(`.category-container`);
                $(fContainer).find('.category-block').append(medHtml);
            }
        }
    }
    _rendering(data, type);
}

function SaveMedDiseasesOrder(type) {
    let cModal = $(`.modal[type="${type}"]`);
    let arrForIds = []; let arrForOrder = [];
    $(cModal).find('span.drag:visible').each((ind, elem) => {
        let tId = $(elem).attr('data-id');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_med_diseases': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder, 'type': type};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/medicine/medicine_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок элементов успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка элементов произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок элементов.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function EditMedDiseaseOne(id, name, type, toDelete=0) {
    let dataSend = {'edit_med_disease_one': 1, id, name, type, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/medicine/medicine_api",
        success: function (res) {
            if (res.success) {
                LoadMedicineDiseasesAll(type);
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить элемент!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменить / удалить элемент!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            $(`.modal[type="${type}"]`).find('span.drag').removeClass('selected');
            $(`.modal[type="${type}"]`).find('input[name="edit_med"]').val('');
            $(`.modal[type="${type}"]`).find('span.med-edit').text("Добавить");
        }
    });
}



$(function() {
    $('.modal').on('show.bs.modal', (e) => {
        let cType = $(e.currentTarget).attr('type');
        LoadMedicineDiseasesAll(cType);
    });

    $('.modal').on('click', 'button.save', (e) => {
        let cType = $(e.delegateTarget).attr('type');
        SaveMedDiseasesOrder(cType);
    });

    $('.modal').on('click', '.med-edit', (e) => {
        let cType = $(e.delegateTarget).attr('type');
        let cName = $(e.delegateTarget).find('input[name="edit_med"]').val();
        let medId = $(e.delegateTarget).find('span.drag.selected').first().attr('data-id');
        if (cName != "") {
            EditMedDiseaseOne(medId, cName, cType);
        }
    });
    $('.modal').on('click', '.med-delete', (e) => {
        let cType = $(e.delegateTarget).attr('type');
        let cId = $(e.currentTarget).parent().parent().attr('data-id');
        EditMedDiseaseOne(cId, "", cType, 1);
    });
    $('.modal').on('click', 'span.drag', (e) => {
        let cType = $(e.delegateTarget).attr('type');
        let wasSelected = $(e.currentTarget).hasClass('selected');
        let cVal = $(e.currentTarget).find('a > span:nth-child(2)').text();
        $(e.delegateTarget).find('span.drag').removeClass('selected');
        $(e.currentTarget).toggleClass('selected', !wasSelected);
        if (!wasSelected) {
            $(e.delegateTarget).find('input[name="edit_med"]').val(cVal);
            $(e.delegateTarget).find('span.med-edit').text("Изменить");
        } else {
            $(e.delegateTarget).find('input[name="edit_med"]').val('');
            $(e.delegateTarget).find('span.med-edit').text("Добавить");
        }
    });
});
