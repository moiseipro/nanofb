
function LoadExercisesFeaturesAll() {
    let dataSend = {'get_exs_all_features': 1};
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
            RenderExercisesFeaturesAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderExercisesFeaturesAll(data) {
    function _rendering(data, type="") {
        let featuresHtml = "";
        if (data) {
            for (let i = 0; i < data.length; i++) {
                let elem = data[i];
                featuresHtml += `
                    <li class="list-group-item py-0">
                        <div class="row" data-feature="${elem.id}">
                            <div class="col-11 py-2 text-center">
                                <input name="" class="form-control form-control-sm feature-name" type="text" value="${elem.name}" placeholder="Введите название" autocomplete="off"> 
                            </div>
                            <div class="col-1 py-2 text-right">
                                <span class="badge badge-danger feature-delete" title="Удалить элемент">
                                    <i class="fa fa-trash-o" aria-hidden="true"></i>
                                </span>
                            </div>
                        </div>
                    </li>
                `;
            }
        }
        $('#exerciseFeaturesModal').find(`ul.features-list`).html(featuresHtml);
        let el = $('#exerciseFeaturesModal').find(`ul.features-list`)[0];
        let sortable = Sortable.create(el, {
            onEnd: (evt) => {
                SaveFeaturesOrder();
            }
        });
    }
    _rendering(data, "");
}

function EditExsFeatureOne(id, name, toDelete=0) {
    let dataSend = {'edit_exs_feature_one': 1, id, name, 'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                LoadExercisesFeaturesAll();
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить элемент!", "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось создать / изменить / удалить элемент!", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function SaveFeaturesOrder() {
    let arrForIds = []; let arrForOrder = [];
    $('#exerciseFeaturesModal').find('.list-group-item').each((ind, elem) => {
        let tId = $(elem).find('.row[data-feature]').attr('data-feature');
        arrForIds.push(tId);
        arrForOrder.push(ind+1);
    });
    let dataToSend = {'change_order_exs_features': 1, 'ids_arr': arrForIds, 'order_arr': arrForOrder};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/exercises/exercises_api",
        success: function (res) {
            if (res.success) {
                swal("Успешно", "Порядок успешно обновлён.", "success");
            } else {
                swal("Ошибка", `При изменении порядка произошла ошибка (${res.err}).`, "error");
            }
        },
        error: function (res) {
            swal("Ошибка", "Не удалось изменить порядок.", "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}



$(function() {
    $('#exerciseFeaturesModal').on('show.bs.modal', (e) => {
        LoadExercisesFeaturesAll();
    });

    $('#exerciseFeaturesModal').on('click', '.do-add', (e) => {
        EditExsFeatureOne(null, "", 0);
    });
    $('#exerciseFeaturesModal').on('click', '.do-save', (e) => {
        $('#exerciseFeaturesModal').modal('hide');
    });
    $('#exerciseFeaturesModal').on('change', '.feature-name', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-feature');
        let val = $(e.currentTarget).val();
        EditExsFeatureOne(cId, val, 0);
    });
    $('#exerciseFeaturesModal').on('click', '.feature-delete', (e) => {
        let cId = $(e.currentTarget).parent().parent().attr('data-feature');
        EditExsFeatureOne(cId, "", 1);
    });
});
