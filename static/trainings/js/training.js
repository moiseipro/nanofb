
function get_page_id(){
    let urlsplit = $(location).attr('pathname').split("/");
    let id = urlsplit[urlsplit.length-1];
    if(id==='')
    {
        id = urlsplit[urlsplit.length-2];
    }
    return id
}

$(window).on('load', function (){
    //Скрыть правый блок
    $('#toggle_btn').click()

    toggle_folders_name()

    var id = get_page_id()

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

    create_ajax_select2($('[name="load"]'), gettext('Load'), '/trainings/loads_list/', $(document.body), false, true, 0, false)
    create_ajax_select2($('[name="blocks"]'), gettext('Block'), '/trainings/blocks_list/', $(document.body), false, true, 0, true, 3)

    create_ajax_select2($('[name="objective_1"]'), gettext('Objectives'), '/trainings/objectives_list/', $(document.body), false, true, 0, true, 3, {'type': 0})
    //create_ajax_select2($('[name="objective_2"]'), gettext('Add. objectives'), '/trainings/objectives_list/', $(document.body), false, true, 0, true, 4, {'type': 1})
    //create_ajax_select2($('[name="objective_3"]'), gettext('Objective')+' 3', '/trainings/objectives_list/', $(document.body), false, true, 0, true, 2, {'type': 2})

    $('#block-training-goals select').on('change', function () {
        resize_trainings_block()
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
                    <div class="col px-0 text-truncate" title="${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div>
                    <div class="col-sm-12 col-md-3 px-0">
                        <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 px-1 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                        <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 py-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 50px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
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

    //Сохранение тренировки
    $('#save-training').on('click', function () {
        let date = $('#training-main-data input[name="date"]').val()
        let time = $('#training-main-data input[name="time"]').val()
        let data = {
            'date': date+' '+time
        }
        ajax_event_action('PUT', data, 'save', id).then(function (data) {

        })

        let training_data = {}
        let additionals = {}
        for (let i = 0; i < 6; i++) {
            let name = $('#training-additional-data input[name="name_'+i+'"]')
            //let note = $('#training-additional-data input[name="note_'+i+'"]')

            //name.closest('.training-additional').toggleClass('edit-button d-none', !name.val()) //&& !note.val()

            additionals[i] = {
                'name': name.val(),
                //'note' : note.val()
            }
        }
        let inventory = []
        $('.inventory-data-rows input').each(function( index ) {
            console.log( index + ": " + $( this ).text() );

            inventory.push({
                'name': $(this).attr('name'),
                'value': $(this).val()
            })
        })
        training_data['is_personal'] = $('#training-main-data input[name="is_personal"]').is(':checked') ? 1 : 0;
        training_data['inventory'] = JSON.stringify(inventory)
        training_data['additional'] = JSON.stringify(additionals)
        training_data['block'] = $('#training-main-data select[name="block"]').val()
        training_data['load'] = $('#training-main-data select[name="load"]').val()
        //training_data['block_short_key'] = $('#training-main-data select[name="block_key"]').val()

        training_data['group'] = $('#training-main-data select[name="group"]').val()
        training_data['video_href'] = $('#training-video-modal input[name="video_href"]').val()

        training_data['players_count'] = $('#training-main-data input[name="players_count"]').val()
        training_data['goalkeepers_count'] = $('#training-main-data input[name="goalkeepers_count"]').val()
        console.log(training_data)

        ajax_training_action('PUT', training_data, 'save', id).then(function (data) {
            let objectives = []
            let objective_1 = $('#block-training-goals select[name="objective_1"]').val()
            for (let i = 0; i < objective_1.length; i++) {
                objectives.push({"training": id, "objective": objective_1[i], "type": 0})
            }
            // let objective_2 = $('#block-training-goals select[name="objective_2"]').val()
            // for (let i = 0; i < objective_2.length; i++) {
            //     objectives.push({"training": id, "objective": objective_2[i], "type": 1})
            // }
            // let objective_3 = $('#block-training-goals select[name="objective_3"]').val()
            // for (let i = 0; i < objective_3.length; i++) {
            //     objectives.push({"training": id, "objective": objective_3[i], "type": 2})
            // }
            //console.log(objectives)
            let items = {'items': JSON.stringify(objectives)}

            ajax_training_action("POST", items, 'change objective', id, 'add_objective').then(function (data) {
                let blocks = []
                let blocks_val = $('#training-main-data select[name="blocks"]').val()
                for (let i = 0; i < blocks_val.length; i++) {
                    blocks.push({"training": id, "block": blocks_val[i]})
                }
                //console.log(blocks)
                let items = {'items': JSON.stringify(blocks)}
                ajax_training_action("POST", items, 'change block', id, 'add_block').then(function (data) {
                    show_training_card(id)
                })
            })
        })
    })

    $('#block-training-goals select').on('change', function () {


    })

    //Сохранение инвенторя при изменении значения
    $('.inventory-data-rows input').on("change", function( index ) {
        let training_data = {}
        let inventory = []
        $('.inventory-data-rows input').each(function( index ) {
            inventory.push({
                'name': $(this).attr('name'),
                'value': $(this).val()
            })
        })
        training_data['inventory'] = JSON.stringify(inventory)

        ajax_training_action('PUT', training_data, 'save_inventory', id).then(function (data) {

        })
    })

    //Сохранение "быстрых" игроков при изменении значений
    $('#players-data-list').on("change", 'input', function( index ) {
        let training_data = {}
        let players_list = []
        $('#players-data-list .player-row').each(function( index ) {
            let group = []
            $(this).find('.player-group-input').each(function () {
                group.push($(this).val())
            })
            players_list.push({
                'name': $(this).find('.player-name-input').val(),
                'group': group,
                'check': $(this).find('.player-check-input').is(':checked')
            })
        })
        players_list.sort(function (a, b) {
            if (a.check < b.check) return 1
            else if (a.check > b.check) return -1
            else return 0;
        })
        training_data['players_json'] = JSON.stringify(players_list)

        ajax_training_action('PUT', training_data, 'save_players', id).then(function (data) {
            let players_html = players_list_to_html(players_list)
            $('#players-data-list').html(players_html)
        })
    })
    
    //Сброс "быстрых" игроков к шаблону таблицы
    $('#players-data-tab .reset-players').on('click', function () {
        let selected_team = $('#select-team').val()
        ajax_team_action('GET', {}, 'get players', selected_team).then(function (data) {
            let players_json = data.players_json
            console.log(players_json)
            let players_html = players_list_to_html(data.players_json)
            $('#players-data-list').html(players_html)
        })
    })

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

    $('a[href="#training-exercises"]').on('show.bs.tab', function () {
        CountExsInFolder(false);
    })

    // sizes of columns in exercises list:
    setTimeout(() => {
        $('#toggleFoldersNames').attr('data-state', '1');
        ResizeSplitCols();
    }, 500);

    generate_exercises_module_data()
    show_training_card(id)
    render_exercises_training(id)
    resize_trainings_block()
})

function resize_trainings_block(){
    let css = "calc(94vh - "+Math.round($('.header').height())+"px - "+Math.round($('.card-header').height())+"px)"
    console.log($('#block-training-goals').height())
    let css_block = "calc(94vh - "+Math.round($('.header').height())+"px - "+Math.round($('#block-training-goals').height())+"px - "+Math.round($('.card-header').height())+"px)"
    $('#training-content .training-data').css({"max-height": css})
    $('#training-content .training-data').css({"height": css})
    $('#block-training-info').css({"max-height": css_block})
    $('#block-training-info').css({"height": css_block})
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
                <div class="col px-0 text-truncate" title="${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div>
                <div class="col-sm-12 col-md-3 px-0">
                    <button type="button" class="btn btn-sm btn-danger rounded-0 py-0 px-1 h-100 float-right delete-exercise edit-button ${!edit_mode ? 'd-none' : ''}"><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <input type="number" name="duration" min="0" max="999" class="form-control form-control-sm rounded-0 p-0 h-auto text-center float-right edit-input" value="${exercise.duration}" style="width: 50px" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
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
            <span class="font-weight-bold group-button">${ gettext("Exercises") }</span>
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

    // html_data += `
    // <div class="row group-row mx-0 border border-dark bg-default-light font-weight-bold" data-group="2">
    //     <div class="col-1 px-0 edit-button d-none">
    //         <button class="btn btn-sm btn-block btn-warning font-weight-bold py-0 h-100 add-exercise"><i class="fa fa-plus" aria-hidden="true"></i></button>
    //     </div>
    //     <div class="col-1">
    //         <span class="font-weight-bold group-count"></span>
    //     </div>
    //     <div class="col">
    //         <span class="font-weight-bold group-button">${ gettext("Group B") }</span>
    //     </div>
    //     <div class="col px-0">
    //         <span class="sum-duration-group btn btn-sm float-right rounded-0 py-0 h-100 font-weight-bold" style="width: 50px">00</span>
    //     </div>
    // </div>
    // <div class="row group-exercises-row mx-0" data-group="2">
    //     <div class="col">
    //         <div class="group-block sortable-edit" id="group_B" aria-labelledby="group_B-tab">...2</div>
    //     </div>
    // </div>
    //
    // `

    $('.visual-block').append(html_data)
}