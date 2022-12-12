let season_type = null;
let parents_table
let parents_table_options = {
    language: {
        url: '//cdn.datatables.net/plug-ins/1.12.1/i18n/'+get_cur_lang()+'.json'
    },
    dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
    "<'row'<'col-sm-12'tr>>" +
    "<'row'<'col-sm-12 col-md-5'><'col-sm-12 col-md-7'p>>",
    scrollY: "77vh",
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
        {"className": "dt-vertical-center", "targets": "_all"}
    ]
};

function LoadParentsData() {
    let dataToSend = {'get_analytics_all': 1, 'season_type': season_type};
    let dataRes = {};
    $('.page-loader-wrapper').fadeIn();
    $.ajax({
        headers:{"X-CSRFToken": csrftoken},
        data: dataToSend,
        type: 'GET', // GET или POST
        dataType: 'json',
        url: "/analytics/analytics_api",
        success: function (res) {
            if (res.success) {
                dataRes = res.data;
            }
        },
        error: function (res) {
            console.log(res);
        },
        complete: function (res) {
            RenderParentsTable(dataRes);
            $('.page-loader-wrapper').fadeOut();
        }
    });
}

function RenderParentsTable(data) {
    try {
        parents_table.destroy();
    } catch(e) {}
    $('#parents').find('tbody').html('');
    if (data['players'] && typeof data['players'] === "object" && !Array.isArray(data['players'])) {
        let tmpHtml = "";
        let cIndex = 1;
        for (let key in data['players']) {
            let player = data['players'][key];
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
                <tr class="parents-row" data-id="${key}">
                    <td class="text-center">
                        ${player.name}
                    </td>
                    <td class="text-center">-</td>

                    <td class="text-center border-custom-left">
                        ${player.res_protocols.diseases_count > 0 ? player.res_protocols.diseases_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_protocols.injuries_count > 0 ? player.res_protocols.injuries_count : '-'}
                    </td>
                    <td class="text-center">
                        ${player.res_protocols.skip_count > 0 ? player.res_protocols.skip_count : '-'}
                    </td>
                    <td class="text-center border-custom-right">
                        ${player.res_protocols.a_u_count > 0 ? player.res_protocols.a_u_count : '-'}
                    </td>

                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                    <td class="text-center">-</td>
                </tr>
            `;
            cIndex ++;
        }
        $('#parents').find('tbody').html(tmpHtml);
    }
    parents_table = $('#parents').DataTable(parents_table_options);
    parents_table.draw();
}



$(function() {

    LoadParentsData();

});
