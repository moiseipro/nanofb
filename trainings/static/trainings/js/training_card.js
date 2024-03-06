var players_count, goalkeepers_count;

$(window).on('load', function (){
    //Создание редактора
    let cLang = $('#select-language').val();
    try {
        let watchdog_descriptionEditor = new CKSource.EditorWatchdog();
		watchdog_descriptionEditor.setCreator((element, config) => {
			return CKSource.Editor
            .create(element, config)
            .then( editor => {
                document.descriptionEditor = editor;
                const toolbarElement = editor.ui.view.toolbar.element;
                editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
                    if ( isReadOnly ) {
                        toolbarElement.style.display = 'none';
                    } else {
                        toolbarElement.style.display = 'flex';
                    }
                } );
                editor.model.document.on( 'change:data', debounce(function () {
                    console.log( 'The Document has changed!' );
                    let exs_id = $('.exs-filter-card.active').attr('data-id')
                    let data = {}
                    data.description = editor.getData()
                    ajax_training_exercise_action('PUT', data, 'update', exs_id, '').then(function () {

                    })
                }, 1000));
                $('.resizeable-block').css('height', `100%`);
				return editor;
			})
		});
        watchdog_descriptionEditor.setDestructor(editor => {
            return editor.destroy();
        });
		watchdog_descriptionEditor.on('error', (error) => {
            console.error("Error with CKEditor5: ", error);
        });
        watchdog_descriptionEditor
		.create(document.querySelector('#descriptionExerciseView'), {
			licenseKey: '',
            language: cLang,
            removePlugins: ['Title'],
            fontSize: {
                options: [
                    10,
                    11,
                    12,
                    13,
                    'default',
                    15,
                    16,
                    17,
                    18,
                ]
            },
            toolbar: {
                items: [
                    'heading', '|',
                    'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                    'specialCharacters', '|',
                    'undo', 'redo', '|',
                    'bold', 'italic', 'underline', '|',
                    // 'bulletedList', 'numberedList', 'toDoList', '|',
                    // 'outdent', 'indent', 'alignment', '|',
                    // 'link', 'insertImage', 'blockQuote', 'insertTable', '|'
                ],
                shouldNotGroupWhenFull: true,
            },
		}).then((editor)=>{
		    if (edit_mode) document.descriptionEditor.disableReadOnlyMode('');
            else document.descriptionEditor.enableReadOnlyMode('');
        })
		.catch((error) => {
            console.error("Error with CKEditor5: ", error);
        });
    } catch(e) {}


    //Переключатель по группам
    $('#training-content').on('click', '.group-filter-card', function () {
        let group_id = $(this).attr('data-group')
        let training_id = $('#training-content').attr('data-training')
        //console.log(group_id)

        $('.exercise-data-row').addClass('d-none')
        // $('.training-data-row').removeClass('d-none')

        $('#training-content .group-filter-card').removeClass('active')
        $('#training-content .exs-filter-card').removeClass('active')
        $(this).addClass('active')
        load_all_exercises_training(training_id, group_id)
    })
    //Переключатель по упражнениям
    $('#training-content').on('click', '.exs-filter-card', function () {
        let exs_id = $(this).attr('data-id')
        let group_id = $(this).attr('data-group')
        //console.log(exs_id)
        if($(this).hasClass('active')){
            $(`#training-content .group-filter-card[data-group="${group_id}"]`).click()
        } else {
            $('.exercise-data-row').removeClass('d-none')
            // $('.training-data-row').addClass('d-none')
            $('#training-content .group-filter-card').removeClass('active')
            $('#training-content .exs-filter-card').removeClass('active')
            $(this).addClass('active')
            load_exercises_training_data(exs_id)
            load_exercises_additional_data(exs_id)
        }

    })

    // Добавление всех дополнительных данных в тренировку
    $('#training-exercise-additional-modal').on('click', '#add-exercise-additional', function (){
        let training_exercise_id = $('#training-content').find('.exs-filter-card.active').attr('data-id')

        let send_data = {}
        send_data.additional_id = 0
        send_data.note = ''

        swal(gettext("When uploading data, the existing ones will be reset."), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_training_exercise_action('POST', send_data, 'load data', training_exercise_id, 'add_all_data').then(function (data) {
                    //console.log(data)
                    load_exercises_additional_data(training_exercise_id)
                })
            }
        });
    })
    // Копирование дополнительных данных в тренировку
    $('#collapse-exercise-additional').on('click', '.copy-exercise-additional', function (){
        let training_exercise_id = $('#training-content').find('.exs-filter-card.active').attr('data-id')
        let this_row = $(this).closest('.exercise-additional-row')
        let send_data = {}

        send_data = {
            additional_id: this_row.attr('data-additional'),
            note: '',
        }

        ajax_training_exercise_action('POST', send_data, 'add data', training_exercise_id, 'add_data').then(function (data) {
            //console.log(data)
            load_exercises_additional_data(training_exercise_id)
        })
    })
    // Добавление выбранных дополнительных данных в тренировку
    $('#training-exercise-additional-modal').on('click', '#add-selected-exercise-additional', function (){
        let training_exercise_id = $('#training-content').find('.exs-filter-card.active').attr('data-id')

        let send_data = []

        $('.exercise-additional-list .additional-row').each(function () {
            if($(this).find('.edit-input').is(':checked')){
                send_data.push({
                    additional_id: $(this).find('.edit-input').val(),
                    training_exercise_id: training_exercise_id,
                    note: '',
                })
            }
        })
        let items = {'items': JSON.stringify(send_data)}

        ajax_training_exercise_data_action('POST', items, 'load data').then(function (data) {
            //console.log(data)
            load_exercises_additional_data(training_exercise_id)
        })
    })
    // Удаление дополнительных данных в упражнении
    $('#training-content').on('click', '.delete-exercise-additional', function (){
        let cur_row = $(this).closest('.exercise-additional-row')
        let exercise_additional_id = cur_row.attr('data-id')

        let send_data = {}
        ajax_training_exercise_data_action('DELETE', send_data, 'delete data', exercise_additional_id).then(function (data) {
            //console.log(data)
            cur_row.remove();
        })
    })
    // Удаление всех/пустых дополнительных данных в упражнении
    $('#training-content').on('click', '.delete-all-exercise-additional', function (){
        let training_exercise_id = $('#training-content').find('.exs-filter-card.active').attr('data-id')

        let send_data = {}
        swal(gettext("Delete all additional data from the exercise?"), {
            buttons: {
                cancel: true,
                confirm: true,
            },
        }).then(function(isConfirm) {
            if (isConfirm) {
                ajax_training_exercise_action('DELETE', send_data, 'delete all data', training_exercise_id, 'delete_all_data').then(function (data) {
                    //console.log(data)
                    load_exercises_additional_data(training_exercise_id)
                })
            }
        });
    })
    // Редактирование дополнительных данных в упражнении
    $('#collapse-exercise-additional').on('change', '.edit-input', function (){
        let exs_id = $('.exs-filter-card.active').attr('data-id')
        let cur_row = $(this).closest('.exercise-additional-row')
        let exercise_additional_id = cur_row.attr('data-id')

        let send_data = {}
        let additionals = {}
        for (let i = 0; i < 6; i++) {
            let name = $('#collapse-exercise-additional input[name="name_'+i+'"]')

            //name.closest('.exercise-additional-row').toggleClass('edit-button', !name.val())

            additionals[i] = {
                'name': name.val(),
                //'note' : note.val()
            }
        }
        send_data['additional_json'] = JSON.stringify(additionals)

        ajax_training_exercise_action('PUT', send_data, 'update', exs_id, '').then(function () {

        })
    })

    //Действия со ссылкой на видео тренировки
    $('#training-video-modal .open-link').on('click', function () {
        //console.log("open link")
        let url = $('#training-video-modal input[name="video_href"]').val()
        if(url!=''){
            window.open(url, '_blank');
        }
    })
    $('#training-video-modal .copy-link').on('click', function () {
        let url = $('#training-video-modal input[name="video_href"]').val()
        navigator.clipboard.writeText(url);
    })

    //Изменение количества игроков для тренировок lite
    $('#training-main-data .training-players input').on('change', function () {
        let group = $(this).attr('group')
        players_count[group-1] = $(this).val()
    })
    $('#training-main-data .training-goalkeepers input').on('change', function () {
        let group = $(this).attr('group')
        goalkeepers_count[group-1] = $(this).val()
    })
})

function resize_trainings_card_blocks(){
    let css = "calc(86vh - "+Math.round($('#block-training-info .exercise-data-row').height())+"px - 61px - "+Math.round($('.header').height())+"px)"
    //console.log(css)
    $('#block-training-info .carouselSchema').css({"max-height": css})
    $('#block-training-info .carouselSchema').css({"height": css})

}

function show_training_card(id = ''){
    if (id == '' || id == null) {
        $('#training-content').removeClass('d-none')
        //console.log('id is empty')
        return false;
    }
    $('#training-content').attr('data-training', id)
    let data_send = {}
    ajax_training_action('GET', data_send, 'view card', id).then(function (data) {
        console.log(data)
        let count_1 = 0, count_2 = 0;
        let min_1 = 0, min_2 = 0;

        let html_group_1 = ''
        let html_group_2 = ''
        $.each( data.exercises_info, function( key, value ) {
            if (value.group==1){
                html_group_1 += `
                <div class="col-12 px-0 mb-1">
                    <button data-id="${value.id}" data-group="${value.group}" class="btn btn-sm btn-block border-white rounded-0 py-0 exs-filter-card" data-toggle="tooltip" data-html="true" title="${gettext("Click to view description")}"><span class="float-left">${get_translation_name(value.exercise_name)}</span> <span class="float-right">${value.duration}\`</span></button>
                </div>`
                //${get_translation_name(value.exercise_name)}
                min_1+=value.duration
                count_1++
            } else if (value.group==2){
                html_group_2 += `
                <div class="col-12 px-0 mb-1">
                    <button data-id="${value.id}" data-group="${value.group}" class="btn btn-sm btn-block border-white rounded-0 py-0 exs-filter-card" data-toggle="tooltip" data-html="true" title="${gettext("Click to view description")}"><span class="float-left">${get_translation_name(value.exercise_name)}</span> <span class="float-right">${value.duration}\`</span></button>
                </div>`
                //${get_translation_name(value.exercise_name)}
                 min_2+=value.duration
                count_2++
            }
        });
        let html_group_A = `
                <div class="col-12 px-0 mb-1">
                    <button data-group="1" class="btn btn-sm btn-block border-dark font-weight-bold rounded-0 py-0 group-filter-card"><span class="float-left">${gettext('Group')} A</span> <span class="float-right">${min_1}\`</span></button>
                </div>`
        let html_group_B = `
                <div class="col-12 px-0 mb-1">
                    <button data-group="2" class="btn btn-sm btn-block border-dark font-weight-bold rounded-0 py-0 group-filter-card"><span class="float-left">${gettext('Group')} B</span> <span class="float-right">${min_2}\`</span></button>
                </div>`
        // if (count_1<count_2){
        //     for (let i=0; i < count_2-count_1; i++){
        //         html_group_1 += `
        //         <div class="col px-0">
        //         </div>`
        //     }
        // } else {
        //     for (let i=0; i < count_1-count_2; i++){
        //         html_group_2 += `
        //         <div class="col px-0">
        //         </div>`
        //     }
        // }
        $('.exercise-list[data-group="1"]').html(html_group_A)
        $('.exercise-list[data-group="2"]').html(html_group_B)
        $('.exercise-list[data-group="1"]').append(html_group_1)
        $('.exercise-list[data-group="2"]').append(html_group_2)

        $('#training-content .group-filter-card[data-group="1"]').click()
        $('#training-content').removeClass('d-none')
        //$('[data-toggle="tooltip"]').tooltip()
    })
}

// Выгрузить упражнений из тренировки
function load_all_exercises_training(training_id = null, group = null) {
    let send_data = {}
    if(group != null) send_data.group = group

    ajax_training_action('GET', send_data, 'view card training', training_id).then(function (data) {
        $('#training-main-data [name="date"]').val(data.event_date);
        $('#training-main-data [name="time"]').val(data.event_time);
        if('team_info' in data) $('#training-main-data .team-name').text(data.team_info.name);
        else $('#training-main-data .team-name').text('Test');
        $('#training-main-data .trainer-select').text(data.trainer);
        $('#training-main-data [name="is_personal"]').prop('checked', data.is_personal);
        let newOption;
        if (data.block){
            newOption = new Option(data.block, data.block, false, true);
            $('#training-main-data select[name="block"]').append(newOption).trigger('change');
        } else {
            $('#training-main-data select[name="block"]').val(null).trigger('change');
        }
        if (data.block_short_key){
            newOption = new Option(data.block_short_key, data.block_short_key, false, true);
            $('#training-main-data select[name="block_key"]').append(newOption).trigger('change');
        } else {
            $('#training-main-data select[name="block_key"]').val(null).trigger('change');
        }



        console.log(data.objectives)
        $('#block-training-goals select').val(null).trigger('change');
        for (const objective of data.objectives) {
            let html_option_text = `${objective.objective.name}`
            newOption = new Option(html_option_text, objective.objective.id, false, true);
            console.log(newOption)
            newOption = `<option value="${objective.objective.id}" selected>${html_option_text}</option>`
            console.log(newOption)
            if (objective.type == 0){
                $('#block-training-goals select[name="objective_1"]').append(newOption).trigger('change');
            }
            if (objective.type == 1){
                $('#block-training-goals select[name="objective_2"]').append(newOption).trigger('change');
            }
            if (objective.type == 2){
                $('#block-training-goals select[name="objective_3"]').append(newOption).trigger('change');
            }
        }
        $('#training-main-data #select-training-block').val(null).trigger('change')
        for (const block of data.blocks) {
            let html_option_text = `<span class="border bg-light px-1">${block.block.name}</span>`
            newOption = new Option(html_option_text, block.block.id, false, true);
            console.log(newOption)
            newOption = `<option value="${block.block.id}" selected>${html_option_text}</option>`
            console.log(newOption)
            $('#training-main-data select[name="blocks"]').append(newOption).trigger('change');
        }
        $('#training-video-modal input[name="video_href"]').val(data.video_href)
        //console.log(data.inventory)
        if(data.inventory != null){
            for (const inventory_item of data.inventory) {
                $('.inventory-data-rows input[name="'+inventory_item.name+'"]').val(inventory_item.value)
            }
        }
        if(data.players_json != null && data.players_json.length > 0){
            let players_html = players_list_to_html(data.players_json)
            $('#players-data-list').html(players_html)
        } else {
            let selected_team = $('#select-team').val()
            ajax_team_action('GET', {}, 'get players', selected_team).then(function (data) {
                let players_json = data.players_json
                console.log(players_json)
                let players_html = players_list_to_html(data.players_json)
                $('#players-data-list').html(players_html)
            })
        }


        let exs_time = [0, 0]
        let html_scheme = ''
        html_scheme += `<div class="row training-info">`

        let player_count = 0
        let player_goalkeeper = 0
        let player_recount = []
        let goalkeeper_recount = []
        if (data.exercises_info.length > 0) {
            let exercises = data.exercises_info
            for (let exercise of exercises) {
                let count_slide = 0
                let select_html = '', carousel_html = ''
                exs_time[exercise.group-1] += exercise.duration
                if (exercise.scheme_img) {
                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item active">
                            <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                            </svg>
                        </div>`
                }
                if(exercise.scheme_1){
                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img ? 'active': ''}"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item ${!exercise.scheme_img ? 'active': ''}">
                            <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" x="0" y="0"></image>
                            </svg>
                        </div>`
                }
                // <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" alt="scheme" width="100%" height="100%">
                if(exercise.scheme_2){
                    select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img && !exercise.scheme_1 ? 'active': ''}"></li>`
                    count_slide++
                    carousel_html+= `
                        <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 ? 'active': ''}">
                            <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                                <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" x="0" y="0"></image>
                            </svg>
                        </div>`
                }
                // <img src="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" alt="scheme" width="100%" height="100%">
                if(exercise.exercise_scheme){
                    if(exercise.exercise_scheme['scheme_1']){
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_img && !exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}"></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}">
                                ${exercise.exercise_scheme['scheme_1']}
                            </div>`
                    }
                    if(exercise.exercise_scheme['scheme_2']){
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item">
                                ${exercise.exercise_scheme['scheme_2']}
                            </div>`
                    }
                }
                html_scheme += `
                <div class="col-4 pb-2 px-1 exercise-visual-block" data-id="${exercise.id}" data-exs-id="${exercise.exercise_id.id}" data-group="${exercise.group}">
                    <div id="carouselTrainingSchema-${exercise.id}" class="carousel slide carouselSchema" data-ride="carousel" data-interval="false">
                        <ol class="carousel-indicators">
                            ${select_html}
                        </ol>
                        <div class="carousel-inner">
                            ${carousel_html}
                        </div>
                        <a class="carousel-control-prev ml-2" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                    <div class="row text-center">
                        <div class="col-10 pr-0">
                            <div class="w-100 border text-truncate">${(get_cur_lang() in exercise.exercise_name) ? exercise.exercise_name[get_cur_lang()] : Object.values(exercise.exercise_name)[0]}</div>
                        </div>
                        <div class="col pl-0">
                            <div class="w-100 border ${exercise.duration==0 ? 'font-weight-bold text-danger':''}">${exercise.duration}</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 additional-data-block"></div>
                    </div>
                </div>
                `

                if ('protocol_info' in data && data.protocol_info.length > 0) {
                    let players = data.protocol_info
                    //console.log(players)
                    for (let player of players) {
                        if (exercise.group == group && player.training_exercise_check.indexOf(exercise.id) != -1 ){

                            if (player_recount.indexOf(player.id) == -1){
                                player_recount.push(player.id)
                                player_count++
                            }

                            if(player.is_goalkeeper){
                                if (goalkeeper_recount.indexOf(player.id) == -1){
                                    goalkeeper_recount.push(player.id)
                                    player_goalkeeper++;
                                }
                            }
                        }
                    }
                    //console.log(player_recount)
                } else {
                    if('players_count' in data){
                        let players = data.players_count
                        players_count = players ? players : {0: '0', 1: '0'};
                        player_count = players_count[group-1]
                    }
                    if('goalkeepers_count' in data){
                        let players = data.goalkeepers_count
                        goalkeepers_count = players ? players : {0: '0', 1: '0'};
                        player_goalkeeper = goalkeepers_count[group-1]
                    }
                }
            }
        }
        html_scheme += `</div>`

        $('#training-main-data .all-exercise-time').text(exs_time[group-1]+'`')
        $('#training-main-data .training-players input').attr('group', group).val(player_count)
        $('#training-main-data .training-goalkeepers input').attr('group', group).val(player_goalkeeper)


        $('#training-content #block-training-info').html(html_scheme)
        $('#training-content .training-info .exercise-visual-block').addClass('d-none')
        $('#training-content .training-info .exercise-visual-block[data-group="'+group+'"]').removeClass('d-none')
        //resize_trainings_block()
    })
}

// Выгрузить данных упрежнения из тренировки
function load_exercises_training_data(training_exercise_id = null) {
    let send_data = {}
    ajax_training_exercise_action('GET', send_data, 'load exercise', training_exercise_id).then(function (exercise) {
        console.log(exercise)

        let video_data = null
        $('#block-training-info').html('')

        $('.training-exercise-name .exercise-name').html(get_translation_name(exercise.exercise_data.title))

        $('.training-exercise-name .exercise-time').html(`
            <div class="w-100 ${exercise.duration==0 ? 'font-weight-bold text-danger':''}">${exercise.duration}</div>
        `)
        if(exercise.description){
            //$('#training-exercise-description #descriptionExerciseView').val(exercise.description)
            document.descriptionEditor.setData(exercise.description)
        } else {
            if(exercise.exercise_data.description){
                document.descriptionEditor.setData(get_translation_name(exercise.exercise_data.description))
                //$('#training-exercise-description #descriptionExerciseView').val(get_translation_name(exercise.exercise_data.description))
            } else{
                document.descriptionEditor.setData('')
                //$('#training-exercise-description #descriptionExerciseView').val('')
            }
        }
        let additional_html = ''
        for (let i = 0; i < 6; i++) {
            let name;
            let note;
            if (exercise.additional_json != null){
                if (i in exercise.additional_json){
                    name = exercise.additional_json[i]['name']
                    //note = exercise.additional_json[i]['note']
                }
            }
            additional_html += `
            <div class="col-4 exercise-additional-row ${name ? '' : 'edit-input'} ${!name && !edit_mode ? 'disabled' : ''}">
                <div class="row">
                    <div class="col-12 px-0">
                        <input type="text" name="name_${i}" class="form-control form-control-sm w-100 p-0 h-auto text-center rounded edit-input" value="${name ? name : ''}" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                    </div>
                </div>
            </div>
            `
            // <div class="col px-0">
            //     <input type="text" name="note_${i}" class="form-control form-control-sm w-100 p-0 h-auto text-center rounded edit-input" value="${note ? note : ''}" placeholder="${gettext('Note')}" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
            // </div>
        }
        $('#collapse-exercise-additional').html(additional_html)


        //$('#training-exercise-description .exercise-description').val(exercise.description)
        let count_slide = 0
        let select_html = '', carousel_html = ''
        if (exercise.scheme_img) {
            select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
            count_slide++
            carousel_html+= `
                <div class="carousel-item active">
                    <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                        <image data-height="400" data-width="600" height="100%" width="100%" href="${exercise.scheme_img}" x="0" y="0"></image>
                    </svg>
                </div>`
        }
        if(exercise.scheme_1){
            select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
            count_slide++
            carousel_html+= `
                <div class="carousel-item ${!exercise.scheme_img ? 'active': ''}">
                    <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                        <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_1}" x="0" y="0"></image>
                    </svg>
                </div>`
        }
        if(exercise.scheme_2){
            select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_1 ? 'active': ''}"></li>`
            count_slide++
            carousel_html+= `
                <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 ? 'active': ''}">
                    <svg class="d-block bg-success mx-auto" height="100%" preserveAspectRatio="none" style="" viewBox="0 0 600 400" width="100%" xmlns="http://www.w3.org/2000/svg">
                        <image data-height="400" data-width="600" height="100%" width="100%" href="https://nanofootballdraw.ru/api/canvas-draw/v1/canvas/render?id=${exercise.scheme_2}" x="0" y="0"></image>
                    </svg>
                </div>`
        }
        if(exercise.exercise_scheme){
            if(exercise.exercise_scheme['scheme_1']){
                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="${!exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}"></li>`
                count_slide++
                carousel_html+= `
                    <div class="carousel-item ${!exercise.scheme_img && !exercise.scheme_1 && !exercise.scheme_2  ? 'active': ''}">
                        ${exercise.exercise_scheme['scheme_1']}
                    </div>`
            }
            if(exercise.exercise_scheme['scheme_2']){
                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class=""></li>`
                count_slide++
                carousel_html+= `
                    <div class="carousel-item">
                        ${exercise.exercise_scheme['scheme_2']}
                    </div>`
            }
        }
        if(exercise.exercise_data.videos.length > 0){
            for (let key in exercise.exercise_data.videos) {
                video_data = exercise.exercise_data.videos
                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}"></li>`
                count_slide++
                carousel_html+= `
                    <div class="carousel-item">
                        <video id="video-exercise-${key}" class="video-js resize-block">
                        </video>
                    </div>`
            }
        }
        if(exercise.exercise_data.description){
            let descr = get_translation_name(exercise.exercise_data.description)
            if(descr!=''){
                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}"></li>`
                count_slide++
                carousel_html+= `
                    <div class="carousel-item">
                        <div id="descriptionEditorView" class="ckeditor">
                            ${descr}
                        </div>
                        
                    </div>`
            }
        }

        $('#exercise-objectives-data .objective_1').html(exercise.exercise_data.field_task ? exercise.exercise_data.field_task : '---')
        $('#exercise-objectives-data .objective_2').html(exercise.exercise_data.field_task ? exercise.exercise_data.field_task : '---')

        let html_exs_data = ''
        html_exs_data += `
            <div class="offset-1 col-10 px-1 exercise-visual-block" data-id="${exercise.id}" data-exs-id="${exercise.exercise_data}" data-group="${exercise.group}" style="height: 100%">
                <div id="carouselTrainingSchema-${exercise.id}" class="carousel slide carouselSchema d-flex align-items-center" data-ride="carousel" data-interval="false" style="height: 100%">
                    <ol class="carousel-indicators">
                        ${select_html}
                    </ol>
                    <div class="carousel-inner" style="max-height: inherit;">
                        ${carousel_html}
                    </div>
                    <a class="carousel-control-prev" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="prev" style="margin-left: -12%; width: 12%; background: lightgrey; color: black;">
                        <i class="fa fa-arrow-left" aria-hidden="true"></i>
                        <span class="sr-only">-</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="next" style="margin-right: -12%; width: 12%; background: lightgrey; color: black;">
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                        <span class="sr-only">+</span>
                    </a>
                </div>
            </div>
            
        `
        $('#block-training-info').html(html_exs_data)
        if(video_data != null){
            for (let key in video_data) {
                //console.log(video_data[key])
                if(video_data[key].links != null){
                    if('nftv' in video_data[key].links && video_data[key].links['nftv']){
                        let videoPlayerExercise = videojs($('#block-training-info').find(`#video-exercise-${key}`)[0], {
                            preload: 'auto',
                            autoplay: false,
                            controls: true,
                            aspectRatio: '16:9',
                        });
                        videoPlayerExercise.poster(`https://nanofootball.pro/video/poster/${video_data[key].links['nftv']}`)
                        videoPlayerExercise.src({type: 'video/mp4', src: `https://nanofootball.pro/video/player/${video_data[key].links['nftv']}`});
                    } else if ('youtube' in video_data[key].links && video_data[key].links['youtube']){
                        let videoPlayerExercise = videojs($('#block-training-info').find(`#video-exercise-${key}`)[0], {
                            preload: 'auto',
                            autoplay: false,
                            controls: true,
                            aspectRatio: '16:9',
                            sources: [{type: 'video/youtube'}],
                            techOrder: ["youtube"],
                            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 }
                        });
                        videoPlayerExercise.poster(`https://nanofootball.pro/video/poster/${video_data[key].links['youtube']}`)
                        videoPlayerExercise.src({type: 'video/mp4', src: `https://nanofootball.pro/video/player/${video_data[key].links['youtube']}`});
                    }
                }

            }
        }
        resize_trainings_card_blocks()
    })
}

// Выгрузить дополнительных данных из упрежнения в тренировке
function load_exercises_additional_data(training_exercise_id = null) {
    let send_data = {}
    ajax_training_exercise_action('GET', send_data, 'load data', training_exercise_id, 'get_data').then(function (data) {
        //console.log(data)
        // var select = ''
        // ajax_exercise_additional('GET').then(function (data_additional) {
        //     let options = data_additional;
        //     console.log(options)
        //     let option_html = ''
        //     $.each( options, function( key, option ) {
        //         option_html+=`
        //             <option value="${ option.id }">${ get_translation_name(option.translation_names) }</option>
        //         `
        //     })
        //     select = `
        //         <select class="select custom-select p-0 edit-input text-left" name="additional_id" tabindex="-1" aria-hidden="true" ${!edit_mode ? 'disabled' : ''} style="height: 25px; color: black !important;">
        //             ${ option_html }
        //         </select>
        //     `
        //     $('#training-exercise-additional').html('')
        //
        // })
        let additional_html = ''
        console.log(data.objs)
        // $.each( data.objs, function( key, additional ) {
        //     additional_html += `
        //     <div class="row exercise-additional-row ${additional.note ? '' : 'edit-button'} ${!additional.note && !edit_mode ? 'd-none' : ''}" data-id="${additional.id}" data-additional="${additional.additional_id}">
        //         <div class="col-5 px-0 border">
        //             ${ get_translation_name(additional.additional_name) }
        //         </div>
        //         <div class="col px-0">
        //             <input type="text" name="note" class="form-control form-control-sm w-100 p-0 h-auto text-center rounded edit-input" value="${additional.note ? additional.note : ''}" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
        //         </div>
        //         <div class="col-sm-12 col-md-1 px-0 edit-button ${!edit_mode ? 'd-none' : ''}">
        //             <button type="button" class="btn btn-sm btn-block btn-success rounded-0 p-0 h-100 float-right edit-input copy-exercise-additional" ${!edit_mode ? 'disabled' : ''}><i class="fa fa-clone" aria-hidden="true"></i></button>
        //         </div>
        //         <div class="col-sm-12 col-md-1 px-0 edit-button ${!edit_mode ? 'd-none' : ''}">
        //             <button type="button" class="btn btn-sm btn-block btn-danger rounded-0 p-0 h-100 float-right edit-input delete-exercise-additional" ${!edit_mode ? 'disabled' : ''}><i class="fa fa-trash" aria-hidden="true"></i></button>
        //         </div>
        //     </div>
        //     `
        //
        // })
        // $('#training-exercise-additional').html(additional_html)
    })
}

function hide_training_card() {
    $('#training-content').addClass('d-none')
}

function toggle_training_card() {
    $('#training-content').toggleClass('d-none')
}