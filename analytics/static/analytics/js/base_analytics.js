let season_type = null;
let analytics_table

let analytics_table_options = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollY: "72vh",
    scrollCollapse: true,
    serverSide: false,
    processing: false,
    paging: false,
    searching: false,
    select: false,
    drawCallback: function( settings ) {
    },
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
        for (let key in data['players']) {
            let player = data['players'][key];
            let exsFoldersHtml = "";
            foldersInHeader.forEach(elem => {
                let tVal = 0;
                try {
                    tVal = player.res_trainings.trainings_exs_folders[elem];
                } catch(e) {}
                exsFoldersHtml += `
                    <td class="text-center">
                        ${tVal > 0 ? tVal : '-'}
                    </td>
                `;
            });
            tmpHtml += `
                <tr class="analytics-row" data-id="${key}">
                    <td class="">
                        ${player.name}
                    </td>
                    <td class="text-center">
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
                    <td class="text-center">
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
                        ${player.res_matches.matches_estimation > 0 ? player.res_matches.matches_estimation : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_dislike > 0 ? player.res_matches.matches_dislike : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_like > 0 ? player.res_matches.matches_like : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_goals > 0 ? player.res_matches.matches_goals : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_penalty > 0 ? player.res_matches.matches_penalty : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_matches.matches_pass > 0 ? player.res_matches.matches_pass : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_count > 0 ? player.res_trainings.trainings_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_time > 0 ? player.res_trainings.trainings_time : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_dislike > 0 ? player.res_trainings.trainings_dislike : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_like > 0 ? player.res_trainings.trainings_like : '-'}
                    </td>
                    ${exsFoldersHtml}
                    <td class="text-center">
                        ${player.res_trainings.trainings_with_ball > 0 ? player.res_trainings.trainings_with_ball : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_trainings.trainings_no_ball > 0 ? player.res_trainings.trainings_no_ball : '-'}
                    </td>
                </tr>
            `;
        }
        $('#analytics').find('tbody').html(tmpHtml);
    }
    analytics_table = $('#analytics').DataTable(analytics_table_options);
    analytics_table.draw();
}



$(function() {

    LoadAnalytics();

    $('.analytics-table-container').on('click', '.season-toggle', (e) => {
        if (!$(e.currentTarget).hasClass('active')) {
            $('.analytics-table-container').find('.season-toggle').removeClass('active');
            $(e.currentTarget).addClass('active');
            season_type = $(e.currentTarget).attr('type');
            LoadAnalytics();
        }
    });

    // Toggle left menu
    setTimeout(() => {
        $('#toggle_btn').click();
    }, 500);
});
