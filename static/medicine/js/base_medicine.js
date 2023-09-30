let medicine_table;

function GenerateMedicineTable(scroll_y = '') {
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
        drawCallback: (settings) => {
            let medTypes = $('#medTypes').selectpicker('val');
            medicine_table.rows().every((rowIdx, tableLoop, rowLoop) => {
                let row = medicine_table.row(rowIdx);
                let rowNode = row.node(); let rowData = row.data();
                $(rowNode).removeClass('d-none');
                if (Array.isArray(medTypes) && medTypes.length > 0 && !medTypes.includes(rowData['med_status_code'])) {
                    $(rowNode).addClass('d-none');
                }
            });
            //console.log(settings)
            // $('#video-table-counter').text(settings._iRecordsDisplay)
        },
        columnDefs: [
            { "searchable": false, "orderable": false, "targets": 0 },
            {"className": "dt-vertical-center", "targets": "_all"}
        ],
        ajax: {
            url:'medicine_api',
            data: {'get_medicine_json_table': 1},
        },
        columns: [
            // {'data': 'id', 'name': 'id', render: function (data, type, row, meta) {
            //     return meta.row + meta.settings._iDisplayStart + 1;
            // }},
            {'data': 'surname', 'name': 'surname'},
            {'data': 'name', 'name': 'name'},
            // {'data': 'patronymic', 'name': 'patronymic'},
            {'data': 'birthsday', 'name': 'card__birthsday', className: "dt-vertical-center border-black-left"},
            {'data': 'game_num', 'name': 'card__game_num'},
            {'data': 'injury', 'name': 'injury'},
            {'data': 'disease', 'name': 'disease'},
            {'data': 'med_date', 'name': 'med_date'},
            {'data': 'med_status', 'name': 'med_status'},
            {'data': 'recovery_period', 'name': 'recovery_period'},
            {'data': 'med_access', 'name': 'med_access'},
            {'data': 'doctor', 'name': 'doctor'},
        ],
        createdRow: (row, data, dataIndex) => {
            $(row).attr('data-player', data.id);
            $(row).addClass('medicine-row');
            $(row).attr('data-status-code', data.med_status_code);
        }
    };
    if ($.fn.DataTable.isDataTable('#medicine')) {
        $('#medicine').find('tbody').html('');
        $('#medicine').dataTable().fnClearTable();
        $('#medicine').dataTable().fnDestroy();
    }
    medicine_table = $('#medicine').DataTable(tableOptions);
    setTimeout(() => {
        medicine_table.columns.adjust().draw();
    }, 500);
}

function LoadPlayerMedicine(playerId) {
    let data = {'get_player_medicine': 1, 'id': playerId};
    let resData = null;
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: data,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/medicine/medicine_api",
        success: function (res) {
            if (res.success) {
                resData = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            $('.page-loader-wrapper').fadeOut();
            RenderPlayerMedicine(resData);
        }
    });
}

function RenderPlayerMedicine(data) {
    function _renderRowColumn(row, elem) {
        for (let vKey in elem) {
            if (vKey == "date" || vKey == "healthy_date") {
                try {
                    if (elem[vKey]) {
                        let date = new Date(elem[vKey]);
                        elem[vKey] = date.toISOString().slice(0, 10);
                    } else {
                        elem[vKey] = "";
                    }
                } catch(e) {
                    elem[vKey] = "";
                }
            }
            if (vKey == "healthy_status") {
                $(row).find(`.med-edit[name="healthy_date"]`).toggleClass('d-none', elem[vKey] != "1");
                $(row).find(`[name="${vKey}"]`).val(elem[vKey] == true ? '1' : '');
            } else if (vKey == "doc") {
                if (elem[vKey]) {
                    $(row).find(`#goToDocFile`).attr('href', `/media${elem[vKey]}`);
                    $(row).find(`#goToDocFile`).removeClass('d-none');
                    $(row).find(`#downloadDocFile`).attr('href', `/media${elem[vKey]}`);
                    $(row).find(`#downloadDocFile`).removeClass('d-none');
                } else {
                    $(row).find(`#goToDocFile`).addClass('d-none');
                    $(row).find(`#goToDocFile`).attr('href', '#');
                    $(row).find(`#downloadDocFile`).addClass('d-none');
                    $(row).find(`#downloadDocFile`).attr('href', '#');
                }
            } else {
                $(row).find(`[name="${vKey}"]`).val(elem[vKey] ? elem[vKey] : "");
            }

            if (vKey == "diagnosis_type") {
                let short = $(row).find(`.med-edit[name="diagnosis_type"] > option[value="${elem[vKey]}"]`).attr('data-short');
                $(row).find(`.med-edit[name="disease_specific"]`).toggleClass('d-none', short != "injury");
                $(row).find(`.med-edit[name="disease_nonspecific"]`).toggleClass('d-none', short != "disease");
            }
            if (vKey == "doctor") {
                $(row).find(`.doctor-name`).text(elem[vKey]);
            }
        }
    }

    $('#medicineEditModal').find('.player-name').attr('data-id', "");
    $('#medicineEditModal').find('.player-name').text("");
    $('#medicineEditModal').find('.med-row:not(.row-template)').remove();
    if (data) {
        $('#medicineEditModal').find('.player-name').attr('data-id', data.id);
        $('#medicineEditModal').find('.player-name').text(`${data.surname} ${data.name} ${data.patronymic}`);
        let tableBody = $('#medicineEditModal').find('#diseaseTable > tbody');
        if (Array.isArray(data.player_diagnosis)) {
            data.player_diagnosis.forEach(diagnosis => {
                let row = $(tableBody).find('.row-template').clone();
                $(row).removeClass('row-template d-none');
                $(row).attr('data-id', diagnosis['id']);
                _renderRowColumn(row, diagnosis);
                $(tableBody).append(row);
            });
        }
        tableBody = $('#medicineEditModal').find('#treatmentTable > tbody');
        if (Array.isArray(data.player_treatment)) {
            data.player_treatment.forEach(treatment => {
                let row = $(tableBody).find('.row-template').clone();
                $(row).removeClass('row-template d-none');
                $(row).attr('data-id', treatment['id']);
                _renderRowColumn(row, treatment);
                $(tableBody).append(row);
                let cSelect = $(row).find('.med-edit[name="treatment_type"]').clone();
                let cColumn = $(row).find('.med-edit[name="treatment_type"]').parent().parent();
                $(cSelect).prop('disabled', true);
                $(cColumn).html(''); $(cColumn).append(cSelect);
                $(cSelect).selectpicker('refresh');
                let valsArr = [];
                if (Array.isArray(treatment['treatment_type'])) {
                    for (let i = 0; i < treatment['treatment_type'].length; i++) {
                        valsArr.push(`${treatment['treatment_type'][i]['id']}`);
                    }
                }
                $(row).find(`[name="treatment_type"]`).selectpicker('val', valsArr);
            });
        }
        tableBody = $('#medicineEditModal').find('#documentTable > tbody');
        if (Array.isArray(data.player_document)) {
            data.player_document.forEach(document => {
                let row = $(tableBody).find('.row-template').clone();
                $(row).removeClass('row-template d-none');
                $(row).attr('data-id', document['id']);
                _renderRowColumn(row, document);
                $(tableBody).append(row);
            });
        }
        tableBody = $('#medicineEditModal').find('#noteTable > tbody');
        if (Array.isArray(data.player_note)) {
            data.player_note.forEach(note => {
                let row = $(tableBody).find('.row-template').clone();
                $(row).removeClass('row-template d-none');
                $(row).attr('data-id', note['id']);
                _renderRowColumn(row, note);
                $(tableBody).append(row);
            });
        }
        try {
            $('#medicineEditModal').find('#medAccess').val(data.player_access.access);
        } catch(e) {}
    }
    $('#medicineEditModal').find('#editMedicine').attr('data-type', "edit");
    $('#medicineEditModal').find('#editMedicine').removeClass('btn-success');
    $('#medicineEditModal').find('#editMedicine').addClass('btn-warning');
    $('#medicineEditModal').find('#editMedicine').text("Редактировать");
    $('#medicineEditModal').find('#cancelEditingMedicine').addClass('d-none');
    $('#medicineEditModal').find('.med-edit').prop('disabled', true);
    $('#medicineEditModal').find('#goToPlayerCard > :not(.no)').css({'width': "18px", 'height': "18px"});
    $('#medicineEditModal').modal('show');
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
    // Medicine types' selectpicker
    $('#medTypes').selectpicker({
        title: "Статус",
    });

    // Medicine table
    GenerateMedicineTable("calc(100vh - 200px)");
    $("#tableSearch").on('keyup', (e) => {
        let value = $(e.currentTarget).val();
        medicine_table.search(value).draw();
    });
    $('#medTypes').on('change', (e) => {
        let medTypes = $(e.currentTarget).selectpicker('val');
        medicine_table.rows().every((rowIdx, tableLoop, rowLoop) => {
            let row = medicine_table.row(rowIdx);
            let rowNode = row.node(); let rowData = row.data();
            $(rowNode).removeClass('d-none');
            if (Array.isArray(medTypes) && medTypes.length > 0 && !medTypes.includes(rowData['med_status_code'])) {
                $(rowNode).addClass('d-none');
            }
        });
    });
    $('#clearFilters').on('click', (e) => {
        $("#tableSearch").val('');
        $('#medTypes').selectpicker('val', '');
        medicine_table.search("").draw();
    });

    $('#medicine').on('click', 'tr.medicine-row', (e) => {
        let playerId = $(e.currentTarget).attr('data-player');
        LoadPlayerMedicine(playerId);
    });
    $('#medicineEditModal').on('hide.bs.modal', (e) => {
        $('#medicine').find('tr.medicine-row').removeClass('selected');
    });
    $('#medicineEditModal').on('hidden.bs.modal', (e) => {
        GenerateMedicineTable("calc(100vh - 200px)");
    });


    $('#medicineEditModal').on('click', '#editMedicine', (e) => {
        let cType = $(e.currentTarget).attr('data-type');
        if (cType == "edit") {
            cType = "save";
            $(e.currentTarget).attr('data-type', "save");
            $(e.currentTarget).text("Сохранить");
            $(e.currentTarget).removeClass('btn-warning');
            $(e.currentTarget).addClass('btn-success');
            $('#medicineEditModal').find('#cancelEditingMedicine').removeClass('d-none');
            $('#medicineEditModal').find('.med-edit').prop('disabled', false);
            $('#medicineEditModal').find('.med-edit[name="treatment_type"]').next().addClass('active');
            $('.selectpicker').selectpicker('refresh');
        } else {
            let playerId = $('#medicine').find('tr.medicine-row.selected').attr('data-player');
            LoadPlayerMedicine(playerId);
        }
    });
    $('#medicineEditModal').on('click', '#cancelEditingMedicine', (e) => {
        let playerId = $('#medicine').find('tr.medicine-row.selected').attr('data-player');
        LoadPlayerMedicine(playerId);
    });


    $('#medicineEditModal').on('click', '.add-new', (e) => {
        let cType = $(e.currentTarget).attr('name');
        let tableBody = null;
        switch (cType) {
            case "disease":
                tableBody = $('#medicineEditModal').find('#diseaseTable > tbody');
                break;
            case "treatment":
                tableBody = $('#medicineEditModal').find('#treatmentTable > tbody');
                break;
            case "document":
                tableBody = $('#medicineEditModal').find('#documentTable > tbody');
                break;
            case "note":
                tableBody = $('#medicineEditModal').find('#noteTable > tbody');
                break;
            default:
                break;
        }
        let row = $(tableBody).find('.row-template').clone();
        if (cType == "treatment") {
            let cSelect = $(row).find('.med-edit[name="treatment_type"]').clone();
            let cColumn = $(row).find('.med-edit[name="treatment_type"]').parent().parent();
            $(cColumn).html(''); $(cColumn).append(cSelect);
            $(cSelect).selectpicker('refresh');
        }
        $(row).removeClass('row-template d-none');
        $(tableBody).append(row);
    });
    $('#medicineEditModal').on('change', '.med-edit', (e) => {
        let cName = $(e.currentTarget).attr('name');
        let value = $(e.currentTarget).val();
        if ($(e.currentTarget).hasClass('bootstrap-select')) {
            cName = $(e.currentTarget).find('.selectpicker').attr('name');
            value = $(e.currentTarget).find('.selectpicker').val().toString();
        }
        let cRow = $(e.currentTarget).parent().parent();
        let rowType = $(cRow).attr('data-type');
        let cId = $(cRow).attr('data-id');
        let playerId = $('#medicineEditModal').find('.player-name').attr('data-id');
        if (cName == "diagnosis_type") {
            let short = $(cRow).find(`.med-edit[name="diagnosis_type"] > option[value="${value}"]`).attr('data-short');
            $(cRow).find(`.med-edit[name="disease_specific"]`).toggleClass('d-none', short != "injury");
            $(cRow).find(`.med-edit[name="disease_nonspecific"]`).toggleClass('d-none', short != "disease");
            $(cRow).find(`.med-edit[name="disease_specific"]`).val('');
            $(cRow).find(`.med-edit[name="disease_nonspecific"]`).val('');
        }
        if (cName == "healthy_status") {
            $(cRow).find(`.med-edit[name="healthy_date"]`).toggleClass('d-none', value != "1");
            $(cRow).find(`.med-edit[name="healthy_date"]`).val('');
        }
        if ($(cRow).hasClass('med-row')) {
            let data = {
                'edit_medicine': 1, 'id': cId, 'player_id': playerId,
                'name': cName, 'value': value, 'type': rowType
            };
            if (cName == "doc") {
                let formData = new FormData();
                for (let key in data) {
                    formData.append(key, data[key]);
                }
                formData.append('doc', $(e.currentTarget)[0].files[0]);
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: formData,
                    type: 'POST', // GET или POST
                    url: "medicine_api",
                    contentType: false,
                    processData: false,
                    success: function (res) {
                        if (res.success) {
                            $(cRow).attr('data-id', res.data.id);
                        }
                    },
                    error: function (res) {
                        console.log(res)
                    },
                    complete: function (res) {}
                });
            } else {
                $.ajax({
                    headers:{"X-CSRFToken": csrftoken},
                    data: data,
                    type: 'POST', // GET или POST
                    dataType: 'json',
                    url: "medicine_api",
                    success: function (res) {
                        if (res.success) {
                            $(cRow).attr('data-id', res.data.id);
                        }
                    },
                    error: function (res) {
                        console.log(res)
                    },
                    complete: function (res) {}
                });
            }
           
        }
    });
    $('#medicineEditModal').on('click', '.remove-med', (e) => {
        let cRow = $(e.currentTarget).parent().parent()
        let cId = $(cRow).attr('data-id');
        if (cId == "") {
            $(cRow).remove();
            return;
        }
        let rowType = $(cRow).attr('data-type');
        let data = {'delete_medicine': 1, 'id': cId, 'type': rowType};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "medicine_api",
            success: function (res) {
                if (res.success) {
                    $(cRow).remove();
                }
            },
            error: function (res) {
                swal("Ошибка", `Не удалось удалить выбранный элемент!`, "error");
                console.log(res)
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#medicineEditModal').on('change', '#medAccess', (e) => {
        let playerId = $('#medicineEditModal').find('.player-name').attr('data-id');
        let value = $(e.currentTarget).val();
        let data = {
            'edit_medicine': 1, 'player_id': playerId,
            'name': "access", 'value': value, 'type': "med_access"
        };
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: data,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "medicine_api",
            success: function (res) {
                if (res.success) {}
            },
            error: function (res) {
                console.log(res)
            },
            complete: function (res) {}
        });
    });

    $('#medicineEditModal').on('click', '#goToPlayerCard', (e) => {
        let playerId = $('#medicineEditModal').find('.player-name').attr('data-id');
        sessionStorage.setItem("selectedPlayer", playerId);
        window.location.href = `/players/player?id=${playerId}`;
    });

    $('#medicineEditModal').on('click', 'tr.custom-table-hd', (e) => {
        if ($(e.target).is('button') || $(e.target).is('i')) {return;}
        let cTableBody = $(e.currentTarget).parent().parent().find('tbody');
        $(cTableBody).find('tr').toggleClass('hide-row');
    });

    $('#medicineEditModal').on('click', '#downloadDocFile', (e) => {
        e.preventDefault();
        let cUrl = $(e.currentTarget).attr('href');
        DownloadDocFile(cUrl);
    });
});
