$(window).on('load', function (){
    //Переключатель по группам
    $('#training-content').on('click', '.group-filter-card', function () {
        let group_id = $(this).attr('data-group')
        let training_id = $('#training-content').attr('data-training')
        //console.log(group_id)

        $('.exercise-data-row').addClass('d-none')
        $('.training-data-row').removeClass('d-none')

        $('#training-content .group-filter-card').removeClass('active')
        $('#training-content .exs-filter-card').removeClass('active')
        $(this).addClass('active')
        load_all_exercises_training(training_id, group_id)
    })
    //Переключатель по упражнениям
    $('#training-content').on('click', '.exs-filter-card', function () {
        let exs_id = $(this).attr('data-id')
        //console.log(exs_id)
        $('.exercise-data-row').removeClass('d-none')
        $('.training-data-row').addClass('d-none')

        $('#training-content .group-filter-card').removeClass('active')
        $('#training-content .exs-filter-card').removeClass('active')
        $(this).addClass('active')
        load_exercises_training_data(exs_id)
        load_exercises_additional_data(exs_id)
    })
    // Добавление дополнительных данных в тренировку
    $('#training-content').on('click', '.add-exercise-additional', function (){
        let training_exercise_id = $('#training-content').find('.exs-filter-card.active').attr('data-id')

        let send_data = {}
        send_data.additional_id = 0
        send_data.note = ''
        swal(gettext("Adding additional conditions to the exercise."), {
            buttons: {
                load_all: {
                    text: gettext("Load all"),
                    value: "all",
                    className:'btn-warning'
                },
                load_one: {
                    text: gettext("Load one"),
                    value: "one",
                    className:'btn-warning'
                },
                cancel: true,
            },
        }).then((value) => {
            switch (value) {
                case "one":
                    ajax_training_exercise_action('POST', send_data, 'load data', training_exercise_id, 'add_data').then(function (data) {
                        //console.log(data)
                        load_exercises_additional_data(training_exercise_id)
                    })
                    break;
                case "all":
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
                    break;
                default:
            }
        });
    })
    // Удаление дополнительных данных в упражнении
    $('#training-content').on('click', '.delete-exercise-additional', function (){
        let cur_row = $(this).closest('.exercise-additional-row')
        let exercise_additional_id = cur_row.attr('data-id')

        let send_data = {}
        ajax_training_exercise_data_action('DELETE', send_data, 'delete data', exercise_additional_id).done(function (data) {
            //console.log(data)
            cur_row.remove();
        })
        // swal(gettext("Remove an additional data from an exercise?"), {
        //     buttons: {
        //         cancel: true,
        //         confirm: true,
        //     },
        // }).then(function(isConfirm) {
        //     if (isConfirm) {
        //         ajax_training_exercise_data_action('DELETE', send_data, 'delete data', exercise_additional_id).done(function (data) {
        //             //console.log(data)
        //             cur_row.remove();
        //         })
        //     }
        // });
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
        // swal(gettext("Remove an additional data from an exercise?"), {
        //     buttons: {
        //         delete_all: {
        //             text: gettext("Delete all"),
        //             value: "all",
        //             className:'btn-danger'
        //         },
        //         delete_empty: {
        //             text: gettext("Delete empty"),
        //             value: "empty",
        //             className:'btn-warning'
        //         },
        //         cancel: true,
        //     },
        // }).then(function(value) {
        //     switch (value) {
        //         case "all":
        //             ajax_training_exercise_action('DELETE', send_data, 'delete all data', training_exercise_id, 'delete_all_data').then(function (data) {
        //                 //console.log(data)
        //                 load_exercises_additional_data(training_exercise_id)
        //             })
        //             break;
        //         case "empty":
        //             ajax_training_exercise_action('DELETE', send_data, 'delete empty data', training_exercise_id, 'delete_empty_data').then(function (data) {
        //                 //console.log(data)
        //                 load_exercises_additional_data(training_exercise_id)
        //             })
        //             break;
        //         default:
        //     }
        // });
    })
    // Редактирование дополнительных данных в упражнении
    $('#training-exercise-additional').on('change', '.edit-input', function (){
        let cur_row = $(this).closest('.exercise-additional-row')
        let exercise_additional_id = cur_row.attr('data-id')

        let send_data = {}
        send_data.additional_id = cur_row.find('[name="additional_id"]').val()
        send_data.note = cur_row.find('[name="note"]').val()
        if(send_data.note){
            cur_row.removeClass('edit-button')
        } else {
            cur_row.addClass('edit-button')
        }

        ajax_training_exercise_data_action('PUT', send_data, 'update data', exercise_additional_id).done(function (data) {
            console.log(data)
            //render_exercises_additional_data(training_exercise_id)
        })
    })

    $('#training-exercise-description .exercise-description').on('change', function () {
        let exs_id = $('.exs-filter-card.active').attr('data-id')
        console.log(exs_id)
        let data = {}
        data.description = $(this).val()
        ajax_training_exercise_action('PUT', data, 'update', exs_id, '').then(function () {

        })
    })

    //Действия со ссылкой на видео тренировки
    $('#training-video-modal .open-link').on('click', function () {
        console.log("open link")
        let url = $('#training-video-modal input[name="video_href"]').val()
        window.open(url, '_blank');
    })
    $('#training-video-modal .copy-link').on('click', function () {
        let url = $('#training-video-modal input[name="video_href"]').val()
        navigator.clipboard.writeText(url);
    })
})

function resize_trainings_card_blocks(){
    let css = "calc(86vh - "+Math.round($('#block-training-info .exercise-data-row').height())+"px - "+Math.round($('.header').height())+"px)"
    //console.log(css)
    $('#block-training-info .carouselSchema').css({"max-height": css})
    $('#block-training-info .carouselSchema').css({"height": css})

}

function show_training_card(id = ''){
    if (id == '' || id == null) {
        $('#training-content').removeClass('d-none')
        console.log('id is empty')
        return false;
    }
    $('#training-content').attr('data-training', id)
    let data_send = {}
    ajax_training_action('GET', data_send, 'view card', id).then(function (data) {
        console.log(data)
        let count_1 = 0, count_2 = 0;
        let html_group_1 = `
                <div class="col px-0">
                    <button data-group="1" class="btn btn-sm btn-block border-white rounded-0 group-filter-card">A</button>
                </div>`
        let html_group_2 = `
                <div class="col px-0">
                    <button data-group="2" class="btn btn-sm btn-block border-white rounded-0 group-filter-card">B</button>
                </div>`
        $.each( data.exercises_info, function( key, value ) {
            if (value.group==1){
                html_group_1 += `
                <div class="col px-0">
                    <button data-id="${value.id}" class="btn btn-sm btn-block border-white rounded-0 exs-filter-card" title="${(get_cur_lang() in value.exercise_name) ? value.exercise_name[get_cur_lang()] : Object.values(value.exercise_name)[0]}">${count_1+1}</button>
                </div>`
                count_1++
            } else if (value.group==2){
                html_group_2 += `
                <div class="col px-0">
                    <button data-id="${value.id}" class="btn btn-sm btn-block border-white rounded-0 exs-filter-card" title="${(get_cur_lang() in value.exercise_name) ? value.exercise_name[get_cur_lang()] : Object.values(value.exercise_name)[0]}">${count_2+1}</button>
                </div>`
                count_2++
            }
        });
        if (count_1<count_2){
            for (let i=0; i < count_2-count_1; i++){
                html_group_1 += `
                <div class="col px-0">
                </div>`
            }
        } else {
            for (let i=0; i < count_1-count_2; i++){
                html_group_2 += `
                <div class="col px-0">
                </div>`
            }
        }
        $('.exercise-list[data-group="1"]').html(html_group_1)
        $('.exercise-list[data-group="2"]').html(html_group_2)

        $('#training-content .group-filter-card[data-group="1"]').click()
        $('#training-content').removeClass('d-none')
    })
}

// Выгрузить упражнений из тренировки
function load_all_exercises_training(training_id = null, group = null) {
    let send_data = {}
    if(group != null) send_data.group = group

    ajax_training_action('GET', send_data, 'view card training', training_id).then(function (data) {
        console.log(data)

        let additionals = data.additional;
        var additional_data = ''
        for (let i = 0; i < 6; i++) {
            console.log(additionals)
            if(additionals!=null && additionals[i]){
                additional_data+=`
                    <div class="row training-additional ${!additionals[i].name && !additionals[i].note ? 'edit-button' : ''} ${!additionals[i].name && !additionals[i].note && !edit_mode ? 'd-none' : ''}">
                        <div class="col-6 px-0 border border-white">
                            <input type="text" name="name_${ i }" placeholder="${ gettext('Title') }" value="${ additionals[i].name ? additionals[i].name : '' }" class="form-control form-control-sm bg-lightgray text-black w-100 p-0 px-3 h-auto text-uppercase text-left rounded-0 edit-input training-additional-data" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                        </div>
                        <div class="col-6 px-0 border-bottom border-dark bg-light">
                            <input type="text" name="note_${ i }" placeholder="${ gettext('Note') }" value="${ additionals[i].note ? additionals[i].note : '' }" class="form-control form-control-sm w-100 p-0 h-auto text-center rounded-0 edit-input training-additional-data" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                        </div>
                    </div>
                `
            } else {
                additional_data+=`
                    <div class="row training-additional edit-button ${!edit_mode ? 'd-none' : ''}">
                        <div class="col-6 px-0 border border-white bg-lightgray text-black text-uppercase text-left">
                            <input type="text" name="name_${ i }" placeholder="${ gettext('Title') }" value="" class="form-control form-control-sm bg-lightgray text-black w-100 p-0 px-3 h-auto text-uppercase text-left rounded-0 edit-input training-additional-data" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                        </div>
                        <div class="col-6 px-0 border-bottom border-dark bg-light">
                            <input type="text" name="note_${ i }" placeholder="${ gettext('Note') }" value="" class="form-control form-control-sm w-100 p-0 h-auto text-center rounded-0 edit-input training-additional-data" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                        </div>
                    </div>
                `
            }
        }
        $('#training-additional-data div').html(additional_data)


        $('#training-main-data [name="date"]').val(data.event_date);
        $('#training-main-data [name="time"]').val(data.event_time);
        $('#training-main-data .team-name').text(data.team_info.name);
        $('#training-main-data .trainer-select').text(data.trainer);
        $('#training-main-data input[name="field_size"]').val(data.field_size)
        $('#training-main-data input[name="load_type"]').val(data.load_type)
        $('#block-training-info input[name="goal"]').val(data.goal)
        $('#training-objectives-data input[name="objective_1"]').val(data.objective_1)
        $('#training-objectives-data input[name="objective_2"]').val(data.objective_2)
        $('#training-video-modal input[name="video_href"]').val(data.video_href)

        let exs_time = 0
        let html_scheme = ''
        html_scheme += `
            <div class="row training-data-row mb-1">
                <div class="col-12 px-0">
                    <input type="text" name="goal" class="btn btn-sm btn-primary btn-block border border-light rounded-0 font-weight-bold text-center edit-input" value="${data.goal ? data.goal : ''}" placeholder="${gettext('Goal')}" ${!edit_mode ? 'disabled' : ''} autocomplete="off">
                </div>
            </div>
            `
        html_scheme += `<div class="row training-info">`
        if (data.exercises_info.length > 0) {
            let exercises = data.exercises_info
            let count_slide = 0
            for (let exercise of exercises) {
                let select_html = '', carousel_html = ''
                exs_time += exercise.duration
                if(exercise.exercise_scheme){
                    if(exercise.exercise_scheme['scheme_1']){
                        select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
                        count_slide++
                        carousel_html+= `
                            <div class="carousel-item active">
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
            }
        }
        html_scheme += `</div>`

        let player_count = 0
        if (data.protocol_info.length > 0) {
            let players = data.protocol_info
            for (let player of players) {
                player_count++
            }
        }


        $('#training-main-data .all-exercise-time').text(exs_time+'`')
        $('#training-main-data .training-players').text(player_count)
        $('#training-main-data .training-goalkeepers').text('---')


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

        $('.training-exercise-name div').html((get_cur_lang() in exercise.exercise_data.title) ? exercise.exercise_data.title[get_cur_lang()] : Object.values(exercise.exercise_data.title)[0])

        $('.training-exercise-description .exercise-time').html(`
            <div class="w-100 ${exercise.duration==0 ? 'font-weight-bold text-danger':''}">${exercise.duration}</div>
        `)
        //$('#training-exercise-description .exercise-description').val(exercise.description)
        let count_slide = 0
        let select_html = '', carousel_html = ''
        if(exercise.exercise_scheme){
            if(exercise.exercise_scheme['scheme_1']){
                select_html += `<li data-target="#carouselTrainingSchema-${exercise.id}" data-slide-to="${count_slide}" class="active"></li>`
                count_slide++
                carousel_html+= `
                    <div class="carousel-item active">
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
            let descr = (get_cur_lang() in exercise.exercise_data.description) ? exercise.exercise_data.description[get_cur_lang()] : Object.values(exercise.exercise_data.description)[0]
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
            $('#training-exercise-description #descriptionExerciseView').html(descr)
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
                    <a class="carousel-control-prev" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="prev" style="margin-left: -12%; width: 12%; background: lightgrey;">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">-</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselTrainingSchema-${exercise.id}" role="button" data-slide="next" style="margin-right: -12%; width: 12%; background: lightgrey;">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">+</span>
                    </a>
                </div>
            </div>
            
        `
        $('#block-training-info').html(html_exs_data)
        if(video_data != null){
            for (let key in video_data) {
                console.log(video_data[key])
                if(video_data[key].links != null){
                    if('nftv' in video_data[key].links && video_data[key].links['nftv']){
                        let videoPlayerExercise = videojs($('#block-training-info').find(`#video-exercise-${key}`)[0], {
                            preload: 'auto',
                            autoplay: false,
                            controls: true,
                            aspectRatio: '16:9',
                        });
                        videoPlayerExercise.poster(`https://213.108.4.28/video/poster/${video_data[key].links['nftv']}`)
                        videoPlayerExercise.src({type: 'video/mp4', src: `https://213.108.4.28/video/player/${video_data[key].links['nftv']}`});
                    } else if ('youtube' in video_data[key].links && video_data[key].links['youtube']){
                        let videoPlayerExercise = videojs($('#block-training-info').get(`#video-exercise-${key}`)[0], {
                            preload: 'auto',
                            autoplay: false,
                            controls: true,
                            aspectRatio: '16:9',
                            sources: [{type: 'video/youtube'}],
                            techOrder: ["youtube"],
                            youtube: { "iv_load_policy": 1, 'modestbranding': 1, 'rel': 0, 'showinfo': 0, 'controls': 0 }
                        });
                        videoPlayerExercise.poster(`https://213.108.4.28/video/poster/${video_data[key].links['youtube']}`)
                        videoPlayerExercise.src({type: 'video/mp4', src: `https://213.108.4.28/video/player/${video_data[key].links['youtube']}`});
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
                <select class="select custom-select p-0 edit-input text-left" name="additional_id" tabindex="-1" aria-hidden="true" ${!edit_mode ? 'disabled' : ''} style="height: 25px; color: black !important;">
                    ${ option_html }
                </select>
            `
            $('#training-exercise-additional').html('')
            let additional_html = ''
            $.each( data.objs, function( key, additional ) {
                additional_html = `
                <div class="row exercise-additional-row ${additional.note ? '' : 'edit-button'} ${!additional.note && !edit_mode ? 'd-none' : ''}" data-id="${additional.id}">
                    <div class="col-5 px-0">
                        ${select}
                    </div>
                    <div class="col px-0">
                        <input type="text" name="note" class="form-control form-control-sm w-100 p-0 h-auto text-center rounded edit-input" value="${additional.note ? additional.note : ''}" autocomplete="off" ${!edit_mode ? 'disabled' : ''}>
                    </div>
                    <div class="col-sm-12 col-md-1 px-0 edit-button ${!edit_mode ? 'd-none' : ''}">
                        <button type="button" class="btn btn-sm btn-block btn-danger rounded-0 p-0 h-100 float-right edit-input delete-exercise-additional" ${!edit_mode ? 'disabled' : ''}><i class="fa fa-trash" aria-hidden="true"></i></button>
                    </div>
                </div>
                `
                $('#training-exercise-additional').append(additional_html)
                $('.exercise-additional-row[data-id="'+additional.id+'"] select').val(additional.additional_id)

            })
        })
    })
}

function hide_training_card() {
    $('#training-content').addClass('d-none')
}

function toggle_training_card() {
    $('#training-content').toggleClass('d-none')
}