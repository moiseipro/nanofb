let season_type = null;
let season_type_in_storage = window.sessionStorage.getItem('analytics__season_type');
if (season_type_in_storage) {season_type = season_type_in_storage;}
let analytics_table
let analytics_table_options = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollY: "73vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: true,
    drawCallback: function( settings ) {
    },
    "columnDefs": [
        {"width": "25%", "targets": 1},
        {"className": "dt-vertical-center", "targets": "_all"}
    ]
};

let analytics_by_folders_table
let analytics_by_folders_table_options = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollY: "73vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: true,
    drawCallback: function( settings ) {
    },
    "columnDefs": [
        {"width": "25%", "targets": 1},
        {"className": "dt-vertical-center", "targets": "_all"}
    ]
};

let analytics_by_folders_full_table
let analytics_by_folders_full_table_options = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollY: "73vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: true,
    drawCallback: function( settings ) {
    },
    "columnDefs": [
        {"width": "25%", "targets": 0},
        {"className": "dt-vertical-center", "targets": "_all"},
        {"orderable": false, "targets": 0}
    ],
    "orderFixed": [0, 'asc']
};

function LoadAnalytics() {
    let dataToSend = {'get_analytics_all': 1, 'season_type': season_type};
    let dataRes = {};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "analytics_api",
        success: function (res) {
            if (res.success) {
                dataRes = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderAnalyticsTable(dataRes);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderAnalyticsTable(data) {
    try {
        analytics_table.destroy();
    } catch(e) {}
    $('#analytics').find('tbody').html('');
    if (data['players'] && typeof data['players'] === "object" && !Array.isArray(data['players'])) {
        let tmpHtml = "";
        let foldersInHeader = [];
        $('#analytics').find('th.h-folder').each((ind, elem) => {
            let tId = parseInt($(elem).attr('data-id'));
            if (isNaN(tId)) {tId = -1;}
            foldersInHeader.push(tId);
        });
        let cIndex = 1;
        for (let key in data['players']) {
            let player = data['players'][key];
            let exsFoldersHtml = "";
            let foldersSum = 0;
            foldersInHeader.forEach(elem => {
                let tVal = 0;
                try {
                    tVal = parseInt(player.res_trainings.trainings_exs_folders[elem]);
                    if (isNaN(tVal)) {tVal = 0;}
                } catch(e) {}
                foldersSum += tVal;
            });
            foldersInHeader.forEach(elem => {
                let tVal = 0;
                try {
                    tVal = (parseInt(player.res_trainings.trainings_exs_folders[elem]) / foldersSum * 100).toFixed(0);
                } catch(e) {}
                exsFoldersHtml += `
                    <td class="text-center">
                        ${tVal > 0 ? tVal : '-'}
                    </td>
                `;
            });
            let estimationAvg = 0;
            try {
                estimationAvg = (player.res_matches.matches_estimation / player.res_matches.matches_estimation_count).toFixed(1);
            } catch(e) {}
            let ballValsSum = 0;
            let withBallPercent = 0; let withoutBallPercent = 0;
            try {
                ballValsSum = parseInt(player.res_trainings.trainings_with_ball) + parseInt(player.res_trainings.trainings_no_ball);
                withBallPercent = (parseInt(player.res_trainings.trainings_with_ball) / ballValsSum * 100).toFixed(0);
                withoutBallPercent = (parseInt(player.res_trainings.trainings_no_ball) / ballValsSum * 100).toFixed(0);
            } catch(e) {}
            tmpHtml += `
                <tr class="analytics-row" data-id="${key}">
                    <td class="text-center">
                        ${cIndex}
                    </td>
                    <td class="border-custom-right">
                        ${player.name}
                    </td>
                    <td class="text-center border-custom-left">
                        ${player.res_protocols.diseases_count > 0 ? player.res_protocols.diseases_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_protocols.injuries_count > 0 ? player.res_protocols.injuries_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_protocols.skip_count > 0 ? player.res_protocols.skip_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_protocols.a_u_count > 0 ? player.res_protocols.a_u_count : '-'}
                    </td>
                    <td class="text-center border-custom-right">
                        ${player.res_protocols.disqualification_count > 0 ? player.res_protocols.disqualification_count : '-'}
                    </td>
                    <td class="text-center border-custom-left">
                        ${player.res_matches.matches_count > 0 ? player.res_matches.matches_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_time > 0 ? player.res_matches.matches_time : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_yellow_card > 0 ? player.res_matches.matches_yellow_card : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_red_card > 0 ? player.res_matches.matches_red_card : '-'}
                    </td>
                    <td class="text-center">
                        ${estimationAvg > 0 ? estimationAvg : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_dislike > 0 ? player.res_matches.matches_dislike : '-'}
                    </td>
                    <td class="text-center border-custom-right">
                        ${player.res_matches.matches_like > 0 ? player.res_matches.matches_like : '-'}
                    </td>
                    <td class="text-center border-custom-left">
                        ${player.res_matches.matches_goals > 0 ? player.res_matches.matches_goals : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_penalty > 0 ? player.res_matches.matches_penalty : '-'}
                    </td>
                    <td class="text-center border-custom-right">
                        ${player.res_matches.matches_pass > 0 ? player.res_matches.matches_pass : '-'}
                    </td>
                    <td class="text-center border-custom-left">
                        ${player.res_trainings.trainings_count > 0 ? player.res_trainings.trainings_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_time > 0 ? player.res_trainings.trainings_time : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_dislike > 0 ? player.res_trainings.trainings_dislike : '-'}
                    </td>
                    <td class="text-center border-custom-right">
                        ${player.res_trainings.trainings_like > 0 ? player.res_trainings.trainings_like : '-'}
                    </td>
                    ${exsFoldersHtml}
                    <td class="text-center border-custom-left">
                        ${withBallPercent > 0 ? withBallPercent : '-'}
                    </td>
                    <td class="text-center">
                        ${withoutBallPercent > 0 ? withoutBallPercent : '-'}
                    </td>
                </tr>
            `;
            cIndex ++;
        }
        $('#analytics').find('tbody').html(tmpHtml);
    }
    analytics_table = $('#analytics').DataTable(analytics_table_options);
    analytics_table.draw();
}

function LoadAnalyticsByFolders() {
    let dataToSend = {'get_analytics_by_folders': 1, 'season_type': season_type};
    let dataRes = {};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "analytics_api",
        success: function (res) {
            if (res.success) {
                dataRes = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderAnalyticsByFoldersTable(dataRes);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderAnalyticsByFoldersTable(data) {
    try {
        analytics_by_folders_table.destroy();
    } catch(e) {}
    $('#analytics-by-folders').find('tbody').html('');
    if (data['players'] && typeof data['players'] === "object" && !Array.isArray(data['players'])) {
        let tmpHtml = "";
        let foldersInHeader = {};
        $('#analytics-by-folders').find('th.h-subfolder').each((ind, elem) => {
            let tId = parseInt($(elem).attr('data-id'));
            let tParentId = parseInt($(elem).attr('data-parent'));
            if (isNaN(tId)) {tId = -1;}
            if (isNaN(tParentId)) {tParentId = -1;}
            if (!foldersInHeader[tParentId]) {
                foldersInHeader[tParentId] = {'folders': [], 'sum': 0};
            }
            foldersInHeader[tParentId]['folders'].push(tId);
        });
        let cIndex = 1;
        for (let key in data['players']) {
            let player = data['players'][key];
            let exsFoldersHtml = "";
            for (let key in foldersInHeader) {
                let foldersSum = 0;
                foldersInHeader[key]['folders'].forEach(elem => {
                    let tVal = 0;
                    try {
                        tVal = parseInt(player.res_trainings.trainings_exs_folders[elem]);
                        if (isNaN(tVal)) {tVal = 0;}
                    } catch(e) {}
                    foldersSum += tVal;
                });
                foldersInHeader[key]['sum'] = foldersSum;
            }
            for (let key in foldersInHeader) {
                for (let i = 0; i < foldersInHeader[key]['folders'].length; i++) {
                    let elem = foldersInHeader[key]['folders'][i];
                    let tVal = 0;
                    try {
                        tVal = (parseInt(player.res_trainings.trainings_exs_folders[elem]) / foldersInHeader[key]['sum'] * 100).toFixed(0);
                    } catch(e) {}
                    let verticalLineClass = "";
                    if (i == foldersInHeader[key]['folders'].length - 1) {
                        let cHeader = $('#analytics-by-folders').find(`th[data-id="${elem}"]`);
                        if ($(cHeader).hasClass('border-custom-right')) {verticalLineClass = "border-custom-right";}
                        if ($(cHeader).hasClass('border-custom-x')) {verticalLineClass = "border-custom-x";}
                        if ($(cHeader).hasClass('border-custom-left')) {verticalLineClass = "border-custom-left";}
                    }
                    exsFoldersHtml += `
                        <td class="text-center ${verticalLineClass}">
                            ${tVal > 0 ? tVal : '-'}
                        </td>
                    `;
                }
            }
            tmpHtml += `
                <tr class="analytics-by-folders-row" data-id="${key}">
                    <td class="text-center">
                        ${cIndex}
                    </td>
                    <td class="border-custom-right">
                        ${player.name}
                    </td>
                    ${exsFoldersHtml}
                </tr>
            `;
            cIndex ++;
        }
        $('#analytics-by-folders').find('tbody').html(tmpHtml);
    }
    analytics_by_folders_table = $('#analytics-by-folders').DataTable(analytics_by_folders_table_options);
    analytics_by_folders_table.draw();
}

function LoadAnalyticsByFoldersFull() {
    let dataToSend = {'get_analytics_by_folders_full': 1};
    let dataRes = {};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "analytics_api",
        success: function (res) {
            if (res.success) {
                dataRes = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderAnalyticsByFoldersFullTable(dataRes);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderAnalyticsByFoldersFullTable(data) {
    try {
        analytics_by_folders_full_table.destroy();
    } catch(e) {}
    $('#analytics-by-folders-full').find('tbody').html('');
    if (data['months'] && typeof data['months'] === "object" && !Array.isArray(data['months'])) {
        let tmpHtml = "";
        let foldersInHeader = {'folders': [], 'subfolders': []};
        $('#analytics-by-folders-full').find('th.h-folder').each((ind, elem) => {
            let tId = parseInt($(elem).attr('data-id'));
            if (isNaN(tId)) {tId = -1;}
            if (!foldersInHeader['folders'].includes(tId) && tId != -1) {
                foldersInHeader['folders'].push(tId);
            }
        });
        $('#analytics-by-folders-full').find('th.h-subfolder').each((ind, elem) => {
            let tId = parseInt($(elem).attr('data-id'));
            let tParentId = parseInt($(elem).attr('data-parent'));
            if (isNaN(tId)) {tId = -1;}
            if (isNaN(tParentId)) {tParentId = -1;}
            if (foldersInHeader['subfolders'].findIndex(x => x.id === tId) == -1 && tId != -1) {
                foldersInHeader['subfolders'].push({'id': tId, 'parent': tParentId});
            }
        });
        let cIndex = 1;
        for (let key in data['months']) {
            let cMonth = data['months'][key];
            let exsFoldersHtml = "";
            let foldersSum = 0;
            for (let folderIndex in foldersInHeader['folders']) {
                let tVal = 0;
                try {
                    tVal = parseInt(cMonth['trainings_exs_folders'][foldersInHeader['folders'][folderIndex]]);
                    if (isNaN(tVal)) {tVal = 0;}
                } catch(e) {}
                foldersSum += tVal;
            }
            for (let folderIndex in foldersInHeader['folders']) {
                let tVal = 0;
                try {
                    tVal = (parseInt(cMonth['trainings_exs_folders'][foldersInHeader['folders'][folderIndex]]) / foldersSum * 100).toFixed(0);
                } catch(e) {}
                let verticalLineClass = "";
                let cHeader = $('#analytics-by-folders-full').find(`th[data-id="${foldersInHeader['folders'][folderIndex]}"]`);
                if ($(cHeader).hasClass('border-custom-right')) {verticalLineClass = "border-custom-right";}
                if ($(cHeader).hasClass('border-custom-x')) {verticalLineClass = "border-custom-x";}
                if ($(cHeader).hasClass('border-custom-left')) {verticalLineClass = "border-custom-left";}
                exsFoldersHtml += `
                    <td class="text-center ${verticalLineClass}">
                        ${tVal > 0 ? tVal : '-'}
                    </td>
                `;
            }
            for (let folderIndex in foldersInHeader['subfolders']) {
                let cHeader = $('#analytics-by-folders-full').find(`th[data-id="${foldersInHeader['subfolders'][folderIndex]['id']}"]`);
                let cParentId = parseInt($(cHeader).attr('data-parent'));
                if (isNaN(cParentId)) {cParentId = -1;}
                let tVal = 0;
                try {
                    let subfoldersSum = parseInt(cMonth['trainings_exs_folders'][cParentId]);
                    tVal = (parseInt(cMonth['trainings_exs_subfolders'][foldersInHeader['subfolders'][folderIndex]['id']]) / subfoldersSum * 100).toFixed(0);
                } catch(e) {}
                let verticalLineClass = "";
                
                if ($(cHeader).hasClass('border-custom-right')) {verticalLineClass = "border-custom-right";}
                if ($(cHeader).hasClass('border-custom-x')) {verticalLineClass = "border-custom-x";}
                if ($(cHeader).hasClass('border-custom-left')) {verticalLineClass = "border-custom-left";}
                exsFoldersHtml += `
                    <td class="text-center ${verticalLineClass}">
                        ${tVal > 0 ? tVal : '-'}
                    </td>
                `;
            }
            tmpHtml += `
                <tr class="analytics-by-folders-full-row" data-id="${key}">
                    <td class="text-center" data-order="${key}">
                        ${cMonth['name']}
                    </td>
                    ${exsFoldersHtml}
                </tr>
            `;
            cIndex ++;
        }
        $('#analytics-by-folders-full').find('tbody').html(tmpHtml);
    }
    analytics_by_folders_full_table = $('#analytics-by-folders-full').DataTable(analytics_by_folders_full_table_options);
    analytics_by_folders_full_table.draw();
}



$(function() {

    LoadAnalytics();

    $('.analytics-table-container').find('.season-toggle').removeClass('active');
    let foundBtn = $('.analytics-table-container').find(`.season-toggle[type=${season_type}]`);
    if (foundBtn.length > 0) {
        $(foundBtn).addClass('active');
    } else {
        $('.analytics-table-container').find(`.season-toggle`).first().addClass('active');
    }

    $('.analytics-table-container').on('click', '.season-toggle', (e) => {
        if (!$(e.currentTarget).hasClass('active')) {
            $('.analytics-table-container').find('.season-toggle').removeClass('active');
            $(e.currentTarget).addClass('active');
            season_type = $(e.currentTarget).attr('type');
            window.sessionStorage.setItem('analytics__season_type', season_type);
            if ($('.toggle-tables.selected').attr('id') == "defaultTable") {
                LoadAnalytics();
            } else if ($('.toggle-tables.selected').attr('id') == "foldersTable") {
                LoadAnalyticsByFolders();
            } else if ($('.toggle-tables.selected').attr('id') == "foldersFullTable") {
                LoadAnalyticsByFoldersFull();
            }
        }
    });

    let columnsIndexes = [];
    $('#analytics').find('th.visible-col').each((ind, elem) => {
        columnsIndexes.push($(elem).attr('data-col'));
    });
    $('#columnsVisibleSelect').find('option').prop('selected', 'selected').end();
    $('#columnsVisibleSelect').selectpicker();
    // $('#columnsVisibleSelect').select2({
    //     tags: "false",
    //     placeholder: 'Колонки',
    //     closeOnSelect: false,
    // });
    $('#columnsVisibleSelect').on('change', (e) => {
        let visibleList = $(e.currentTarget).val();
        if (Array.isArray(visibleList)) {
            for (let i = 2; i < columnsIndexes.length; i++) {
                analytics_table.column(i).visible(false);
            }
            visibleList.forEach(type => {
                let cIndex = columnsIndexes.indexOf(type);
                analytics_table.column(cIndex).visible(true);
            });
        }
    });

    $('#resetCachedData').on('click', (e) => {
        let dataToSend = {'reset_cache': 1, 'season_type': season_type};
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "analytics_api",
            success: function (res) {
                if (res.success) {
                    window.location.reload();
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

    $('.toggle-tables').on('click', (e) => {
        let cId = $(e.currentTarget).attr('id');
        $('.toggle-tables').removeClass('selected');
        $('.analytics-table-container').find('.table-block').addClass('d-none');
        $('.analytics-table-container').find(`.table-block[data-id="${cId}"]`).removeClass('d-none');
        $(e.currentTarget).addClass('selected');
        if ($('.toggle-tables.selected').attr('id') == "defaultTable") {
            LoadAnalytics();
        } else if ($('.toggle-tables.selected').attr('id') == "foldersTable") {
            LoadAnalyticsByFolders();
        } else if ($('.toggle-tables.selected').attr('id') == "foldersFullTable") {
            LoadAnalyticsByFoldersFull();
        }
    });

    $('#toggle_btn').on('click', (e) => {
        setTimeout(() => {
            try {
                analytics_table.columns.adjust().draw();
            } catch(e) {}
        }, 500);
    });
    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
        setTimeout(() => {
            try {
                analytics_table.columns.adjust().draw();
            } catch(e) {}
        }, 500);
    }, 500);
});
