
$(window).on('load', function (){
    //Скрыть правый блок
    $('#toggle_btn').click()

    toggle_folders_name()

    var urlsplit = $(location).attr('pathname').split("/");
    var id = urlsplit[urlsplit.length-1];
    if(id==='')
    {
        id = urlsplit[urlsplit.length-2];
    }
    
    $('#back-button').on('click', function () {
        Cookies.set('date', $('input[name="date"]').val(), { expires: 1 })
        Cookies.set('event_id', id, { expires: 1 })
    })
    
    $('#delete-training').on('click', function () {
        let send_data = {}
        swal(gettext("Delete this training?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_event_action('DELETE', send_data, 'delete', id).then(function (data) {
                    window.location.replace("/events/");
                })
            }
        });
    })

    // Добавление упражнения в тренировку
    $('.visual-block').on('click', '.add-exercise', function (){
        let data = {}
        data.group = $(this).closest('.group-row').attr('data-group')
        data.duration = 0
        data.exercise_id = $('.exs-elem.active').attr('data-id')
        console.log(data)
        ajax_training_action('POST', data, 'add exercise', id, 'add_exercise').then(function (data) {
            console.log(data)
            let exercise = data.obj
            if(data.status=="exercise_added"){
                $('.group-exercises-row[data-group="'+exercise.group+'"] .group-block').append(`
                <div class="row border-bottom exercise-row bg-white" data-id="${exercise.id}" data-exercise="${exercise.exercise_id}">
                    <div class="col px-0 text-truncate" title="${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}">${ exercise.exercise_data.folder.short_name }. ${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div>
                    <div class="col-sm-12 col-md-3 px-0">
                        <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 px-1 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                        <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 py-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 40px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                    </div>
                </div>
                `)
                set_count_exercises()
            }
        })
    })
    $('.visual-block').on('click', '.exercise-row', function (){
        let cId = $(this).attr('data-exercise')
        let fromNFB = !$('.exercises-list').find('.folders_nfb_list').hasClass('d-none') ? 1 : 0;
        let folderType = $('.folders_div:not(.d-none)').attr('data-id');
        $('.visual-block .exercise-row').removeClass('selected')
        $(this).addClass('selected')
        LoadExerciseOne(cId, fromNFB, folderType);
    })
    $('.visual-block').on('change', '.exercise-row [name="duration"]', function (){
        let cur_obj = $(this);
        let exercises_training_id = $(this).closest('.exercise-row').attr('data-id')
        let data = {}
        data.duration = $(this).val()
        ajax_training_exercise_action('PUT', data, 'update', exercises_training_id, '').then(function () {
            cur_obj.attr('value', data.duration)
            set_sum_duration_group()
        })


    })
    // Удаление упражнения из тренировки
    $('.visual-block').on('click', '.exercise-row .delete-exercise', function (){
        let exercises_training_id = $(this).closest('.exercise-row').attr('data-id')
        let data = {}
        swal(gettext("Remove an exercise from a training?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_training_exercise_action('DELETE', data, 'delete', exercises_training_id, '').then(function (data) {
                    $('.visual-block .exercise-row[data-id="'+exercises_training_id+'"]').remove()
                    $('.exercise-visual-block[data-id="'+exercises_training_id+'"]').remove()
                    set_count_exercises()
                })
            }
        });
    })

    $('#training-exercises-button').on('click', function () {
        render_exercises_training(id)
    })

    // Добавление игроков в протокол
    $('#add-player-protocol-modal').on('click', '#add-all-players', function (){
        let send_data = {}
        swal(gettext("Add all players from the team of this training session?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_training_action('POST', send_data, 'add all players to the protocol ', id, 'add_all_protocol').then(function (data) {
                    //console.log(data)
                    render_protocol_training(id)
                })
            }
        });
    })

    // Добавление выбранных игроков в протокол
    $('#add-player-protocol-modal').on('click', '#add-selected-players', function (){
        let send_data = []

        $('.players-list .player-add-row').each(function () {
            if($(this).find('.edit-input').is(':checked')){
                send_data.push({
                    player_id: $(this).find('.edit-input').val(),
                    training_id: id,
                    estimation: 0,
                    status: null,

                })
            }
        })
        let items = {'items': JSON.stringify(send_data)}
        console.log(send_data)
        swal(gettext("Add selected players?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_protocol_training('POST', items, 'add selected players to the protocol ').then(function (data) {
                    //console.log(data)
                    render_protocol_training(id)
                })
            }
        });
    })

    // Отметить выполнение упражнения в протоколе
    $('#player-protocol-table').on('click', '.protocol-check-player:not(.disabled)', function () {
        let this_obj = $(this)
        let isCheck = this_obj.closest('.player_row').find('select').is('.red-select')
        console.log(isCheck)
        if(isCheck) return false
        let exercise_training = this_obj.attr('data-exs-id')
        let send_data = {exercise_training : exercise_training}
        let protocol_id = this_obj.closest('.player_row').attr('data-id')
        ajax_protocol_training('POST', send_data, 'check', protocol_id, 'check').then(function (data) {
            let status = data.status
            if(status=='added'){
                this_obj.html('<i class="fa fa-check" aria-hidden="true"></i>')
            } else {
                this_obj.html('')
            }
        })
    })

    // Изменение статуса игрока в протоколе
    $('#player-protocol-table').on('change', 'select[name="status"]', function () {
        let this_obj = $(this)
        let send_data = {"status" : this_obj.val()}
        let protocol_id = this_obj.closest('.player_row').attr('data-id')
        ajax_protocol_training('PUT', send_data, 'change status', protocol_id).then(function (data) {
            console.log(data)
            if(data.training_exercise_check.length == 0 || this_obj.closest('.player_row').find('select').is('.red-select')){
                this_obj.closest('.player_row').find('.protocol-check-player').html('');
            }
        })
    })

    // Изменение оценки игрока в протоколе
    $('#player-protocol-table').on('change', '.estimation-change', function () {
        let this_obj = $(this)
        let cur_estimation = this_obj.is(':checked') ? this_obj.attr('value') : 0

        console.log(cur_estimation)
        this_obj.closest('.player_row').find('.estimation-change[value!="'+cur_estimation+'"]').prop('checked', false)
        let send_data = {"estimation" : cur_estimation}
        let protocol_id = this_obj.closest('.player_row').attr('data-id')
        ajax_protocol_training('PUT', send_data, 'estimation', protocol_id).then(function (data) {
            console.log(data)
        })
    })

    // Удаление всех игроков из протокола
    $('#player-protocol-table').on('click', '#delete-all-protocol-players', function () {
        let send_data = {}
        swal(gettext("Remove all players from the training protocol?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_training_action('DELETE', send_data, 'delete all players', id, 'delete_all_protocol').then(function (data) {
                    console.log(data)
                    $('.player_row').remove()
                })
            }
        });
    })

    // Удаление игрока из протокола
    $('#player-protocol-table').on('click', '.delete-player-button', function () {
        let this_obj = $(this)
        let send_data = {}
        let protocol_id = this_obj.closest('.player_row').attr('data-id')
        $('.player_row[data-id="'+protocol_id+'"]').addClass('bg-light')
        swal(gettext('Remove a player "'+$('.player_row[data-id="'+protocol_id+'"]').find('.player-name').text()+'" from the training protocol?'), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_protocol_training('DELETE', send_data, 'delete player', protocol_id).then(function (data) {
                    console.log(data)
                    $('.player_row[data-id="'+protocol_id+'"]').remove()
                })
            } else {
                $('.player_row[data-id="'+protocol_id+'"]').removeClass('bg-light')
            }
        });

    })

    $('#save-training').on('click', function () {
        let date = $('#training-main-data input[name="date"]').val()
        let time = $('#training-main-data input[name="time"]').val()
        let data = {
            'date': date+' '+time
        }
        ajax_event_action('PUT', data, 'save', id).then(function (data) {
            render_protocol_training(id, true)
        })

        let training_data = {}
        if($('#block-training-info input[name="objectives_1"]').length>0 && $('#block-training-info input[name="objectives_2"]').length>0 && $('#block-training-info input[name="objectives_3"]').length>0){
            let text1 = $('#block-training-info input[name="objectives_1"]').val();
            training_data['notes'] = '[ "'+text1+'" ]'
        }
        let additionals = {}
        for (let i = 0; i < 6; i++) {
            let name = $('#training-additional-data input[name="name_'+i+'"]')
            let note = $('#training-additional-data input[name="note_'+i+'"]')

            name.closest('.training-additional').toggleClass('edit-button d-none', !name.val() && !note.val())

            additionals[i] = {
                'name': name.val(),
                'note' : note.val()
            }
        }
        training_data['additional'] = JSON.stringify(additionals)
        training_data['field_size'] = $('#training-main-data input[name="field_size"]').val()
        training_data['load_type'] = $('#training-main-data input[name="load_type"]').val()
        training_data['goal'] = $('#block-training-info input[name="goal"]').val()
        training_data['objective_1'] = $('#training-objectives-data input[name="objective_1"]').val()
        training_data['objective_2'] = $('#training-objectives-data input[name="objective_2"]').val()
        training_data['video_href'] = $('#training-video-modal input[name="video_href"]').val()
        console.log(training_data)

        ajax_training_action('PUT', training_data, 'save', id).then(function (data) {

        })
    })

    // Save last chosen exercise's id
    let lastChosenExsId = -1;
    $('.exercises-block').on('click', '.exs-elem', (e) => {
        let isActive = !$(e.currentTarget).hasClass('active');
        if (isActive) {
            try {
                lastChosenExsId = parseInt($(e.currentTarget).attr('data-id'));
            } catch(e) {}
        }
    });
    $('.visual-block').on('click', '.exercise-row', (e) => {
        let isActive = $(e.currentTarget).hasClass('selected');
        if (isActive) {
            try {
                lastChosenExsId = parseInt($(e.currentTarget).attr('data-exercise'));
            } catch(e) {}
        }
    });

    // Open graphics in modal
    $('#carouselAll').on('click', '.carousel-item', (e) => {
        let id = -1;
        try {
            id = parseInt($('.exercises-block').find('.exs-elem.active').attr('data-id'));
        } catch (e) {}
        let activeNum = 1;
        activeNum += $('#carouselAll').find('.carousel-item').index($(e.currentTarget));
        LoadGraphicsModal(lastChosenExsId, "team_folders", activeNum);
    });
    $('#card-scheme-block').on('click', '.carousel-item', (e) => {
        let id = -1;
        try {
            id = parseInt($(e.currentTarget).parent().parent().parent().attr('data-exs-id'));
        } catch (e) {}
        let activeNum = 1;
        LoadGraphicsModal(id, "team_folders", activeNum);
    });
    
    //Проставить все упражнения у группы
    $('#player-protocol-table').on('click', '.all-player-check', function () {
        let group_name = $(this).attr('data-group')
        console.log($(this).is(':checked'))
        if($(this).is(':checked')){
            $('.select-all-group[data-group="'+group_name+'"]:not(:checked)').click()
            $('.select-all-exercise[data-group="'+group_name+'"]').prop('checked', true)
        } else {
            $('.select-all-group[data-group="'+group_name+'"]:checked').click()
            $('.select-all-exercise[data-group="'+group_name+'"]').prop('checked', false)
        }
    })
    $('#player-protocol-table').on('click', '.select-all-group', function () {
        let group_name = $(this).attr('data-group')
        if($(this).is(':checked')){
            $(this).closest('.player_row').find('.protocol-check-player[name="'+group_name+'"]:empty').click()
        } else {
            $(this).closest('.player_row').find('.protocol-check-player[name="'+group_name+'"] :is(.fa-check)').click()
        }
    })
    $('#player-protocol-table').on('click', '.select-all-exercise', function () {
        let exs_tr_id = $(this).attr('data-exs')
        console.log(exs_tr_id)
        if($(this).is(':checked')){
            $('#player-protocol-table').find('.protocol-check-player[data-exs-id="'+exs_tr_id+'"]:empty').click()
        } else {
            $('#player-protocol-table').find('.protocol-check-player[data-exs-id="'+exs_tr_id+'"] :is(.fa-check)').click()
        }
    })

    $('a[href="#training-exercises"]').on('show.bs.tab', function () {
        CountExsInFolder(false);
    })

    $('#player-protocol-table').on('update-select change', 'select[name="status"]', function () {
        console.log("TEST")
        if($(this).find('.red-select').is(':selected')){
            console.log("SELECT")
            $(this).addClass('red-select')
            $(this).removeClass('black-select')
        } else {
            $(this).removeClass('red-select')
            $(this).addClass('black-select')
        }
    })

    // Выгрузка команд при открытии окна добавления игрока
    $('#add-player-protocol-modal').on('show.bs.modal', function () {
        let send_data = {}
        ajax_team_action('GET', send_data, 'get teams', '').then(function (data) {
            let select = ''
            let options = data.results;
            console.log(options)
            let option_html = ''
            option_html+=`
                    <option value="" class="">${gettext('Not selected')}</option>
                `
            $.each( options, function( key, option ) {
                option_html+=`
                    <option value="${ option.id }" class="">${ option.name ? option.name : '---' }</option>
                `
            })
            select = `
                <select id="team-players-load" class="select custom-select p-0 edit-input text-center" name="status" tabindex="-1" aria-hidden="true" ${!edit_mode ? 'disabled' : ''} style="height: 30px;">
                    ${ option_html }
                </select>
            `

            $('#add-player-protocol-modal .modal-body .team-select').html(select)
        })
    })

    // Выгрузка игроков из команды при выборе в селекторе
    $('#add-player-protocol-modal').on('change', '#team-players-load', function () {
        let send_data = {}
        let team_id = $(this).val()
        ajax_team_action('GET', send_data, 'get players on the team', team_id, 'get_team_players').then(function (data) {
            console.log(data)
            let players = data.objs
            let players_html = ''
            $.each( players, function( key, player ) {
                players_html += `
                    <div class="col-12 border player-add-row">
                        <input id="player_${player.id}" type="checkbox" class="edit-input" name="id[]" value="${player.id}" style="" ${!edit_mode ? 'disabled' : ''}>
                        <label class="form-check-label" for="player_${player.id}">${player.full_name}</label>
                    </div>`
            })
            $('#add-player-protocol-modal .modal-body .players-list').html(players_html)
        })

    })

    // sizes of columns in exercises list:
    setTimeout(() => {
        $('#toggleFoldersNames').attr('data-state', '1');
        ResizeSplitCols();
    }, 500);


    generate_exercises_module_data()
    show_training_card(id)
    render_exercises_training(id)
    render_protocol_training(id)
    resize_trainings_block()
})

function resize_trainings_block(){
    let css = "calc(94vh - "+Math.round($('.header').height())+"px - "+Math.round($('.card-header').height())+"px)"
    //console.log(css)
    $('#training-content .training-data').css({"max-height": css})
    $('#training-content .training-data').css({"height": css})
    $('#block-training-info').css({"max-height": css})
    $('#block-training-info').css({"height": css})
}

function toggle_folders_name(){
        let state = false;
        $('.folders-block').find('.folder-elem').each((ind, elem) => {
            let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
            $(elem).find('.folder-title').text(tmpText);
        });
        $('.folders-block').find('.folder-nfb-elem').each((ind, elem) => {
            let tmpText = !state ? `${$(elem).attr('data-short')}. ${$(elem).attr('data-name')}` : `${$(elem).attr('data-short')}`;
            $(elem).find('.folder-title').text(tmpText);
        });
}

// Выгрузка игроков из тренировки
function render_protocol_training(training_id = null, highlight_not_filled = false) {
    let send_data = {}

    ajax_training_action('GET', send_data, 'load', training_id, 'get_exercises').then(function (data) {
        console.log(data)
        let exercises = data.objs

        let protocol_header =``
        let protocol_header2 =``
        let exs_group = [{ids: []},{ids: []},{ids: []},{ids: []}];

        protocol_header2 += `
        <tr>
            <th colspan="3"></th>
            <th class="p-0 text-center align-middle border"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i></th>
            <th class="p-0 text-center align-middle border"><i class="fa fa-thumbs-o-up" aria-hidden="true"></i></th>
            <th class="p-0 text-center align-middle border">#</th>
            <th>${gettext('Full name')}</th>
        `
        $.each( exercises, function( key, exercise ) {
            exs_group[exercise.group-1].ids.push(exercise);
        })
        console.log(exs_group)

        protocol_header += `
        <tr>
            <th colspan="2" class="p-0 text-center align-middle border">
                <button title="" class="btn btn-block btn-outline-success btn-sm edit-input" data-toggle="modal" data-target="#add-player-protocol-modal" ${!edit_mode ? 'disabled' : ''}><i class="fa fa-plus" aria-hidden="true"></i></button>
            </th>
            <th class="p-0 text-center align-middle border">
                <button title="${gettext('Remove all players')}" id="delete-all-protocol-players" class="btn btn-block btn-outline-danger btn-sm edit-input" ${!edit_mode ? 'disabled' : ''}>${gettext('Remove all players')}</button>
            </th>
            <th colspan="4" class="p-0 text-center align-middle border">
            </th>
        `
        console.log(exs_group)
        for (let i = 0; i < exs_group.length; i++) {
            if(exs_group[i].ids.length == 0) continue
            let group = i == 0 ? 'A' : i == 1 ? 'B' : i == 2 ? 'C' : 'D'
            protocol_header += `<th colspan="${exs_group[i].ids.length+1}" class="p-0 text-center align-middle border">${gettext('Group')+' '+group+' '+gettext('(Exercises)')}</th>`

            for (let j = 0; j < exs_group[i].ids.length; j++) {
                if(j == 0){
                    protocol_header2 += `
                    <th class="p-0 text-center align-middle border" width="40">
                        <input type="checkbox" class="all-player-check edit-input" data-group="group_${i+1}" style="width: 25px; height: 25px;" ${!edit_mode ? 'disabled' : ''}>
                    </th>
                    `
                }
                protocol_header2 += `<th title="${(get_cur_lang() in exs_group[i].ids[j].exercise_name) ? exs_group[i].ids[j].exercise_name[get_cur_lang()] : Object.values(exs_group[i].ids[j].exercise_name)[0]}" class="p-0 text-center align-middle border">
                    <input type="checkbox" class="select-all-exercise edit-input" data-group="group_${i+1}" data-exs="${exs_group[i].ids[j].id}" style="width: 25px; height: 25px;" ${!edit_mode ? 'disabled' : ''}
                </th>`
            }

        }
        protocol_header += `</tr>`
        protocol_header2 += `</tr>`

        $('#player-protocol-table').html(protocol_header).append(protocol_header2)

        ajax_training_action('GET', send_data, 'load protocol ', training_id, 'get_protocol').then(function (data_players) {
            let players = data_players.objs
            console.log(players)
            let select = ''
            ajax_protocol_status('GET').then(function (data_status) {
                //console.log(data_status)
                let options = data_status.results;
                let option_html = ''
                option_html+=`
                        <option value="" class="black-select">${gettext('Training')}</option>
                    `
                $.each( options, function( key, option ) {
                    if(!'trainings' in option.tags) return
                    if(option.tags['trainings'] != 1) return
                    option_html+=`
                        <option value="${ option.id }" class="${'trainings_red' in option.tags && option.tags['trainings_red'] ? 'red-select' : 'black-select'}">${ (get_cur_lang() in option.translation_names) ? option.translation_names[get_cur_lang()] : Object.values(exercise.exercise_name)[0] }</option>
                    `
                })
                select = `
                    <select class="select custom-select p-0 edit-input text-center" name="status" tabindex="-1" aria-hidden="true" ${!edit_mode ? 'disabled' : ''} style="height: 30px;">
                        ${ option_html }
                    </select>
                `
                let player_line = false
                let isEmptyPlayer = false
                $.each( players, function( key, player ) {
                    let line_css
                    console.log(player.status_info)
                    if(!player_line && (player.status_info != null && 'trainings_red' in player.status_info.tags && player.status_info.tags.trainings_red != 0)) {
                        player_line = true
                        line_css = 'border-top: solid 2px red'
                    }
                    let player_row = ``
                    player_row += `
                    <tr class="player_row" data-training="${player.training_id}" data-id="${player.id}" style="${line_css != '' ? line_css : ''}">
                        <td width="10" class="p-0 text-center align-middle">
                            ${key+1}
                        </td>
                        <td width="20" class="p-0 text-right align-middle">
                            <button type="button" title="${gettext('Delete player')}" class="btn btn-sm btn-danger delete-player-button py-0 w-100 edit-input" style="height: 30px;" ${!edit_mode ? 'disabled' : ''}>X</button>
                        </td>
                        <td width="150" class="p-0 align-middle">
                            ${select}
                        </td>
                        <td width="30" class="p-0 text-center align-middle"><input type="checkbox" class="estimation-change edit-input" name="estimation" value="1" style="width: 25px; height: 25px;" ${!edit_mode ? 'disabled' : ''} ${player.estimation == 1 ? 'checked' : ''}></td>
                        <td width="30" class="p-0 text-center align-middle"><input type="checkbox" class="estimation-change edit-input" name="estimation" value="2" style="width: 25px; height: 25px;" ${!edit_mode ? 'disabled' : ''} ${player.estimation == 2 ? 'checked' : ''}></td>
                        <td width="40" class="p-0 text-center align-middle">${player.position != null && player.position != undefined ? player.position : '---'}</td>
                        <td width="200" class="align-middle">
                            <span class="float-left player-name" title="${player.full_name}">${player.full_name}</span><span class="float-right">${player.is_goalkeeper ? '(G.)' : ''}</span>
                        </td>
                    `
                    for (let i = 0; i < exs_group.length; i++) {
                        if(exs_group[i].ids.length == 0) continue
                        for (let j = 0; j < exs_group[i].ids.length; j++) {
                            if(j == 0){
                                player_row += `
                                <td class="p-0 text-center align-middle" width="40"><input type="checkbox" class="select-all-group edit-input" data-group="group_${i+1}" style="width: 25px; height: 25px;" ${!edit_mode ? 'disabled' : ''}></td>
                                `
                            }
                            player_row += `<td name="group_${i+1}" data-num="${j}" data-exs-id="${exs_group[i].ids[j].id}" width="40" class="p-0 text-center align-middle protocol-check-player edit-custom-input ${!edit_mode ? 'disabled' : ''}">${$.inArray(exs_group[i].ids[j].id, player.training_exercise_check) != -1 ? '<i class="fa fa-check" aria-hidden="true"></i>' : ''}</td>`
                        }

                    }
                    player_row += `</tr>`
                    $('#player-protocol-table').append(player_row)
                    $('#player-protocol-table .player_row[data-id="'+player.id+'"] select[name="status"]').val(player.status).trigger( "update-select", [ "Custom", "Event" ] )
                    for (let i = 0; i < exs_group.length; i++) {
                        console.log(exs_group)
                        let all_select_check = $('#player-protocol-table .all-player-check[data-group="group_'+(i+1)+'"]')
                        for (let j = 0; j < exs_group[i].ids.length; j++){
                            let exs_select_check = $('#player-protocol-table .select-all-exercise[data-exs="'+(exs_group[i].ids[j].id)+'"]')
                            exs_select_check.prop('checked', true)
                            $('#player-protocol-table .player_row').each(function () {
                                if(!$(this).find('select[name="status"]').hasClass('red-select') && $(this).find('[name="group_'+(i+1)+'"][data-exs-id="'+(exs_group[i].ids[j].id)+'"]').is(':empty')){
                                    exs_select_check.prop('checked', false)
                                }
                            })
                        }

                        let is_all_select = true;
                        $('#player-protocol-table .player_row').each(function () {
                            let select_check = $(this).find('.select-all-group[data-group="group_'+(i+1)+'"]')
                            select_check.prop('checked', true)
                            all_select_check.prop('checked', true)
                            if($(this).find('[name="group_'+(i+1)+'"]').is(':empty')){
                                select_check.prop('checked', false)
                            }

                            if(highlight_not_filled && $(this).find('.fa-check').length == 0 && $(this).find('select[name="status"]').val() == ''){
                                $(this).find('.player-name').addClass('text-danger')
                                isEmptyPlayer = true
                            }
                            if(!$(this).find('select[name="status"]').hasClass('red-select') && $(this).find('[name="group_'+(i+1)+'"]').is(':empty')){
                                is_all_select = false
                            }
                        })
                        all_select_check.prop('checked', is_all_select)
                    }

                })
                if(isEmptyPlayer) {
                    swal(gettext('Save training'), gettext('There are unfilled players! Fill in the players highlighted in red.'), "warning");
                }
            })
        })
    })

}

// Выгрузить упражнения из тренировки
function render_exercises_training(training_id = null, group = null) {
    let send_data = {}
    if(group != null) send_data.group = group

    ajax_training_action('GET', send_data, 'load', training_id, 'get_exercises').then(function (data) {
        let exercises = data.objs

        let exs_html = ['', '']
        console.log(exercises)

        $.each( exercises, function( key, exercise ) {
            exs_html[exercise.group-1] += `
            <div id="order-${exercise.id}" class="row border-bottom exercise-row bg-white" data-id="${exercise.id}" data-exercise="${exercise.exercise_id}">
                <div class="col px-0 text-truncate" title="${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}">${ exercise.exercise_data.folder.short_name }. ${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div>
                <div class="col-sm-12 col-md-3 px-0">
                    <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 px-1 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 p-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 40px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                </div>
            </div>`
        });
        //$('.visual-block .add-exercise').attr('data-group', send_data.group)
        for (let key in exs_html) {
            $('.visual-block .group-exercises-row[data-group="'+(parseInt(key)+1)+'"] .group-block').html(exs_html[key]).sortable({
                disabled: !edit_mode,
                placeholder: "ui-state-highlight",
                scroll: false,
                stop: function( event, ui ) {
                    let ids = $(this).sortable( "serialize", { key: 'order[]' } );
                    ids = $(this).sortable( "toArray", {attribute:'data-id'});

                    let send_orders = {}
                    send_orders.exercise_ids = ids;
                    //console.log(send_orders)
                    ajax_training_exercise_action('PUT', send_orders, 'sort exercises', '', 'sort_exercise').then(function (data) {

                    })
                }
            });
        }

        set_count_exercises()
    })
}

// Выгрузить дополнительных данных из упрежнения в тренировке
function render_exercises_additional_data(training_exercise_id = null) {
    let send_data = {}
    ajax_training_exercise_action('GET', send_data, 'load data', training_exercise_id, 'get_data').then(function (data) {
        var select = ''
        ajax_exercise_additional('GET').then(function (data_additional) {
            let options = data_additional.results;
            let option_html = ''
            $.each( options, function( key, option ) {
                option_html+=`
                    <option value="${ option.id }">${ (get_cur_lang() in option.translation_names) ? option.translation_names[get_cur_lang()] : Object.values(exercise.exercise_name)[0] }</option>
                `
            })
            select = `
                <select class="select custom-select p-0 edit-input text-center" name="additional_id" tabindex="-1" aria-hidden="true" ${!edit_mode ? 'disabled' : ''} style="height: 25px; color: black !important;">
                    ${ option_html }
                </select>
            `
            let block = $('#card-scheme-block .exercise-visual-block[data-id="'+training_exercise_id+'"]')
            block.find('.additional-data-block').html('')
            let additional_html = ''
            $.each( data.objs, function( key, additional ) {
                additional_html = `
                <div class="row exercise-additional-row" data-id="${additional.id}">
                    <div class="col pr-0">
                        ${select}
                    </div>
                    <div class="col pl-0">
                        <input type="text" name="note" class="form-control form-control-sm w-100 p-0 h-auto text-center rounded edit-input" value="${additional.note ? additional.note:''}" ${!edit_mode ? 'disabled' : ''}>
                    </div>
                    <div class="col-sm-12 col-md-1 pl-0 edit-button ${!edit_mode ? 'd-none' : ''}">
                        <button type="button" class="btn btn-sm btn-block btn-danger rounded-0 p-0 h-100 float-right edit-input delete-exercise-additional" ${!edit_mode ? 'disabled' : ''}><i class="fa fa-trash" aria-hidden="true"></i></button>
                    </div>
                </div>
                `
                block.find('.additional-data-block').append(additional_html)
                block.find('.exercise-additional-row[data-id="'+additional.id+'"] select').val(additional.additional_id)

            })
        })
    })
}

// Подсчет кол-ва добавленных упражнений по группам
function set_count_exercises(arr_count_group = null) {
    let group = $('.add-exercise').closest('.group-row').attr('data-group')
    $('.group-row').each(function( index ) {
        let group = $(this).attr('data-group')
        $('.group-row[data-group="' + group + '"] .group-count').text($('.group-exercises-row[data-group="' + group + '"] .exercise-row').length)
    })
    set_sum_duration_group()
}

// Подсчет суммы минут добавленных упражнений по группам
function set_sum_duration_group() {
    $('.group-row').each(function( index ) {
        let group = $(this).attr('data-group')
        $('.group-exercises-row[data-group="' + group + '"] .group-block').each(function (index) {
            let sum = 0
            $(this).find('.exercise-row').each(function (index) {
                sum += parseInt($(this).find('input[name="duration"]').val())
            })
            //console.log(sum)
            $('.group-row[data-group="' + group + '"] .sum-duration-group').text(sum)
        })
    })

}

// Добавление дополнительных данных в модуль списка упражнений
function generate_exercises_module_data() {
    let html_data = ``

    html_data += `
    <div class="row group-row mx-0 border border-dark bg-default-light font-weight-bold" data-group="1">
        <div class="col-1 px-0 edit-button d-none">
            <button class="btn btn-sm btn-block btn-warning font-weight-bold py-0 h-100 add-exercise"><i class="fa fa-plus" aria-hidden="true"></i></button>
        </div>
        <div class="col-1">
            <span class="font-weight-bold group-count"></span>
        </div>
        <div class="col">
            <span class="font-weight-bold group-button">${ gettext("Group A") }</span>
        </div>
        <div class="col px-0">
            <span class="sum-duration-group btn btn-sm float-right rounded-0 py-0 h-100 font-weight-bold" style="width: 50px">00</span>
        </div>
    </div>
    <div class="row group-exercises-row mx-0" data-group="1">
        <div class="col">
            <div class="group-block sortable-edit" id="group_A" aria-labelledby="group_A-tab">...2</div>
        </div>
    </div>
    
    `

    html_data += `
    <div class="row group-row mx-0 border border-dark bg-default-light font-weight-bold" data-group="2">
        <div class="col-1 px-0 edit-button d-none">
            <button class="btn btn-sm btn-block btn-warning font-weight-bold py-0 h-100 add-exercise"><i class="fa fa-plus" aria-hidden="true"></i></button>
        </div>
        <div class="col-1">
            <span class="font-weight-bold group-count"></span>
        </div>
        <div class="col">
            <span class="font-weight-bold group-button">${ gettext("Group B") }</span>
        </div>
        <div class="col px-0">
            <span class="sum-duration-group btn btn-sm float-right rounded-0 py-0 h-100 font-weight-bold" style="width: 50px">00</span>
        </div>
    </div>
    <div class="row group-exercises-row mx-0" data-group="2">
        <div class="col">
            <div class="group-block sortable-edit" id="group_B" aria-labelledby="group_B-tab">...2</div>
        </div>
    </div>
    
    `

    $('.visual-block').append(html_data)
}
