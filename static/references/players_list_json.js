$(window).on('load', function () {
    $('#players-list-modal').on('show.bs.modal', function () {
        let players_block = $(this).find('#players-list');
        let selected_team = $('#select-team').val()
        ajax_team_action('GET', {}, 'get players', selected_team).then(function (data) {
            let players_json = data.players_json
            let html = ''
            console.log(players_json)
            if (players_json != null){
                for (const player of players_json) {
                    html += `
                        <div class="row mt-1 player-row">
                            <div class="col-10 px-1">
                                <input type="text" class="form-control form-control-sm border-primary py-0 player-name-input" value="${player.name}" style="height: 23px !important;">
                            </div>
                            <div class="col-2 px-1">
                                <button type="button" class="btn btn-block btn-primary btn-sm py-0 delete-this-player">-</button>
                            </div>
                        </div>
                    `
                }
            }
            $('#players-list-modal').find('#players-list').html(html)
        })
    })
    $('#players-list-modal').on('click', '.add-new-player', function () {

        let html = `
            <div class="row mt-1 player-row">
                <div class="col-10 px-1">
                    <input type="text" class="form-control form-control-sm border-primary py-0 player-name-input" style="height: 23px !important;">
                </div>
                <div class="col-2 px-1">
                    <button type="button" class="btn btn-block btn-primary btn-sm py-0 delete-this-player">-</button>
                </div>
            </div>
        `

        $('#players-list-modal').find('#players-list').append(html)
    })

    $('#players-list-modal').on('click', '.delete-this-player', function () {
        $(this).closest('.player-row').remove()
    })

    $('#players-list-modal').on('click', '.save-players-list', function () {
        let selected_team = $('#select-team').val()
        let send_data = {}
        let players_list = []
        $('#players-list-modal .player-row').each(function () {
            let player_name = $(this).find('.player-name-input').val()
            players_list.push({'name': player_name})
        })
        console.log(players_list);
        send_data = {players_json: JSON.stringify(players_list)}
        ajax_team_action('PUT', send_data, 'set players', selected_team).then(function (data) {
            let players_json = data.players_json
            console.log(players_json)
        })
    })
})

function players_list_to_html(players_list = []) {
    let players_html = ''
    if(players_list != null && players_list.length > 0){
        for (const player of players_list) {
            players_html += `
                <div class="col-6">
                    <div class="row mt-1 player-row">
                        <div class="col-10 px-1">
                            <input type="text" class="form-control form-control-sm border-primary rounded-0 py-0 player-name-input" value="${player.name}" style="height: 23px !important;">
                        </div>
            `
            // for (let i = 0; i < 6; i++) {
            //     players_html += `
            //         <div class="col-1 px-0">
            //             <input type="color" class="form-control form-control-sm border-primary rounded-0 p-0 player-group-input" value="${'group' in player && player.group.length > i ? player.group[i] : ''}" style="height: 23px !important;">
            //         </div>
            //     `
            // }
            players_html += `
                        <div class="col-2 px-1">
                            <input type="checkbox" class="form-control form-control-sm border-primary rounded-0 p-0 player-check-input" ${player.check ? 'checked' : ''} style="height: 23px !important;">
                        </div>
                    </div>
                </div>
            `
        }
        return players_html
    }
}