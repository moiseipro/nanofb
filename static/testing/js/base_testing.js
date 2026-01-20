let testsTableOptions = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollX: true,
    scrollY: "75vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: true,
    drawCallback: function( settings ) {
    },
    initComplete: (settings, json) => {},
    "columnDefs": [
        {"width": "20%", "targets": 0},
        {"width": "6%", "targets": 1},
        {"width": "3%", "targets": [2, 3]},
        {"className": "dt-vertical-center", "targets": "_all"}
    ]
};
let testEditTableOptions = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollX: true,
    scrollY: "60vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    ordering: false,
    select: true,
    autoWidth: false,
    drawCallback: function( settings ) {
    },
    initComplete: (settings, json) => {},
    "columnDefs": [
        {"width": "20%", "targets": 0},
        {"width": "6%", "targets": 1},
        {"width": "3%", "targets": [2, 3]},
        {"className": "dt-vertical-center", "targets": "_all"}
    ]
};

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

function parseStringToFloatElseNull(str) {
    const floatValue = Number(str);
    return isNaN(floatValue) ? null : floatValue;
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
                $('#tests_wrapper').html(`
                    <table class="table table-sm table-bordered dataTable" style="width:100%;">
                        <thead>
                            <tr class="dates">
                                <th class="text-center" colspan="5"></th>
                            </tr>
                            <tr class="params">
                                <th class="text-center" title="ФИО игрока">ФИО</th>
                                <th class="text-center" title="День рождения игрока">ДР</th>
                                <th class="text-center" title="Возраст игрока">В.</th>
                                <th class="text-center" title="Рост игрока">Рост</th>
                                <th class="text-center" title="Вес игрока">Вес</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                        <tfoot>
                            <tr class="">
                                <th class="text-center" title="Среднее" colspan="5">Среднее</th>
                            </tr>
                        </tfoot>
                    </table>    
                `);
                let activeMarks = localStorage.getItem("marks_view_status") || '1';
                for (let i = 0; i < uniqueDates.length; i++) {
                    let cDate = uniqueDates[i];
                    let paramsLength = activeMarks === '1' ? test.parameters.length * 2 : test.parameters.length;
                    for (let j = 0; j < test.parameters.length; j++) {
                        let param = test.parameters[j];
                        let paramToTitle = param.length > 4 ? param.substring(0, 4) : param;
                        let borderLeftClass = j == 0 ? "border-left" : "";
                        let borderRightClass = j == test.parameters.length - 1 ? "border-right" : "";
                        $('#tests_wrapper > table').find('thead > tr.params').append(`<th class="text-center dynamic ${borderLeftClass}" title="${param}">${paramToTitle}</th>`);
                        if (activeMarks === '1') {
                            $('#tests_wrapper > table').find('thead > tr.params').append(`<th class="text-center dynamic ${borderRightClass}" title="Балл">Б.</th>`);
                        }
                    }
                    $('#tests_wrapper > table').find('thead > tr.dates').append(`<th class="text-center dynamic header-date" colspan="${paramsLength}">${cDate}</th>`);
                }
                let footerCreated = false;
                for (let i = 0; i < players.length; i++) {
                    let player = players[i];
                    let paramsHtml = "";
                    let paramsFootHtml = "";
                    for (let j = 0; j < uniqueDates.length; j++) {
                        let cDate = uniqueDates[j];
                        for (let k = 0; k < test.parameters.length; k++) {
                            let param = test.parameters[k];
                            let borderLeftClass = k == 0 ? "border-left" : "";
                            let borderRightClass = k == test.parameters.length - 1 ? "border-right" : "";
                            paramsHtml += `
                                <td class="text-center ${borderLeftClass}" data-date="${cDate}" data-key="${param}" data-type="value"></td>
                            `;
                            paramsFootHtml += `
                                <th class="text-center ${borderLeftClass}" data-date="${cDate}" data-key="${param}" data-type="value"></th>
                            `;
                            if (activeMarks === '1') {
                                paramsHtml += `
                                    <td class="text-center ${borderRightClass}" data-date="${cDate}" data-key="${param}" data-type="mark"></td>
                                `;
                                paramsFootHtml += `
                                    <th class="text-center ${borderRightClass}" data-date="${cDate}" data-key="${param}" data-type="mark"></th>
                                `;
                            }
                        }
                    }
                    let tRow = `
                        <tr class="" data-player="${player.id}">
                            <td class="">${player.name}</td>
                            <td class="">${player.birthsday}</td>
                            <td class="">${player.age}</td>
                            <td class="">${player.growth}</td>
                            <td class="">${player.weight}</td>
                            ${paramsHtml}
                        </tr>
                    `;
                    $('#tests_wrapper > table').find('tbody').append(tRow);
                    if (!footerCreated) {
                        $('#tests_wrapper > table').find('tfoot > tr').append(paramsFootHtml);
                        footerCreated = true;
                    }
                }
                let sums = {};
                for (let i = 0; i < data.length; i++) {
                    let result = data[i];
                    let foundRow = $('#tests_wrapper > table').find(`tr[data-player="${result.player_id}"]`);
                    if (foundRow.length > 0) {
                        for (let key in result.values) {
                            let tKey = `${key}__${result.date}`;
                            let tValue = parseStringToFloatElseNull(result.values[key]['value']);
                            if (!(tKey in sums)) {
                                sums[tKey] = {
                                    'key': key,
                                    'date': result.date,
                                    'sum': 0.0,
                                    'count': 0,
                                };
                            }
                            if (tValue) {
                                sums[tKey]['sum'] += tValue;
                                sums[tKey]['count'] += 1;
                            }
                            $(foundRow).find(`td[data-key="${key}"][data-type="value"][data-date="${result.date}"]`).text(result.values[key]['value']);
                            $(foundRow).find(`td[data-key="${key}"][data-type="mark"][data-date="${result.date}"]`).text(result.values[key]['mark']);
                        }
                    }
                }
                for (key in sums) {
                    let elem = sums[key];
                    if (elem['count'] > 0) {
                        let valAvg = elem['sum'] / elem['count'];
                        $('#tests_wrapper > table').find('tfoot').find(`th[data-key="${elem['key']}"][data-type="value"][data-date="${elem['date']}"]`).text(valAvg.toFixed(2));
                    }
                }
                RenderTable($('#tests_wrapper > table'), testsTableOptions);
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
                    $(foundRow).find(`input[data-key="${key}"][data-type="value"]`).val(row.values[key]['value']);
                    $(foundRow).find(`input[data-key="${key}"][data-type="mark"]`).val(row.values[key]['mark']);
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
            let activeMarks = localStorage.getItem("marks_view_status") || '1';
            $('#editTestResultModal').find('.table-responsive').html(`
                <table class="table table-sm table-bordered dataTable" style="width:100%;">
                    <thead>
                        <tr>
                            <th class="text-center" title="ФИО игрока">ФИО</th>
                            <th class="text-center" title="День рождения игрока">ДР</th>
                            <th class="text-center" title="Возраст игрока">В.</th>
                            <th class="text-center" title="Рост игрока">Рост</th>
                            <th class="text-center" title="Вес игрока">Вес</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            `);
            for (let i = 0; i < players.length; i++) {
                let player = players[i];
                let paramsHtml = "";
                for (let j = 0; j < test.parameters.length; j++) {
                    let param = test.parameters[j];
                    if (!setHeadersData) {
                        $('#editTestResultModal').find('table > thead > tr').append(`
                            <th class="text-center dynamic">${param}</th>
                        `);
                        if (activeMarks === '1') {
                            $('#editTestResultModal').find('table > thead > tr').append(`
                                <th class="text-center dynamic">Балл</th>
                            `);
                        }
                    }
                    paramsHtml += `
                        <td class="text-center">
                            <input name="" data-key="${param}" data-type="value" class="form-control form-control-sm text-center" type="text" value="" placeholder="" autocomplete="off">
                        </td>
                    `;
                    if (activeMarks === '1') {
                        paramsHtml += `
                            <td class="text-center">
                                <input name="" data-key="${param}" data-type="mark" class="form-control form-control-sm text-center" type="text" value="" placeholder="" autocomplete="off">
                            </td>
                        `;
                    }
                }
                setHeadersData = true;
                let tRow = `
                    <tr class="" data-player="${player.id}">
                        <td class="">${player.name}</td>
                        <td class="">${player.birthsday}</td>
                        <td class="">${player.age}</td>
                        <td class="">${player.growth}</td>
                        <td class="">${player.weight}</td>
                        ${paramsHtml}
                    </tr>
                `;
                $('#editTestResultModal').find('table tbody').append(tRow);
            }
            RenderTable($('#editTestResultModal').find('table'), testEditTableOptions);
            let selectedDateElem = $('#tests_wrapper').find('th.header-date.active');
            if ($(selectedDateElem).length > 0) {
                setTimeout(() => {
                    $('#dateTestResult').val($(selectedDateElem).text()).trigger('change');
                }, 500);
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

function RenderTable(elem, options) {
    if ($.fn.dataTable.isDataTable(elem)) {
        $(elem).DataTable().destroy().clear();
    }
    setTimeout(() => {
        $(elem).DataTable(options);
        setTimeout(() => {
            $(elem).DataTable().columns.adjust().draw();
        }, 250);
    }, 0);
}

function ToggleMarksView(toSwitch=false) {
    let activeMarks = localStorage.getItem("marks_view_status") || '1';
    if (toSwitch) {
        activeMarks = activeMarks === '1' ? '0' : '1';
        LoadTestsResultsAll();
    }
    $('#toggleMarksView').find('input').prop('checked', activeMarks === '1');
    localStorage.setItem("marks_view_status", activeMarks);
}



$(function() {
    LoadTestsAll();

    $('#editSelectedTest').on('click', (e) => {
        let cVal = $('#testSelected').val();
        $('#editTestModal').modal('show');
        if (cVal == undefined || cVal == null || cVal == "") {
            RenderTestOne();
        } else {
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
    $('#tests_wrapper').on('click', 'th.header-date', (e) => {
        let isActive = $(e.currentTarget).hasClass('active');
        $('#tests_wrapper').find('th.header-date').removeClass('active');
        $(e.currentTarget).toggleClass('active', !isActive);
    });

    $('#createNewResult').on('click', (e) => {
        let cVal = $('#testSelected').val();
        if (cVal == undefined || cVal == null || cVal == "") {
            swal("Внимание", "Для настройки результатов выберите сначала тест!", "warning");
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
                let type = $(elem2).attr('data-type');
                let val = $(elem2).val();
                if (!(key in parameters[playerId])) {
                    parameters[playerId][key] = {};
                }
                parameters[playerId][key][type] = val;
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

    ToggleMarksView();
    $('#toggleMarksView').on('click', (e) => {
        ToggleMarksView(true);
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
