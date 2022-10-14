
$(window).on('load', function (){
    //Скрыть правый блок
    $('#toggle_btn').click()
    //
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
        data.group = $(this).attr('data-group')
        data.duration = 0
        data.exercise_id = $('.exs-elem.active').attr('data-id')
        ajax_training_action('POST', data, 'add exercise', id, 'add_exercise').then(function (data) {
            //console.log(data)
            let exercise = data.obj
            if(data.status=="exercise_added"){
                $('.group-block[data-group="'+exercise.group+'"]').append(`
                <div class="row border-bottom exercise-row" data-id="${exercise.id}">
                    <div class="col pr-0">${exercise.exercise_name[get_cur_lang()]}</div>
                    <div class="col-sm-12 col-md-3 pl-0">
                        <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                        <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 py-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 30px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                    </div>
                </div>
                `)
                set_count_exercises()
            }
        })
    })
    $('.visual-block').on('change', '.exercise-row [name="duration"]', function (){
        let exercises_training_id = $(this).closest('.exercise-row').attr('data-id')
        let data = {}
        data.duration = $(this).val()
        ajax_training_exercise_action('PUT', data, 'update', exercises_training_id, '')
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
                ajax_training_exercise_action('DELETE', data, 'delete', exercises_training_id, '').done(function (data) {
                    $('.visual-block .exercise-row[data-id="'+exercises_training_id+'"]').remove()
                    $('.exercise-visual-block[data-id="'+exercises_training_id+'"]').remove()
                    set_count_exercises()
                })
            }
        });
    })

    //Выгрузка упражнений в группу при клике по кнопке
    $('.card-body').on('click', '.group-button', function () {
        render_exercises_training(id, $(this).attr('data-group'))
    })

    // Добавление дополнительных данных в тренировку
    $('#training-card').on('click', '.add-exercise-additional', function (){
        let cur_block = $(this).closest('.exercise-visual-block')
        let training_exercise_id = cur_block.attr('data-id')

        let send_data = {}
        send_data.additional_id = 0
        send_data.note = ''

        ajax_training_exercise_action('POST', send_data, 'load data', training_exercise_id, 'add_data').done(function (data) {
            //console.log(data)
            render_exercises_additional_data(training_exercise_id)
        })
    })

    // Редактирование дополнительных данных в упражнении
    $('#training-card').on('change', '.additional-data-block .edit-input', function (){
        let cur_row = $(this).closest('.exercise-additional-row')
        let exercise_additional_id = cur_row.attr('data-id')

        let send_data = {}
        send_data.additional_id = cur_row.find('[name="additional_id"]').val()
        send_data.note = cur_row.find('[name="note"]').val()

        ajax_training_exercise_data_action('PUT', send_data, 'update data', exercise_additional_id).done(function (data) {
            console.log(data)
            //render_exercises_additional_data(training_exercise_id)
        })
    })

    // Удаление дополнительных данных в упражнении
    $('#training-card').on('click', '.additional-data-block .delete-exercise-additional', function (){
        let cur_row = $(this).closest('.exercise-additional-row')
        let exercise_additional_id = cur_row.attr('data-id')

        let send_data = {}
        swal(gettext("Remove an additional data from an exercise?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_training_exercise_data_action('DELETE', send_data, 'delete data', exercise_additional_id).done(function (data) {
                    //console.log(data)
                    cur_row.remove();
                })
            }
        });
    })

    // Добавление игроков в протокол
    $('#add-player-protocol-modal').on('click', '.add-all-players', function (){
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

    // Отметить выполнение упражнения в протоколе
    $('#player-protocol-table').on('click', '.protocol-check-player:not(.disabled)', function () {
        let this_obj = $(this)
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
        })
    })

    // Изменение оценки игрока в протоколе
    $('#player-protocol-table').on('click', '.estimation-change', function () {
        let this_obj = $(this)
        let cur_estimation = this_obj.attr('value')
        if(cur_estimation == 1 && this_obj.children('i').hasClass('fa-thumbs-down') ||
            cur_estimation == 2 && this_obj.children('i').hasClass('fa-thumbs-up'))
            cur_estimation = 0
        let send_data = {"estimation" : cur_estimation}
        let protocol_id = this_obj.closest('.player_row').attr('data-id')
        ajax_protocol_training('PUT', send_data, 'estimation', protocol_id).then(function (data) {
            console.log(data)
            $('.player_row[data-id="'+protocol_id+'"] .estimation-change[value="'+1+'"] i')
                .removeClass('fa-thumbs-down').addClass('fa-thumbs-o-down')
            $('.player_row[data-id="'+protocol_id+'"] .estimation-change[value="'+2+'"] i')
                .removeClass('fa-thumbs-up').addClass('fa-thumbs-o-up')

            if(data.estimation == 1) {
                $('.player_row[data-id="' + protocol_id + '"] .estimation-change[value="' + data.estimation + '"] i')
                    .removeClass('fa-thumbs-o-down').addClass('fa-thumbs-down')
            }else if(data.estimation == 2) {
                $('.player_row[data-id="' + protocol_id + '"] .estimation-change[value="' + data.estimation + '"] i')
                    .removeClass('fa-thumbs-o-up').addClass('fa-thumbs-up')
            }
        })
    })

    // Удаление игрока из протокола
    $('#player-protocol-table').on('click', '.delete-player-button', function () {
        let this_obj = $(this)
        let send_data = {}
        let protocol_id = this_obj.closest('.player_row').attr('data-id')
        swal(gettext("Remove a player from the training protocol?"), {
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
            }
        });

    })

    $('#save-training').on('click', function () {
        let date = $('#block-training-info input[name="date"]').val()
        let time = $('#block-training-info input[name="time"]').val()
        data = {
            'date': date+' '+time
        }
        ajax_event_action('PUT', data, 'save', id).then(function (data) {
            render_protocol_training(id, true)
        })
    })

    // Open graphics in modal
    $('.card-body').on('click', '.carousel-item', (e) => {
        e.preventDefault();
        let parentId = $(e.currentTarget).parent().parent().attr('id');
        open_graphics_modal('carouselSchema')
    });
    
    //Проставить все упражнения у группы
    $('#player-protocol-table').on('click', '.all-player-check', function () {
        let group_name = $(this).attr('data-group')
        console.log($(this).is(':checked'))
        if($(this).is(':checked')){
            $('.select-all-group[data-group="'+group_name+'"]:not(:checked)').click()
        } else {
            $('.select-all-group[data-group="'+group_name+'"]:checked').click()
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


    // $('a[href="#training-card"]').on('show.bs.tab', function () {
    //     render_exercises_training(id)
    // })
    $('a[href="#training-exercises"]').on('show.bs.tab', function () {
        CountExsInFolder(false);
    })
    // $('a[href="#training-protocol"]').on('show.bs.tab', function () {
    //     render_protocol_training(id)
    // })

    generate_exercises_module_data()
    render_exercises_training(id)
    render_protocol_training(id)
    //CountExsInFolder(false);
})

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
            <th colspan="2"></th>
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
            <th class="p-0 text-center align-middle border">
                <button title="" class="btn btn-block btn-outline-success btn-sm edit-input" data-toggle="modal" data-target="#add-player-protocol-modal" ${!edit_mode ? 'disabled' : ''}><i class="fa fa-plus" aria-hidden="true"></i></button>
            </th>
            <th colspan="5" class="p-0 text-center align-middle border">
            </th>
        `
        for (let i = 0; i < exs_group.length; i++) {
            if(exs_group[i].ids.length == 0) continue
            let group = i == 0 ? 'A' : i == 1 ? 'B' : i == 2 ? 'C' : 'D'
            protocol_header += `<th colspan="${exs_group[i].ids.length+1}" class="p-0 text-center align-middle border">${gettext('Group '+group+' (Exercises)')}</th>`

            for (let j = 0; j < exs_group[i].ids.length; j++) {
                if(j == 0){
                    protocol_header2 += `
                    <th class="p-0 text-center align-middle border" width="40"><input type="checkbox" class="all-player-check edit-input" data-group="group_${i+1}" style="width: 25px; height: 25px;" ${!edit_mode ? 'disabled' : ''}></th>
                    `
                }
                protocol_header2 += `<th title="${(get_cur_lang() in exs_group[i].ids[j].exercise_name) ? exs_group[i].ids[j].exercise_name[get_cur_lang()] : Object.values(exs_group[i].ids[j].exercise_name)[0]}" class="p-0 text-center align-middle border">${j+1}</th>`
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
                        <option value="">${gettext('Training')}</option>
                    `
                $.each( options, function( key, option ) {
                    option_html+=`
                        <option value="${ option.id }">${ (get_cur_lang() in option.translation_names) ? option.translation_names[get_cur_lang()] : Object.values(exercise.exercise_name)[0] }</option>
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
                    console.log(player.status)
                    if(!player_line && (player.status != null)) {
                        player_line = true
                        line_css = 'border-top: solid 2px red'
                    }
                    let player_row = ``
                    player_row += `
                    <tr class="player_row" data-training="${player.training_id}" data-id="${player.id}" style="${line_css != '' ? line_css : ''}">
                        <td width="20" class="p-0 text-right align-middle">
                            <button type="button" title="${gettext('Delete player')}" class="btn btn-sm btn-danger delete-player-button py-0 w-100 edit-input" style="height: 30px;" ${!edit_mode ? 'disabled' : ''}>X</button>
                        </td>
                        <td width="150" class="p-0 align-middle">
                            ${select}
                        </td>
                        <td width="30" class="p-0 text-center align-middle estimation-change edit-custom-input ${!edit_mode ? 'disabled' : ''}" name="estimation" value="1"><i class="fa ${player.estimation == 1 ? 'fa-thumbs-down' : 'fa-thumbs-o-down'}" aria-hidden="true"></i></td>
                        <td width="30" class="p-0 text-center align-middle estimation-change edit-custom-input ${!edit_mode ? 'disabled' : ''}" name="estimation" value="2"><i class="fa ${player.estimation == 2 ? 'fa-thumbs-up' : 'fa-thumbs-o-up'}" aria-hidden="true"></i></td>
                        <td width="40" class="p-0 text-center align-middle"></td>
                        <td width="200" class="align-middle">
                            <span class="float-left player-name" title="${player.full_name}">${player.full_name}</span>
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
                    $('#player-protocol-table .player_row[data-id="'+player.id+'"] select[name="status"]').val(player.status)
                    for (let i = 0; i < exs_group.length; i++) {
                        let all_select_check = $('#player-protocol-table .all-player-check[data-group="group_'+(i+1)+'"]')
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
                        })
                        if($('#player-protocol-table [name="group_'+(i+1)+'"]').is(':empty')){
                            all_select_check.prop('checked', false)
                        }
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

        let card_html = ''
        let exs_html = ''
        let select_html = ''
        let counts_group = [0,0,0,0];
        //console.log(select_html)
        $.each( exercises, function( key, exercise ) {
            counts_group[exercise.group-1]++;
            card_html += `
            <div class="col-4 py-2 exercise-visual-block" data-id="${exercise.id}">
                <div id="carouselSchema-${key}" class="carousel slide carouselSchema" data-ride="carousel" data-interval="false">
                    <ol class="carousel-indicators">
                        <li data-target="#carouselSchema" data-slide-to="0" class="active"></li>
                        <li data-target="#carouselSchema" data-slide-to="1"></li>
                    </ol>
                    <div class="carousel-inner">
                        <div class="carousel-item active">${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_1'] : ''}</div>
                        <div class="carousel-item">${exercise.exercise_scheme ? exercise.exercise_scheme['scheme_2'] : ''}</div>
                    </div>
                    <a class="carousel-control-prev ml-2" href="#carouselSchema-${key}" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselSchema-${key}" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
                <div class="row text-center">
                    <div class="col-10 pr-0"><div class="w-100 border text-truncate">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div></div>
                    <div class="col pl-0"><div class="w-100 border">${exercise.duration}</div></div>
                    <div class="col-1 pl-0 edit-button ${!edit_mode ? 'd-none' : ''}">
                        <button type="button" class="btn btn-sm btn-block btn-warning rounded-0 p-0 h-100 float-right add-exercise-additional"><i class="fa fa-plus" aria-hidden="true"></i></button>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 additional-data-block">
                        
                    </div>
                </div>
            </div>
            `

            if(group == null) return

            exs_html += `
            <div id="order-${exercise.id}" class="row border-bottom exercise-row bg-white" data-id="${exercise.id}">
                <div class="col pr-0 text-truncate" title="${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div>
                <div class="col-sm-12 col-md-4 pl-0">
                    <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 px-1 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 p-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 30px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                </div>
            </div>`
        });
        $('.visual-block .add-exercise').attr('data-group', send_data.group)

        $('.visual-block .group-block[data-group="'+send_data.group+'"]').html(exs_html).sortable({
            disabled: !edit_mode,
            placeholder: "ui-state-highlight",
            scroll: false,
            stop: function( event, ui ) {
                let ids = $(this).sortable( "serialize", { key: 'order[]' } );
                ids = $(this).sortable( "toArray", {attribute:'data-id'});

                let send_orders = {}
                send_orders.exercise_ids = ids;
                //console.log(send_orders)
                ajax_training_exercise_action('PUT', send_orders, 'sort exercises', '', 'sort_exercise').done(function (data) {

                })
            }
        });
        $('#card-scheme-block').html(card_html)
        $('#card-scheme-block .carouselSchema').carousel()

        //Подгрузка дополнительных данных
        $('#card-scheme-block .exercise-visual-block').each(function( index ) {
            let exs_id = $(this).attr('data-id')
            //console.log($(this))
            render_exercises_additional_data(exs_id)
        })

        set_count_exercises(counts_group)
    })
}

// Выгрузить дополнительных данных из упрежнения в тренировке
function render_exercises_additional_data(training_exercise_id = null) {
    let send_data = {}
    ajax_training_exercise_action('GET', send_data, 'load data', training_exercise_id, 'get_data').done(function (data) {
        //console.log(data)
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
                        <input type="text" name="note" class="form-control form-control-sm rounded-0 w-100 p-0 h-auto text-center edit-input" value="${additional.note ? additional.note:''}" ${!edit_mode ? 'disabled' : ''}>
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
    let group = $('.add-exercise').attr('data-group')
    $('.add-exercise').children('span').text($('.group-block[data-group="'+group+'"] .exercise-row').length)
    if(arr_count_group != null){
        for (let i = 0; i < arr_count_group.length; i++) {
            let value = arr_count_group[i]
            if(value != 0) $('.group-button[data-group="'+(i+1)+'"] span').text(value)
        }
    } else {
        let group = $('.add-exercise').attr('data-group')
        $('.group-button[data-group="'+group+'"] span').text($('.group-block[data-group="'+group+'"] .exercise-row').length)
    }
    set_sum_duration_group()
}

// Подсчет суммы минут добавленных упражнений по группам
function set_sum_duration_group() {
    let group = $('.add-exercise').attr('data-group')
    $('.group-block[data-group="'+group+'"]').each(function( index ) {
        let sum = 0
        $(this).find('.exercise-row').each(function( index ) {
            sum += parseInt($(this).find('input[name="duration"]').val())
        })
        //console.log(sum)
        $('.sum-duration-group').text(sum)
    })

}

// Добавление дополнительных данных в модуль списка упражнений
function generate_exercises_module_data() {
    let html_data = `
    <div class="row w-100 font-weight-bold">
        <div class="col px-0">
            <button type="button" class="btn btn-sm btn-block btn-warning add-exercise edit-button d-none" data-group=""><i class="fa fa-plus" aria-hidden="true"></i> <span class="badge badge-light font-weight-bold">0</span></button>
        </div>
    </div>`

    html_data += `
    <div class="row w-100 border border-dark bg-default-light font-weight-bold">
        <div class="col px-0">
            <span class="sum-duration-group btn btn-sm float-right rounded-0 py-0 h-100 font-weight-bold" style="width: 50px">00</span>
        </div>
    </div>`

    html_data += `
    <div class="row w-100" style="min-height: 230px">
        <div class="tab-content w-100 pt-0" id="groups-tabContent">
            <div class="tab-pane fade group-block sortable-edit" id="group_A" data-group="1" role="tabpanel" aria-labelledby="group_A-tab">...1</div>
            <div class="tab-pane fade group-block sortable-edit" id="group_B" data-group="2" role="tabpanel" aria-labelledby="group_B-tab">...2</div>
            <div class="tab-pane fade group-block sortable-edit" id="group_C" data-group="3" role="tabpanel" aria-labelledby="group_C-tab">...3</div>
            <div class="tab-pane fade group-block sortable-edit" id="group_D" data-group="4" role="tabpanel" aria-labelledby="group_D-tab">...4</div>
        </div>
    </div>`

    html_data += `
    <div class="row w-100">
        <ul class="nav nav-pills nav-fill">
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="1" data-toggle="pill" href="#group_A" role="tab">${ gettext("Group A") } <span class="badge badge-dark font-weight-bold">0</span></a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="2" data-toggle="pill" href="#group_B" role="tab">${ gettext("Group B") } <span class="badge badge-dark font-weight-bold">0</span></a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="3" data-toggle="pill" href="#group_C" role="tab">${ gettext("Group C") } <span class="badge badge-dark font-weight-bold">0</span></a>
            </li>
            <li class="nav-item px-1 pt-1">
                <a class="btn btn-sm btn-block btn-outline-warning font-weight-bold group-button" data-group="4" data-toggle="pill" href="#group_D" role="tab">${ gettext("Group D (Individual)") } <span class="badge badge-dark font-weight-bold">0</span></a>
            </li>
        </ul>
    </div>`

    $('.visual-block').append(html_data)
}

function ajax_training_exercise_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/exercise/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                //console.log(data)
                //swal(gettext('Training '+action), gettext('Exercise action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                //console.log(jqXHR)
                swal(gettext('Training '+action), gettext('Error when action "'+action+'" the exercise!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                set_sum_duration_group()
            }
        })
}
// На доработке
function ajax_training_exercise_data_action(method, data, action = '', id = '', func = '') {

    let url = "/trainings/api/exercise_data/"
    if(id !== '') url += `${id}/`
    if(func !== '') url += `${func}/`

    $('.page-loader-wrapper').fadeIn();

    return $.ajax({
            headers:{"X-CSRFToken": csrftoken },
            url: url,
            type: method,
            dataType: "JSON",
            data: data,
            success: function(data){
                //console.log(data)
                //swal(gettext('Training '+action), gettext('Exercise action "'+action+'" successfully!'), "success");
            },
            error: function(jqXHR, textStatus){
                //console.log(jqXHR)
                swal(gettext('Training '+action), gettext('Error when action "'+action+'" the exercise!'), "error");
            },
            complete: function () {
                $('.page-loader-wrapper').fadeOut();
                set_sum_duration_group()
            }
        })
}
