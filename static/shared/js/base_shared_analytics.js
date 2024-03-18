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


let analytics_blocks_table
let analytics_blocks_table_options = {
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
        {"width": "20%", "targets": 1},
        {"className": "dt-vertical-center", "targets": "_all"},
        {"orderable": false, "targets": 0}
    ],
    "orderFixed": [0, 'asc']
};


function LoadAnalytics() {
    let dataToSend = {
        'get_analytics_all': 1,
        'user': $('div.data-row > .user').text(),
        'club': $('div.data-row > .club').text(),
        'team': $('div.data-row > .team').text(),
        'season': $('div.data-row > .season').text(),
        'season_type': $('div.data-row > .season_type').text()
    };
    let dataRes = {};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "shared_link_api_anonymous",
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
                    <td class="text-center">
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
                    <td class="text-center">
                        ${player.res_matches.matches_like > 0 ? player.res_matches.matches_like : '-'}
                    </td>
                    <td class="text-center border-custom-right">
                        ${player.res_matches.matches_captains > 0 ? player.res_matches.matches_captains : '-'}
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
                        ${player.res_trainings.trainings_count > 0 && player.res_trainings.trainings_time > 0 ? player.res_trainings.trainings_time : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_count > 0 && player.res_trainings.trainings_dislike > 0 ? player.res_trainings.trainings_dislike : '-'}
                    </td>
                    <td class="text-center border-custom-right">
                        ${player.res_trainings.trainings_count > 0 && player.res_trainings.trainings_like > 0 ? player.res_trainings.trainings_like : '-'}
                    </td>
                    ${exsFoldersHtml}
                    <td class="text-center border-custom-left">
                        ${player.res_trainings.trainings_count > 0 && withBallPercent > 0 ? withBallPercent : '-'}
                    </td>
                    <td class="text-center">
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


function LoadAnalyticsBlocks() {
    let dataToSend = {
        'get_analytics_blocks': 1,
        'user': $('div.data-row > .user').text(),
        'club': $('div.data-row > .club').text(),
        'team': $('div.data-row > .team').text(),
        'season': $('div.data-row > .season').text(),
        'season_type': $('div.data-row > .season_type').text()
    };
    let dataRes = {};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "shared_link_api_anonymous",
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
                    <td class="text-center border-custom-left">
                        ${count}
                    </td>
                    <td class="text-center">
                        ${duration}
                    </td>
                `;
            });
            tmpHtml += `
                <tr class="analytics-blocks-row" data-id="${key}">
                    <td class="text-center">
                        ${cIndex}
                    </td>
                    <td class="border-custom-right">
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



$(function() {
    $('.page-loader-wrapper').fadeIn();
    $('.header').remove();
    $('.sidebar').remove();
    $('.page-wrapper').removeClass('page-wrapper');
    $('.main-wrapper > div').first().css('min-height', '');
    setTimeout(() => {
        $('jdiv').remove();
        $('.page-loader-wrapper').fadeOut();
        if ($('.analytics-table-container').find('#analytics').length > 0) {
            LoadAnalytics();
        } else if ($('.analytics-table-container').find('#analytics-blocks').length > 0) {
            LoadAnalyticsBlocks();
        }
    }, 500);
});
