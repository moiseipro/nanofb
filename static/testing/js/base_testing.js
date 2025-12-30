function LoadTestsAll() {
    let dataSend = {'get_all_tests': 1, 'only_titles': 1};
    let dataResponse = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/testing/testing_api",
        success: function (res) {
            if (res.success) {
                dataResponse = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            RenderTestsAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderTestsAll(data) {
    let testsHtml = `<option value="" selected="selected">Выбрать существующий тест</option>`;
    if (data && Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            let elem = data[i];
            testsHtml += `
                <option value="${elem.id}">${elem.name}</option>
            `;
        }
        $('#testSelected').html(testsHtml);
    }
}

function LoadTestOne(id = "") {
    return new Promise((resolve, reject) => {
        let dataSend = {'get_test_one': 1, id};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers: {"X-CSRFToken": csrftoken},
            data: dataSend,
            type: 'GET',
            dataType: 'json',
            url: "/testing/testing_api",
            success: function(res) {
                if (res.success) {
                    resolve(res.data);
                } else {
                    reject(new Error("API returned success=false"));
                }
            },
            error: function(xhr, status, error) {
                reject(new Error(`AJAX error: ${error}`));
            },
            complete: function() {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
}

function RenderTestOne(id = "") {
    LoadTestOne(id)
    .then(data => {
        console.log(data)
        $('#editTestModal').attr('data-id', data.id);
        $('#editTestModal').find('input[name="title"]').val(data.name);
        $('#editTestModal').find('.btn-delete').toggleClass('d-none', data.id == "");
        let rowsHtml = "";
        if (data && Array.isArray(data.parameters)) {
            for (let i = 0; i < data.parameters.length; i++) {
                let elem = data.parameters[i];
                rowsHtml += `
                    <div class="col-12 param-row row border border-secondary">
                        <div class="col-10">
                            <input name="name_param" class="form-control form-control-sm" type="text" value="${elem}" placeholder="Название параметра" autocomplete="off">
                        </div>
                        <div class="col-2">
                            <span class="badge badge-danger col-delete" title="Удалить элемент">
                                <i class="fa fa-trash-o" aria-hidden="true"></i>
                            </span>
                            <span class="badge badge-info col-up" title="Move up">
                                <i class="fa fa-arrow-up" aria-hidden="true"></i>
                            </span>
                            <span class="badge badge-info col-down" title="Move down">
                                <i class="fa fa-arrow-down" aria-hidden="true"></i>
                            </span>
                        </div>
                        
                    </div>
                `;
            }
            $('#editTestModal').find('.test-container').html(rowsHtml);
        }
    })
    .catch(error => {console.error("Error:", error);});
}

function ToggleOrderTestParams(dir, index) {
    let elems = $('#editTestModal').find('.row.test-container:visible').find('.param-row');
    let tFirst = null; let tLast = null; let newInd = 0;
    for (let i = 0; i < elems.length; i++) {
        if (i == index) {
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

function EditTestOne(id, title, parameters, toDelete=0) {
    let dataSend = {'edit_test_one': 1, id, title,
        'parameters': JSON.stringify(parameters),
        'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/testing/testing_api",
        success: function (res) {
            if (res.success) {
                LoadTestsAll();
                swal("Успешно", "Создан / изменён / удалён тест.", "success")
                .then((value) => {
                    $('#editTestModal').modal('hide');
                });
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить тест!", "error");
            }
        },
        error: function (res) {
            let status = "";
            try {
                status = res.responseJSON.status;
            } catch (error) {}
            let errorText = "";
            if (status == "access_denied") {
                errorText = "Нет доступа";
            } else if (status == "empty_data") {
                errorText = "Название и параметры не должны быть пустыми";
            }
            swal("Ошибка", `Не удалось создать / изменить / удалить тест! (${errorText})`, "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function LoadPlayers() {
    return new Promise((resolve, reject) => {
        let dataSend = {'get_players': 1};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers: {"X-CSRFToken": csrftoken},
            data: dataSend,
            type: 'GET',
            dataType: 'json',
            url: "/testing/testing_api",
            success: function(res) {
                if (res.success) {
                    resolve(res.data);
                } else {
                    reject(new Error("API returned success=false"));
                }
            },
            error: function(xhr, status, error) {
                reject(new Error(`AJAX error: ${error}`));
            },
            complete: function() {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
}

function LoadTestsResultsAll() {
    let cID = $('#testSelected').val();
    let dataSend = {'get_all_tests_results': 1, 'id': cID};
    let dataResponse = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/testing/testing_api",
        success: function (res) {
            if (res.success) {
                dataResponse = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            RenderTestsResultsAll(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderTestsResultsAll(data) {
    if (data && Array.isArray(data) && data.length > 0) {
        $('.tests-table-container').find('.table-responsive-no-data').addClass('d-none');
        $('.tests-table-container').find('.table-responsive').removeClass('d-none');
        const uniqueDates = [...new Set(data.map(item => item.date))].sort();
        LoadPlayers()
        .then(players => {
            let testId = $('#testSelected').val();
            LoadTestOne(testId)
            .then(test => {
                $('table#tests').find('thead th.dynamic').remove();
                $('table#tests').find('tbody tr').remove();
                for (let i = 0; i < uniqueDates.length; i++) {
                    let cDate = uniqueDates[i];
                    let paramsLength = test.parameters.length;
                    for (let j = 0; j < test.parameters.length; j++) {
                        let param = test.parameters[j];
                        $('table#tests').find('thead > tr.params').append(`<th class="text-center dynamic">${param}</th>`);
                    }
                    $('table#tests').find('thead > tr.dates').append(`<th class="text-center dynamic" colspan="${paramsLength}">${cDate}</th>`);
                }
                for (let i = 0; i < players.length; i++) {
                    let player = players[i];
                    let paramsHtml = "";
                    for (let j = 0; j < uniqueDates.length; j++) {
                        let cDate = uniqueDates[j];
                        for (let k = 0; k < test.parameters.length; k++) {
                            let param = test.parameters[k];
                            paramsHtml += `
                                <td class="text-center" data-date="${cDate}" data-key="${param}"></td>
                            `;
                        }
                    }
                    let tRow = `
                        <tr class="" data-player="${player.id}">
                            <td class="">${player.name}</td>
                            <td class="">${player.birthsday}</td>
                            ${paramsHtml}
                        </tr>
                    `;
                    $('table#tests').find('tbody').append(tRow);
                }
                for (let i = 0; i < data.length; i++) {
                    let result = data[i];
                    let foundRow = $('table#tests').find(`tr[data-player="${result.player_id}"]`);
                    if (foundRow.length > 0) {
                        for (let key in result.values) {
                            $(foundRow).find(`td[data-key="${key}"][data-date="${result.date}"]`).text(result.values[key]);
                        }
                    }
                }
            })
            .catch(error => {console.error("Error:", error);});
        })
        .catch(error => {console.error("Error:", error);});

    } else {
        $('.tests-table-container').find('.table-responsive-no-data').removeClass('d-none');
        $('.tests-table-container').find('.table-responsive').addClass('d-none');
    }
}

function LoadTestResultOne(testId, date) {
    let dataSend = {'get_test_result_one': 1, 'id': testId, date};
    let dataResponse = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/testing/testing_api",
        success: function (res) {
            if (res.success) {
                dataResponse = res.data;
            }
        },
        error: function (res) {},
        complete: function (res) {
            RenderTestResultOne(dataResponse);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderTestResultOne(data) {
    $('#editTestResultModal').find('input[data-key]').val('');
    if (data && Array.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            let row = data[i];
            let foundRow = $('#editTestResultModal').find(`tr[data-player="${row.player_id}"]`);
            if (foundRow.length > 0) {
                for (let key in row.values) {
                    $(foundRow).find(`input[data-key="${key}"]`).val(row.values[key]);
                }
            }
        }
    }

}

function RenderTestResultModal() {
    LoadPlayers()
    .then(players => {
        let testId = $('#testSelected').val();
        LoadTestOne(testId)
        .then(test => {
            let setHeadersData = false;
            $('#editTestResultModal').find('table thead th.dynamic').remove();
            $('#editTestResultModal').find('table tbody tr').remove();
            for (let i = 0; i < players.length; i++) {
                let player = players[i];
                let paramsHtml = "";
                for (let j = 0; j < test.parameters.length; j++) {
                    let param = test.parameters[j];
                    if (!setHeadersData) {
                         $('#editTestResultModal').find('table > thead > tr').append(`
                            <th class="text-center dynamic">${param}</th>
                        `);
                    }
                    paramsHtml += `
                        <td class="text-center">
                            <input name="" data-key="${param}" class="form-control form-control-sm text-center" type="text" value="" placeholder="" autocomplete="off">
                        </td>
                    `;
                }
                setHeadersData = true;
                let tRow = `
                    <tr class="" data-player="${player.id}">
                        <td class="">${player.name}</td>
                        <td class="">${player.birthsday}</td>
                        ${paramsHtml}
                    </tr>
                `;
                $('#editTestResultModal').find('table tbody').append(tRow);
            }
        })
        .catch(error => {console.error("Error:", error);});
    })
    .catch(error => {console.error("Error:", error);});
}

function EditTestResultOne(testId, date, parameters, toDelete=0) {
    let dataSend = {'edit_test_result_one': 1, 'id': testId, date,
        'parameters': JSON.stringify(parameters),
        'delete': toDelete};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "/testing/testing_api",
        success: function (res) {
            if (res.success) {
                LoadTestsResultsAll();
                swal("Успешно", "Создан / изменён / удалён результат теста.", "success")
                .then((value) => {
                    $('#editTestResultModal').modal('hide');
                });
            } else {
                swal("Ошибка", "Не удалось создать / изменить / удалить результат теста!", "error");
            }
        },
        error: function (res) {
            let status = "";
            try {
                status = res.responseJSON.status;
            } catch (error) {}
            let errorText = "";
            if (status == "access_denied") {
                errorText = "Нет доступа";
            } else if (status == "bad_test_id") {
                errorText = "Некорректный ИД теста";
            } else if (status == "bad_params") {
                errorText = "Неверные данные параметров";
            }
            swal("Ошибка", `Не удалось создать / изменить / удалить результат теста! (${errorText})`, "error");
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
        }
    });
}



$(function() {
    LoadTestsAll();
    $('#createNewTest').on('click', (e) => {
        $('#editTestModal').modal('show');
        RenderTestOne();
    });
    $('#editSelectedTest').on('click', (e) => {
        let cVal = $('#testSelected').val();
        if (cVal == undefined || cVal == null || cVal == "") {
            swal("Внимание", "Для редактирования выберите сначала тест!", "warning");
            return;
        } else {
            $('#editTestModal').modal('show');
            RenderTestOne(cVal);
        }
    });

    $('#editTestModal').on('click', '.col-add', (e) => {
        $('#editTestModal').find('.test-container').append(`
            <div class="col-12 param-row row border border-secondary">
                <div class="col-10">
                    <input name="name_param" class="form-control form-control-sm" type="text" value="" placeholder="Название параметра" autocomplete="off">
                </div>
                <div class="col-2">
                    <span class="badge badge-danger col-delete" title="Удалить элемент">
                        <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </span>
                    <span class="badge badge-info col-up" title="Move up">
                        <i class="fa fa-arrow-up" aria-hidden="true"></i>
                    </span>
                    <span class="badge badge-info col-down" title="Move down">
                        <i class="fa fa-arrow-down" aria-hidden="true"></i>
                    </span>
                </div>
            </div>
        `);
    });
    $('#editTestModal').on('click', '.col-delete', (e) => {
        let row = $(e.currentTarget).parent().parent();
        $(row).remove();
    });
    $('#editTestModal').on('click', '.col-up', (e) => {
        let index = $(e.currentTarget).parent().parent().index();
        ToggleOrderTestParams("up", index);
    });
    $('#editTestModal').on('click', '.col-down', (e) => {
        let index = $(e.currentTarget).parent().parent().index();
        ToggleOrderTestParams("down", index);
    });
    $('#editTestModal').on('click', '.btn-save', (e) => {
        let cID = $('#editTestModal').attr('data-id');
        let cTitle = $('#editTestModal').find('input[name="title"]').val();
        let cParameters = [];
        $('#editTestModal').find('input[name="name_param"]').each((i, elem) => {
            let cVal = $(elem).val();
            if (cVal.trim() != "") {
                cParameters.push($(elem).val());
            }
        });
        EditTestOne(cID, cTitle, cParameters, 0);
    });
    $('#editTestModal').on('click', '.btn-delete', (e) => {
        let cID = $('#editTestModal').attr('data-id');
        EditTestOne(cID, "", [], 1);
    });

    LoadTestsResultsAll();
    $('#testSelected').on('change', (e) => {
        LoadTestsResultsAll();
    });

    $('#createNewResult').on('click', (e) => {
        let cVal = $('#testSelected').val();
        if (cVal == undefined || cVal == null || cVal == "") {
            swal("Внимание", "Для добавления результата выберите сначала тест!", "warning");
            return;
        } else {
            RenderTestResultModal();
            $('#dateTestResult').val('');
            $('#editTestResultModal').modal('show');
        }
    });
    $('#dateTestResult').on('change', (e) => {
        let testId = $('#testSelected').val();
        let date = $(e.currentTarget).val();
        LoadTestResultOne(testId, date);
    });
    $('#editTestResultModal').on('click', '.btn-save', (e) => {
        let testId = $('#testSelected').val();
        let date = $('#dateTestResult').val();
        let parameters = {};
        $('#editTestResultModal').find('table tbody tr').each((i, elem) => {
            let playerId = $(elem).attr('data-player');
            parameters[playerId] = {}
            $(elem).find('input[data-key]').each((j, elem2) => {
                let key = $(elem2).attr('data-key');
                let val = $(elem2).val();
                parameters[playerId][key] = val;
            });
        });
        EditTestResultOne(testId, date, parameters, 0);
    });
    $('#editTestResultModal').on('click', '.btn-delete', (e) => {
        let testId = $('#testSelected').val();
        let date = $('#dateTestResult').val();
        let parameters = {};
        $('#editTestResultModal').find('table tbody tr').each((i, elem) => {
            let playerId = $(elem).attr('data-player');
            parameters[playerId] = {}
        });
        EditTestResultOne(testId, date, parameters, 1);
    });

    $('#printTableData').on('click', (e) => {
        let teamName = $('#select-team').find(`option[value="${$('#select-team').val()}"]`).text();
        let tableContent = "";
        $('.tests-table-container').find('table:visible').each((ind, elem) => {
            let clonedElem = $(elem).clone();
            $(clonedElem).addClass('w-100');
            tableContent += $(clonedElem).prop('outerHTML');
        });
        let pageContent = $('html').clone();
        $(pageContent).find('head').append(`
            <style type="text/css" media="print">
                @page { size: landscape; }
            </style>
        `);
        $(pageContent).find('body').html(`
            <div class="row">
                <div class="col-12">
                    <div class="row mx-0">
                        <div class="col-12 pt-title text-center my-3">
                            <h5>Тестирование. ${teamName}</h5>
                        </div>
                        <div class="col-12 pt-table">
                            ${tableContent}
                        </div>
                    </div>
                </div>
            </div>
            <script>
                setTimeout(() => {
                    window.document.close();
                    window.focus();
                    window.print();
                    window.close();
                }, 100);
            </script>
        `);
        let printedWindow = window.open('', 'PRINT');
        printedWindow.document.write($(pageContent).prop('outerHTML'));
    });

});
