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
    scrollX: true,
    scrollY: "73vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: true,
    drawCallback: function( settings ) {
    },
    initComplete: (settings, json) => {
        SetTableMarkers();
        let storagedColumns = null;
        try {
            storagedColumns = JSON.parse(localStorage.getItem("analytics__table_cols_visible"));
        } catch(e) {}
        if (Array.isArray(storagedColumns)) {
            setTimeout(() => {
                $('#columnsDefaultTableVisibleSelect').selectpicker('val', storagedColumns);
                $('#columnsDefaultTableVisibleSelect').selectpicker('refresh');
                $('#columnsDefaultTableVisibleSelect').trigger('change');
            }, 500);
        }
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
    scrollX: true,
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
    scrollX: true,
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

let analytics_blocks_table
let analytics_blocks_table_options = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollX: true,
    scrollY: "73vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: true,
    drawCallback: function( settings ) {
    },
    initComplete: (settings, json) => {
        SetTableMarkers();
    },
    "columnDefs": [
        {"width": "20%", "targets": 1},
        {"className": "dt-vertical-center", "targets": "_all"},
        {"orderable": false, "targets": 0}
    ],
    "orderFixed": [0, 'asc']
};

let analytics_teams_folders_table
let analytics_teams_folders_table_options = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollX: true,
    scrollY: "73vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: true,
    drawCallback: function( settings ) {
    },
    initComplete: (settings, json) => {
        SetTableMarkers();
    },
    "columnDefs": [
        {"width": "25%", "targets": 1},
        {"className": "dt-vertical-center", "targets": "_all"},
        {"orderable": false, "targets": 0}
    ]
};

function getAllIndexes(arr, val) {
    let indexes = [];
    for (i = 0; i < arr.length; i++) {
        if (arr[i] === val) {indexes.push(i);}
    }
    return indexes;
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

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
    const shortNameChars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
    $('#analytics').find('th[data-col*=col_folder_]').each((ind, elem) => {
        let currentShortName = shortNameChars[(ind) % shortNameChars.length].toUpperCase();
        $(elem).text(`${currentShortName}`);
    });
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
                    <td class="text-center" data-column="exs_folders__${elem}__${key}">
                        ${player.res_trainings.trainings_count > 0 && tVal > 0 ? tVal : '-'}
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
                    <td class="text-center" data-column="index__${key}">
                        ${cIndex}
                    </td>
                    <td class="border-custom-right" data-column="name__${key}">
                        ${player.name}
                    </td>
                    <td class="text-center border-custom-left" data-column="diseases__${key}">
                        ${player.res_protocols.diseases_count > 0 ? player.res_protocols.diseases_count : '-'}
                    </td>
                    <td class="text-center" data-column="injuries__${key}">
                        ${player.res_protocols.injuries_count > 0 ? player.res_protocols.injuries_count : '-'}
                    </td>
                    <td class="text-center" data-column="skip_count__${key}">
                        ${player.res_protocols.skip_count > 0 ? player.res_protocols.skip_count : '-'}
                    </td>
                    <td class="text-center" data-column="a_u_count__${key}">
                        ${player.res_protocols.a_u_count > 0 ? player.res_protocols.a_u_count : '-'}
                    </td>
                    <td class="text-center border-custom-right" data-column="disqualification_count__${key}">
                        ${player.res_protocols.disqualification_count > 0 ? player.res_protocols.disqualification_count : '-'}
                    </td>
                    <td class="text-center border-custom-left" data-column="matches_count__${key}">
                        ${player.res_matches.matches_count > 0 ? player.res_matches.matches_count : '-'}
                    </td>
                    <td class="text-center" data-column="matches_time__${key}">
                        ${player.res_matches.matches_time > 0 ? player.res_matches.matches_time : '-'}
                    </td>
                    <td class="text-center" data-column="matches_yellow_card__${key}">
                        ${player.res_matches.matches_yellow_card > 0 ? player.res_matches.matches_yellow_card : '-'}
                    </td>
                    <td class="text-center" data-column="matches_red_card__${key}">
                        ${player.res_matches.matches_red_card > 0 ? player.res_matches.matches_red_card : '-'}
                    </td>
                    <td class="text-center" data-column="estimationAvg__${key}">
                        ${estimationAvg > 0 ? estimationAvg : '-'}
                    </td>
                    <td class="text-center" data-column="matches_dislike__${key}">
                        ${player.res_matches.matches_dislike > 0 ? player.res_matches.matches_dislike : '-'}
                    </td>
                    <td class="text-center" data-column="matches_like__${key}">
                        ${player.res_matches.matches_like > 0 ? player.res_matches.matches_like : '-'}
                    </td>
                    <td class="text-center border-custom-right" data-column="matches_captains__${key}">
                        ${player.res_matches.matches_captains > 0 ? player.res_matches.matches_captains : '-'}
                    </td>
                    <td class="text-center border-custom-left" data-column="matches_goals__${key}">
                        ${player.res_matches.matches_goals > 0 ? player.res_matches.matches_goals : '-'}
                    </td>
                    <td class="text-center" data-column="matches_penalty__${key}">
                        ${player.res_matches.matches_penalty > 0 ? player.res_matches.matches_penalty : '-'}
                    </td>
                    <td class="text-center border-custom-right" data-column="matches_pass__${key}">
                        ${player.res_matches.matches_pass > 0 ? player.res_matches.matches_pass : '-'}
                    </td>
                    <td class="text-center border-custom-left" data-column="trainings_count__${key}">
                        ${player.res_trainings.trainings_count > 0 ? player.res_trainings.trainings_count : '-'}
                    </td>
                    <td class="text-center" data-column="trainings_time__${key}">
                        ${player.res_trainings.trainings_count > 0 && player.res_trainings.trainings_time > 0 ? player.res_trainings.trainings_time : '-'}
                    </td>
                    <td class="text-center" data-column="trainings_dislike__${key}">
                        ${player.res_trainings.trainings_count > 0 && player.res_trainings.trainings_dislike > 0 ? player.res_trainings.trainings_dislike : '-'}
                    </td>
                    <td class="text-center border-custom-right" data-column="trainings_like__${key}">
                        ${player.res_trainings.trainings_count > 0 && player.res_trainings.trainings_like > 0 ? player.res_trainings.trainings_like : '-'}
                    </td>
                    ${exsFoldersHtml}
                    <td class="text-center border-custom-left" data-column="withBallPercent__${key}">
                        ${player.res_trainings.trainings_count > 0 && withBallPercent > 0 ? withBallPercent : '-'}
                    </td>
                    <td class="text-center" data-column="withoutBallPercent__${key}">
                        ${player.res_trainings.trainings_count > 0 && withoutBallPercent > 0 ? withoutBallPercent : '-'}
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

function LoadAnalyticsBlocks() {
    let dataToSend = {'get_analytics_blocks': 1, 'season_type': season_type};
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
            RenderAnalyticsBlocks(dataRes);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderAnalyticsBlocks(data) {
    try {
        analytics_blocks_table.destroy();
    } catch(e) {}
    let blocksIds = [];
    $('#analytics-blocks').find('thead').find('th[data-block-id]').each((ind, elem) => {
        let id = $(elem).attr('data-block-id');
        blocksIds.push(id);
    });
    $('#analytics-blocks').find('tbody').html('');
    if (data['players'] && typeof data['players'] === "object" && !Array.isArray(data['players'])) {
        let tmpHtml = "";
        let cIndex = 1;
        for (let key in data['players']) {
            let player = data['players'][key];
            let rowsHtml = "";
            blocksIds.forEach(blockId => {
                let duration = "-";
                let count = "-";
                try {
                    duration = player.res_trainings[blockId]['_time'];
                    count = player.res_trainings[blockId]['_count'];
                } catch (e) {}
                rowsHtml += `
                    <td class="text-center border-custom-left" data-column="block_count__${blockId}__${key}">
                        ${count}
                    </td>
                    <td class="text-center" data-column="block_duration__${blockId}__${key}">
                        ${duration}
                    </td>
                `;
            });
            tmpHtml += `
                <tr class="analytics-blocks-row" data-id="${key}">
                    <td class="text-center" data-column="index__${key}">
                        ${cIndex}
                    </td>
                    <td class="border-custom-right" data-column="name__${key}">
                        ${player.name}
                    </td>
                    ${rowsHtml}
                </tr>
            `;
            cIndex ++;
        }
        $('#analytics-blocks').find('tbody').html(tmpHtml);
    }
    analytics_blocks_table = $('#analytics-blocks').DataTable(analytics_blocks_table_options);
    analytics_blocks_table.draw();
}

function LoadAnalyticsTeamsFolders() {
    let dataToSend = {'get_analytics_teams_folders': 1, 'season_type': season_type};
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
            RenderAnalyticsTeamsFolders(dataRes);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderAnalyticsTeamsFolders(data) {
    try {
        analytics_teams_folders_table.destroy();
    } catch(e) {}
    let foldersIds = [];
    $('#analytics-team-folders').find('thead').find('th[data-folder-id]').last().removeClass('border-custom-x');
    $('#analytics-team-folders').find('thead').find('th[data-folder-id]').each((ind, elem) => {
        let id = $(elem).attr('data-folder-id');
        foldersIds.push(id);
    });
    $('#analytics-team-folders').find('tbody').html('');
    if (data['teams'] && typeof data['teams'] === "object" && !Array.isArray(data['teams'])) {
        let tmpHtml = "";
        let cIndex = 1;
        let teams = {};
        for (let key in data['teams']) {
            let team = clone = JSON.parse(JSON.stringify(data['teams'][key]));
            team.id = key;
            teams[team.index] = team;
        }
        for (let key in teams) {
            let team = teams[key];
            let rowsHtml = "";
            let values = [];
            let valuesSum = 0;
            foldersIds.forEach(folderId => {
                let duration = 0;
                try {
                    duration = team.folders[folderId];
                } catch (e) {}
                if (duration === undefined || duration === null) {duration = 0;}
                values.push({'id': folderId, 'duration': duration});
                valuesSum += duration;
            });
            values.forEach(elem => {
                let val = elem['duration'];
                let percent = val;
                if (valuesSum > 0) {
                    percent = (val / valuesSum * 100).toFixed(0);
                }
                if (percent == 0) {percent = "-";}
                rowsHtml += `
                    <td class="text-center border-custom-left" title="${val}" data-column="block_count__${elem['id']}__${team.id}">
                        ${percent}
                    </td>
                `;
            });
            tmpHtml += `
                <tr class="analytics-blocks-row" data-id="${team.id}">
                    <td class="text-center" data-column="index__${team.id}">
                        ${cIndex}
                    </td>
                    <td class="border-custom-right" data-column="name__${team.id}">
                        ${team.name}
                    </td>
                    ${rowsHtml}
                </tr>
            `;
            cIndex ++;
        }
        $('#analytics-team-folders').find('tbody').html(tmpHtml);
    }
    analytics_teams_folders_table = $('#analytics-team-folders').DataTable(analytics_teams_folders_table_options);
    analytics_teams_folders_table.draw();
}

function UpdateTableMarkers(table, markers) {
    let dataToSend = {
        'edit_table_markers': 1,
        'table': table, 'markers': JSON.stringify(markers),
        'season_type': season_type};
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'POST', // GET или POST
        dataType: 'json',
        url: "analytics_api",
        success: function (res) {
            if (res.success) {}
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
        }
    });
}

function SetTableMarkers() {
    let dataRes = {};
    let dataToSend = {'get_table_markers': 1, 'season_type': season_type};
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
            window.tableMarkers = dataRes;
            if (typeof window.tableMarkers === 'object' && !Array.isArray(window.tableMarkers) && window.tableMarkers !== null) {
                $('.analytics-table-container').find('td.td-m-black').removeClass('td-m-black');
                $('.analytics-table-container').find('td.td-m-red').removeClass('td-m-red');
                $('.analytics-table-container').find('td.td-m-green').removeClass('td-m-green');
                for (let key in window.tableMarkers) {
                    let markers = null;
                    try {
                        markers = JSON.parse(window.tableMarkers[key]);  
                    } catch (e) {}
                    if (markers) {
                        for (let m in markers) {
                            let val = markers[m];
                            let className = '';
                            if (val == 'black') {className = 'td-m-black';}
                            else if (val == 'red') {className = 'td-m-red';}
                            else if (val == 'green') {className = 'td-m-green';}
                            $(`#${key}`).find(`td[data-column="${m}"]`).addClass(className);
                        }
                    }
                }
            }
        }
    });
}



$(function() {

    let selectedTeam = $('#select-team').val();
    let selectedSeason = $('#select-season').val();
    if (!selectedTeam || selectedTeam == "" || !selectedSeason || selectedSeason == "") {
        swal("Внимание", "Выберите сезон и команду для отображения данных!", "warning");
    }
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
            } else if ($('.toggle-tables.selected').attr('id') == "analyticsBlocksTable") {
                LoadAnalyticsBlocks();
            } else if ($('.toggle-tables.selected').attr('id') == "analyticsTeamsFoldersTable") {
                LoadAnalyticsTeamsFolders();
            }
        }
    });

    let columnsDefaultTableIndexes = [];
    $('#analytics').find('th.visible-col').each((ind, elem) => {
        columnsDefaultTableIndexes.push($(elem).attr('data-col'));
    });
    $('#columnsDefaultTableVisibleSelect').find('option').prop('selected', 'selected').end();
    $('#columnsDefaultTableVisibleSelect').selectpicker();
    $('#columnsDefaultTableVisibleSelect').on('change', (e) => {
        let visibleList = $(e.currentTarget).val();
        if (Array.isArray(visibleList)) {
            for (let i = 2; i < columnsDefaultTableIndexes.length; i++) {
                analytics_table.column(i).visible(false);
            }
            visibleList.forEach(type => {
                let cIndex = columnsDefaultTableIndexes.indexOf(type);
                analytics_table.column(cIndex).visible(true);
            });
            localStorage.setItem("analytics__table_cols_visible", JSON.stringify(visibleList));
        }
    });

    let columnsBlocksTableIndexes = [];
    $('#analytics-blocks').find('th.visible-col').each((ind, elem) => {
        columnsBlocksTableIndexes.push($(elem).attr('data-col'));
    });
    $('#columnsBlocksTableVisibleSelect').find('option').prop('selected', 'selected').end();
    $('#columnsBlocksTableVisibleSelect').selectpicker();
    $('#columnsBlocksTableVisibleSelect').on('change', (e) => {
        let visibleList = $(e.currentTarget).val();
        if (Array.isArray(visibleList)) {
            for (let i = 2; i < columnsBlocksTableIndexes.length; i++) {
                analytics_blocks_table.column(i).visible(false);
            }
            visibleList.forEach(type => {
                let cIndexes = getAllIndexes(columnsBlocksTableIndexes, type);
                cIndexes.forEach(index => {
                    analytics_blocks_table.column(index).visible(true);
                });
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
        $('.up-block-content').find('.columns-settings').addClass('d-none');
        $('.up-block-content').find(`.columns-settings[data-id="${cId}"]`).removeClass('d-none');
        $(e.currentTarget).addClass('selected');
        if ($('.toggle-tables.selected').attr('id') == "defaultTable") {
            LoadAnalytics();
        } else if ($('.toggle-tables.selected').attr('id') == "foldersTable") {
            LoadAnalyticsByFolders();
        } else if ($('.toggle-tables.selected').attr('id') == "foldersFullTable") {
            LoadAnalyticsByFoldersFull();
        } else if ($('.toggle-tables.selected').attr('id') == "analyticsBlocksTable") {
            LoadAnalyticsBlocks();
        } else if ($('.toggle-tables.selected').attr('id') == "analyticsTeamsFoldersTable") {
            LoadAnalyticsTeamsFolders();
        }
    });

    $('.analytics-table-container').on('click', 'td', (e) => {
        let tableId = $(e.currentTarget).parent().parent().parent().attr('id');
        let currentMarker = $('#colorMarkerSelect').val();
        if (currentMarker == null || currentMarker == "") {return;}
        $(e.currentTarget).toggleClass('td-m-black', currentMarker == "black");
        $(e.currentTarget).toggleClass('td-m-red', currentMarker == "red");
        $(e.currentTarget).toggleClass('td-m-green', currentMarker == "green");
        let markers = {};
        $(`#${tableId}`).find('td').each((ind, elem) => {
            let column = $(elem).attr('data-column');
            let className = '';
            if ($(elem).hasClass('td-m-black')) {
                className = 'black';
            } else if ($(elem).hasClass('td-m-red')) {
                className = 'red';
            } else if ($(elem).hasClass('td-m-green')) {
                className = 'green';
            }
            markers[column] = className;
        });
        UpdateTableMarkers(tableId, markers);
    });

    $('#printTableData').on('click', (e) => {
        let teamName = $('#select-team').find(`option[value="${$('#select-team').val()}"]`).text();
        let seasonName = $('.analytics-table-container').find('.season-toggle.active').text();
        let tableContent = "";
        $('.analytics-table-container').find('table:visible').each((ind, elem) => {
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
                            <h5>Аналитика. ${teamName}. ${seasonName}</h5>
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

    $('#shareTableData').on('click', (e) => {
        $('#analyticsShareModal').modal('show');
    });
    $('#analyticsShareModal').on('show.bs.modal', (e) => {
        $('#analyticsShareModal').find('.link-text > a').text('-');
        $('#analyticsShareModal').find('.link-text > a').attr('href', '');
        $('#analyticsShareModal').find('button.btn-share').attr('data-link', "");
        $('#analyticsShareModal').find('button.btn-copy').addClass('d-none');
        $('#analyticsShareModal').find('.link-qrcode').html('');

        let tableType = $('.analytics-table-container').find('table[id]:visible').attr('id');
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: {'get_link': 1, 'type': `analytics`, 'table_type': tableType, 'season_type': season_type},
            type: 'GET', // GET или POST
            dataType: 'json',
            url: "/shared/shared_link_api",
            success: function (res) {
                if (res.success) {
                    $('#analyticsShareModal').find('.link-text > a').text(res.data.link);
                    $('#analyticsShareModal').find('.link-text > a').attr('href', res.data.link);
                    $('#analyticsShareModal').find('button.btn-share').attr('data-link', res.data.link);
                    $('#analyticsShareModal').find('button.btn-copy').removeClass('d-none');
                    new QRCode($('#analyticsShareModal').find('.link-qrcode')[0], {
                        text: res.data.link,
                        width: 150,
                        height: 150,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
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
    $('#analyticsShareModal').on('click', '.btn-share', (e) => {
        let cLink = $(e.currentTarget).attr('data-link');
        if (cLink && cLink != "") {
            try {
                copyTextToClipboard(cLink);
            } catch(e) {}
            swal("Готово", `Ссылка скопирована (${cLink})!`, "success");
            return;
        }
        let tableType = $('.analytics-table-container').find('table[id]:visible').attr('id');
        let d = new Date(); d.setDate(d.getDate() + 2);
        let expireDate = `${d.getFullYear()}-${(d.getMonth() + 1) < 10 ? `0${d.getMonth() + 1}` : `${d.getMonth() + 1}`}-${d.getDate() < 10 ? `0${d.getDate()}` : `${d.getDate()}`}`;
        let dataToSend = {
            'add_link': 1,
            'type': `analytics`,
            'table_type': tableType,
            'season_type': season_type,
            'expire_date': expireDate
        };
        $('.page-loader-wrapper').fadeIn();
        $.ajax({
            headers:{"X-CSRFToken": csrftoken},
            data: dataToSend,
            type: 'POST', // GET или POST
            dataType: 'json',
            url: "/shared/shared_link_api",
            success: function (res) {
                if (res.success) {
                    $('#analyticsShareModal').find('.link-text > a').text(res.data.link);
                    $('#analyticsShareModal').find('.link-text > a').attr('href', res.data.link);
                    $('#analyticsShareModal').find('button.btn-share').attr('data-link', res.data.link);
                    $('#analyticsShareModal').find('button.btn-copy').removeClass('d-none');
                    new QRCode($('#analyticsShareModal').find('.link-qrcode')[0], {
                        text: res.data.link,
                        width: 150,
                        height: 150,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                    try {
                        copyTextToClipboard(res.data.link);
                    } catch(e) {}
                    swal("Готово", `Ссылка скопирована (Срок: 2 дня)!`, "success");
                }
            },
            error: function (res) {
                if (res.responseJSON.type == "date") {
                    swal("Ошибка", "Дата введена не корректно!", "error");
                } else if (res.responseJSON.type == "link") {
                    swal("Ошибка", "Невозможно создать общую ссылку!", "error");
                }
                console.log(res);
            },
            complete: function (res) {
                $('.page-loader-wrapper').fadeOut();
            }
        });
    });
    $('#analyticsShareModal').on('click', '.btn-copy', (e) => {
        let cLink = $('#analyticsShareModal').find('button.btn-share').attr('data-link');
        try {
            copyTextToClipboard(cLink);
        } catch(e) {}
    });

    $(window).on('resize', () => {
        setTimeout(() => {
            try {
                analytics_table.columns.adjust().draw();
            } catch(e) {}
            try {
                analytics_blocks_table.columns.adjust().draw();
            } catch(e) {}
        }, 250);
    });
    $('#toggle_btn').on('click', (e) => {
        setTimeout(() => {
            try {
                analytics_table.columns.adjust().draw();
            } catch(e) {}
            try {
                analytics_blocks_table.columns.adjust().draw();
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
            try {
                analytics_blocks_table.columns.adjust().draw();
            } catch(e) {}
        }, 500);
    }, 500);
});
